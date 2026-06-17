"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type Props = {
  onExtracted: (text: string, entities: string[]) => void;
};

export function ImageUploader({ onExtracted }: Props) {
  const { lang } = useLang();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const { text, entities } = await api.ocr(file);
      onExtracted(text, entities);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300/70 bg-white/40 p-8 text-sm text-indigo-800 shadow-sm backdrop-blur-md transition hover:border-indigo-500 hover:bg-white/60">
        <span className="text-3xl">📷</span>
        <span className="text-base font-semibold">
          {lang === "bn" ? "প্রেসক্রিপশন ছবি আপলোড করুন" : "Upload prescription image"}
        </span>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          JPG / PNG · max 8 MB
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
        />
      </label>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="prescription"
          className="max-h-48 rounded-lg border border-white/40 bg-white/60 object-contain p-2 shadow"
        />
      )}
      {busy && (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
          {lang === "bn" ? "OCR চলছে..." : "Running OCR..."}
        </div>
      )}
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
