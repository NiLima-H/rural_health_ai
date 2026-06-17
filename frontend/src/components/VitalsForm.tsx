"use client";

import { useState } from "react";
import { Vitals } from "@/lib/types";
import { analyzeVitals, levelClass } from "@/lib/vitals";
import { useLang } from "@/lib/i18n";

type Props = {
  value: Vitals;
  onChange: (v: Vitals) => void;
  onSubmit?: () => void;
};

const fields: { key: keyof Vitals; label: string; labelBn: string; unit: string; min: number; max: number; step: number }[] = [
  { key: "heartRate", label: "Heart rate", labelBn: "হৃদস্পন্দন", unit: "bpm", min: 20, max: 240, step: 1 },
  { key: "systolic", label: "Systolic BP", labelBn: "সিস্টোলিক", unit: "mmHg", min: 40, max: 260, step: 1 },
  { key: "diastolic", label: "Diastolic BP", labelBn: "ডায়াস্টোলিক", unit: "mmHg", min: 20, max: 180, step: 1 },
  { key: "spo2", label: "SpO₂", labelBn: "অক্সিজেন", unit: "%", min: 50, max: 100, step: 1 },
  { key: "temperatureC", label: "Temperature", labelBn: "তাপমাত্রা", unit: "°C", min: 30, max: 45, step: 0.1 },
  { key: "respiratoryRate", label: "Resp. rate", labelBn: "শ্বাসের হার", unit: "/min", min: 4, max: 60, step: 1 },
  { key: "bloodGlucose", label: "Glucose (random)", labelBn: "গ্লুকোজ", unit: "mg/dL", min: 30, max: 700, step: 1 },
];

export function VitalsForm({ value, onChange, onSubmit }: Props) {
  const { lang } = useLang();
  const flags = analyzeVitals(value);

  function set<K extends keyof Vitals>(k: K, raw: string) {
    const num = raw === "" ? undefined : Number(raw);
    onChange({ ...value, [k]: num as Vitals[K] });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => {
          const flag = flags.find((x) => x.field === f.key);
          return (
            <label
              key={f.key}
              className={`rounded-lg border bg-white p-3 text-sm shadow-sm transition ${
                flag ? levelClass(flag.level) : "border-slate-200"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">
                  {lang === "bn" ? f.labelBn : f.label}
                </span>
                <span className="text-xs text-slate-400">{f.unit}</span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step={f.step}
                min={f.min}
                max={f.max}
                value={value[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full bg-transparent text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-300"
                placeholder="—"
              />
              {flag && (
                <div className="mt-1 text-xs leading-snug">{flag.message}</div>
              )}
            </label>
          );
        })}
      </div>

      {onSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
        >
          {lang === "bn" ? "ট্রায়াজ চালান" : "Run triage"} →
        </button>
      )}
    </div>
  );
}
