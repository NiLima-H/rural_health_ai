"use client";

import { TriageResult } from "@/lib/types";
import { SEVERITY_META } from "@/lib/severity";
import { useLang } from "@/lib/i18n";

type Props = { result: TriageResult };

export function SeverityCard({ result }: Props) {
  const { lang } = useLang();
  const meta = SEVERITY_META[result.severity];

  return (
    <div className={`rounded-2xl border-2 ${meta.ring} ${meta.bg} p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {lang === "bn" ? "তীব্রতা স্তর" : "Severity level"}
          </div>
          <div className={`text-2xl font-bold ${meta.color}`}>
            {lang === "bn" ? meta.bn : meta.en}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-slate-500">
            {lang === "bn" ? "আত্মবিশ্বাস" : "Confidence"}
          </div>
          <div className="text-xl font-semibold text-slate-800">
            {Math.round(result.confidence * 100)}%
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-700">{result.rationale}</p>

      {result.warnings.length > 0 && (
        <ul className="mt-3 list-inside list-disc text-xs text-slate-700">
          {result.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
