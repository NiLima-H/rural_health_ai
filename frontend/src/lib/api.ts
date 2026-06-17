import { PatientIntake, TriageResult, Vitals } from "./types";

const TOKEN_KEY = "ruralcare.token.v1";

// Same-origin fallback works on Vercel/Render when both services share a host
// (e.g. via a reverse proxy). For separate hosts, set NEXT_PUBLIC_API_BASE.
const BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (typeof window !== "undefined" ? window.location.origin : "");

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  baseUrl: BASE,

  health: () => jsonFetch<{ ok: boolean }>("/health"),

  login: async (username: string, password: string) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Login failed (${res.status}): ${body}`);
    }
    return (await res.json()) as {
      access_token: string;
      user: { username: string; full_name: string | null; role: string };
    };
  },

  me: () => jsonFetch<{ username: string; full_name: string | null; role: string }>("/auth/me"),

  transcribe: async (file: Blob, lang: "en" | "bn" = "en") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("lang", lang);
    const res = await fetch(`${BASE}/transcribe`, {
      method: "POST",
      headers: authHeaders(),
      body: fd,
    });
    if (!res.ok) throw new Error(`transcribe ${res.status}`);
    return (await res.json()) as { text: string; language: string };
  },

  ocr: async (file: Blob) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/ocr`, {
      method: "POST",
      headers: authHeaders(),
      body: fd,
    });
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