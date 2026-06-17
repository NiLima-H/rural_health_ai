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
      <div className="glass-dark p-6 shadow-2xl">
        <h1 className="gradient-text text-3xl font-bold">
          {lang === "bn" ? "স্বাস্থ্য পরীক্ষা" : "Vitals"}
        </h1>
        <p className="mt-1 text-sm text-indigo-100/80">
          {lang === "bn"
            ? "প্রাপ্ত মানগুলো লিখুন। অস্বাভাবিক মান স্বয়ংক্রিয়ভাবে চিহ্নিত হবে।"
            : "Enter measured values. Out-of-range values are flagged automatically."}
        </p>
      </div>

      <div className="glass p-6 shadow-2xl">
        <VitalsForm value={vitals} onChange={setVitals} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200/60 bg-red-50/80 p-3 text-sm text-red-700 shadow-sm backdrop-blur-md">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-slate-200/80 hover:text-white"
        >
          ← {lang === "bn" ? "রোগীর তথ্য" : "Patient info"}
        </button>
        <button onClick={run} disabled={busy} className="btn-primary disabled:opacity-50">
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
