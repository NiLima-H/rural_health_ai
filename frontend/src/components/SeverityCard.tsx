"use client";

import { TriageResult } from "@/lib/types";
import { SEVERITY_META } from "@/lib/severity";
import { useLang } from "@/lib/i18n";

type Props = { result: TriageResult };

const SEVERITY_BAR: Record<string, string> = {
  GREEN: "bg-emerald-700",
  YELLOW: "bg-amber-500",
  RED: "bg-red-700",
  BLACK: "bg-slate-900",
};

const SEVERITY_RING: Record<string, string> = {
  GREEN: "border-emerald-700",
  YELLOW: "border-amber-500",
  RED: "border-red-700",
  BLACK: "border-slate-900",
};

export function SeverityCard({ result }: Props) {
  const { lang } = useLang();
  const meta = SEVERITY_META[result.severity];
  const bar = SEVERITY_BAR[result.severity] ?? "bg-ink";
  const ring = SEVERITY_RING[result.severity] ?? "border-ink";

  return (
    <div className={`card border-2 ${ring} p-6`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-10 w-1.5 rounded-sm ${bar}`}
            aria-hidden
          />
          <div>
            <div className="label !mb-0">
              {lang === "bn" ? "তীব্রতা স্তর" : "Severity level"}
            </div>
            <div className={`text-2xl font-bold ${meta.color}`}>
              {lang === "bn" ? meta.bn : meta.en}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="label !mb-0">
            {lang === "bn" ? "আত্মবিশ্বাস" : "Confidence"}
          </div>
          <div className="text-2xl font-bold text-ink">
            {Math.round(result.confidence * 100)}%
          </div>
        </div>
      </div>

      <hr className="divider my-4" />

      <p className="text-sm leading-relaxed text-ink-soft">
        {result.rationale}
      </p>

      {result.warnings.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs text-ink-soft">
          {result.warnings.map((w, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-bold text-ink">⚠</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
