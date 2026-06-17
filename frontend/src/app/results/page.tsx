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
      <div className="card p-10 text-center">
        <div className="text-5xl">🩺</div>
        <h1 className="mt-3 text-2xl font-bold uppercase tracking-widest text-ink">
          {lang === "bn" ? "এখনও কোনো ফলাফল নেই" : "No triage result yet"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {lang === "bn"
            ? "রোগীর তথ্য ও স্বাস্থ্য পরীক্ষা পূরণ করে ট্রায়াজ চালান।"
            : "Complete patient info and vitals, then run triage."}
        </p>
        <Link href="/vitals" className="btn-primary mt-5 inline-flex">
          {lang === "bn" ? "স্বাস্থ্য পরীক্ষায় যান →" : "Go to Vitals →"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card-strong flex flex-wrap items-center justify-between gap-3 p-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest">
          {lang === "bn" ? "ট্রায়াজ ফলাফল" : "Triage results"}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-ghost">
            {lang === "bn" ? "প্রিন্ট / PDF" : "Print / PDF"}
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:bg-ink hover:text-bg"
          >
            {lang === "bn" ? "নতুন রোগী" : "New patient"}
          </button>
        </div>
      </div>

      <SeverityCard result={result} />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="section-title">
            {lang === "bn" ? "সম্ভাব্য রোগ নির্ণয়" : "Suggested diagnoses"}
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-ink">
            {result.diagnosisSuggestions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="section-title">
            {lang === "bn" ? "প্রাথমিক চিকিৎসা" : "First aid advice"}
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-ink">
            {result.firstAid.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="section-title">
          {lang === "bn" ? "রেফারেল সুপারিশ" : "Referral recommendation"}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="chip chip-solid">
            {result.referral.level.replace("_", " ")}
          </span>
          {result.referral.facility && (
            <span className="text-ink">→ {result.referral.facility}</span>
          )}
        </div>
        <p className="mt-3 text-sm text-ink-soft">{result.referral.rationale}</p>
      </section>

      <section className="card p-5">
        <h2 className="section-title">
          {lang === "bn" ? "চিকিৎসা সত্তা" : "Extracted medical entities"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {result.entities.map((e, i) => (
            <span key={i} className="chip">
              {e.symptom}
              {e.duration ? ` · ${e.duration}` : ""}
              {e.severity ? ` · ${e.severity}` : ""}
            </span>
          ))}
        </div>
      </section>

      <details className="card p-5 text-sm">
        <summary className="cursor-pointer font-bold text-ink">
          {lang === "bn" ? "কাঁচা ইনপুট" : "Raw intake & vitals"}
        </summary>
        <pre className="mt-3 overflow-auto rounded-lg border border-line bg-white p-3 text-xs text-ink">
{JSON.stringify({ intake, vitals, generatedAt: result.generatedAt }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
