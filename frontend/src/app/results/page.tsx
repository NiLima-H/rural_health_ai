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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="text-4xl">🩺</div>
        <h1 className="mt-3 text-xl font-semibold text-slate-800">
          {lang === "bn" ? "এখনও কোনো ফলাফল নেই" : "No triage result yet"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {lang === "bn"
            ? "রোগীর তথ্য ও স্বাস্থ্য পরীক্ষা পূরণ করে ট্রায়াজ চালান।"
            : "Complete patient info and vitals, then run triage."}
        </p>
        <Link
          href="/vitals"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow"
        >
          {lang === "bn" ? "স্বাস্থ্য পরীক্ষায় যান →" : "Go to Vitals →"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          {lang === "bn" ? "ট্রায়াজ ফলাফল" : "Triage results"}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
          >
            {lang === "bn" ? "প্রিন্ট / PDF" : "Print / PDF"}
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 shadow-sm hover:bg-red-100"
          >
            {lang === "bn" ? "নতুন রোগী" : "New patient"}
          </button>
        </div>
      </div>

      <SeverityCard result={result} />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">
            {lang === "bn" ? "সম্ভাব্য রোগ নির্ণয়" : "Suggested diagnoses"}
          </h2>
          <ul className="list-inside list-disc text-sm text-slate-800">
            {result.diagnosisSuggestions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">
            {lang === "bn" ? "প্রাথমিক চিকিৎসা" : "First aid advice"}
          </h2>
          <ul className="list-inside list-disc text-sm text-slate-800">
            {result.firstAid.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">
          {lang === "bn" ? "রেফারেল সুপারিশ" : "Referral recommendation"}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">
            {result.referral.level.replace("_", " ")}
          </span>
          {result.referral.facility && (
            <span className="text-slate-700">→ {result.referral.facility}</span>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-600">{result.referral.rationale}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">
          {lang === "bn" ? "চিকিৎসা সত্তা" : "Extracted medical entities"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {result.entities.map((e, i) => (
            <span
              key={i}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
            >
              {e.symptom}
              {e.duration ? ` · ${e.duration}` : ""}
              {e.severity ? ` · ${e.severity}` : ""}
            </span>
          ))}
        </div>
      </section>

      <details className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
        <summary className="cursor-pointer font-semibold text-slate-600">
          {lang === "bn" ? "কাঁচা ইনপুট" : "Raw intake & vitals"}
        </summary>
        <pre className="mt-3 overflow-auto text-xs text-slate-700">
{JSON.stringify({ intake, vitals, generatedAt: result.generatedAt }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
