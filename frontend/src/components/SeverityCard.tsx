"use client";

import { TriageResult } from "@/lib/types";
import { SEVERITY_META } from "@/lib/severity";
import { useLang } from "@/lib/i18n";

type Props = { result: TriageResult };

const SEVERITY_CHIP: Record<string, string> = {
  GREEN: "from-emerald-400 to-teal-500",
  YELLOW: "from-amber-400 to-orange-500",
  RED: "from-rose-500 to-red-700",
  BLACK: "from-slate-500 to-slate-800",
};

export function SeverityCard({ result }: Props) {
  const { lang } = useLang();
  const meta = SEVERITY_META[result.severity];
  const chip = SEVERITY_CHIP[result.severity] ?? "from-indigo-500 to-teal-500";

  return (
    <div className="glass p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-10 w-1.5 rounded-full bg-gradient-to-b ${chip}`}
            aria-hidden
          />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {lang === "bn" ? "তীব্রতা স্তর" : "Severity level"}
            </div>
            <div className={`text-2xl font-bold ${meta.color}`}>
              {lang === "bn" ? meta.bn : meta.en}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {lang === "bn" ? "আত্মবিশ্বাস" : "Confidence"}
          </div>
          <div className="gradient-text text-2xl font-bold">
            {Math.round(result.confidence * 100)}%
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        {result.rationale}
      </p>

      {result.warnings.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-white/40 pt-3 text-xs text-slate-700">
          {result.warnings.map((w, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-amber-600">⚠</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
