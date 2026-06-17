import { PatientIntake, TriageResult, Vitals } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  health: () => jsonFetch<{ ok: boolean }>("/health"),

  transcribe: async (file: Blob, lang: "en" | "bn" = "en") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("lang", lang);
    const res = await fetch(`${BASE}/transcribe`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`transcribe ${res.status}`);
    return (await res.json()) as { text: string; language: string };
  },

  ocr: async (file: Blob) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/ocr`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`ocr ${res.status}`);
    return (await res.json()) as { text: string; entities: string[] };
  },

  triage: (intake: PatientIntake, vitals: Vitals) =>
    jsonFetch<TriageResult>("/triage", {
      method: "POST",
      body: JSON.stringify({ intake, vitals }),
    }),

  reportUrl: (id: string) => `${BASE}/report/${id}.pdf`,
};