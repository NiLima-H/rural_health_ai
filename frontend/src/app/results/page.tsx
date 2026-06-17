"use client";

import Link from "next/link";
import { useSession } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { SeverityCard } from "@/components/SeverityCard";

export default function ResultsPage() {
  const { result, intake, vitals, reset } = useSession();
  const { lang } = useLang();

  if (!result) {
    return (
      <div className="glass p-10 text-center shadow-2xl">
        <div className="text-5xl">🩺</div>
        <h1 className="mt-3 gradient-text text-2xl font-bold">
          {lang === "bn" ? "এখনও কোনো ফলাফল নেই" : "No triage result yet"}
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          {lang === "bn"
            ? "রোগীর তথ্য ও স্বাস্থ্য পরীক্ষা পূরণ করে ট্রায়াজ চালান।"
            : "Complete patient info and vitals, then run triage."}
        </p>
        <Link href="/vitals" className="btn-primary mt-5 inline-block">
          {lang === "bn" ? "স্বাস্থ্য পরীক্ষায় যান →" : "Go to Vitals →"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-dark flex flex-wrap items-center justify-between gap-3 p-6 shadow-2xl">
        <h1 className="gradient-text text-3xl font-bold">
          {lang === "bn" ? "ট্রায়াজ ফলাফল" : "Triage results"}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-ghost">
            {lang === "bn" ? "প্রিন্ট / PDF" : "Print / PDF"}
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-red-300/60 bg-red-50/70 px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm backdrop-blur-md transition hover:bg-red-100"
          >
            {lang === "bn" ? "নতুন রোগী" : "New patient"}
          </button>
        </div>
      </div>

      <SeverityCard result={result} />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass p-5 shadow-2xl">
          <h2 className="section-title mb-3">
            {lang === "bn" ? "সম্ভাব্য রোগ নির্ণয়" : "Suggested diagnoses"}
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-800">
            {result.diagnosisSuggestions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="glass p-5 shadow-2xl">
          <h2 className="section-title mb-3">
            {lang === "bn" ? "প্রাথমিক চিকিৎসা" : "First aid advice"}
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-800">
            {result.firstAid.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="glass p-5 shadow-2xl">
        <h2 className="section-title mb-3">
          {lang === "bn" ? "রেফারেল সুপারিশ" : "Referral recommendation"}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 px-3 py-1 font-semibold text-white shadow">
            {result.referral.level.replace("_", " ")}
          </span>
          {result.referral.facility && (
            <span className="text-slate-800">→ {result.referral.facility}</span>
          )}
        </div>
        <p className="mt-3 text-sm text-slate-700">{result.referral.rationale}</p>
      </section>

      <section className="glass p-5 shadow-2xl">
        <h2 className="section-title mb-3">
          {lang === "bn" ? "চিকিৎসা সত্তা" : "Extracted medical entities"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {result.entities.map((e, i) => (
            <span
              key={i}
              className="rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs text-slate-800 shadow-sm backdrop-blur-md"
            >
              {e.symptom}
              {e.duration ? ` · ${e.duration}` : ""}
              {e.severity ? ` · ${e.severity}` : ""}
            </span>
          ))}
        </div>
      </section>

      <details className="glass p-5 text-sm shadow-2xl">
        <summary className="cursor-pointer font-semibold text-slate-700">
          {lang === "bn" ? "কাঁচা ইনপুট" : "Raw intake & vitals"}
        </summary>
        <pre className="mt-3 overflow-auto rounded-lg border border-white/40 bg-white/70 p-3 text-xs text-slate-800">
{JSON.stringify({ intake, vitals, generatedAt: result.generatedAt }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
