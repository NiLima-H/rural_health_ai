"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { VitalsForm } from "@/components/VitalsForm";
import { api } from "@/lib/api";
import { useState } from "react";

export default function VitalsPage() {
  const { intake, vitals, setVitals, setResult } = useSession();
  const { lang } = useLang();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const r = await api.triage({ ...intake, language: lang }, vitals);
      setResult(r);
      router.push("/results");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        {lang === "bn" ? "স্বাস্থ্য পরীক্ষা" : "Vitals"}
      </h1>
      <p className="text-sm text-slate-500">
        {lang === "bn"
          ? "প্রাপ্ত মানগুলো লিখুন। অস্বাভাবিক মান স্বয়ংক্রিয়ভাবে চিহ্নিত হবে।"
          : "Enter measured values. Out-of-range values are flagged automatically."}
      </p>

      <VitalsForm value={vitals} onChange={setVitals} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← {lang === "bn" ? "রোগীর তথ্য" : "Patient info"}
        </button>
        <button
          onClick={run}
          disabled={busy}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy
            ? lang === "bn"
              ? "চলছে..."
              : "Running..."
            : lang === "bn"
            ? "ট্রায়াজ চালান →"
            : "Run triage →"}
        </button>
      </div>
    </div>
  );
}
