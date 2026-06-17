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
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-6 text-sm text-emerald-800 hover:bg-emerald-50">
        <span className="text-2xl">📷</span>
        <span className="font-medium">
          {lang === "bn" ? "প্রেসক্রিপশন ছবি আপলোড করুন" : "Upload prescription image"}
        </span>
        <span className="text-xs text-slate-500">JPG / PNG · max 8 MB</span>
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
          className="max-h-48 rounded-lg border border-slate-200 object-contain"
        />
      )}
      {busy && (
        <div className="text-xs text-slate-500">
          {lang === "bn" ? "OCR চলছে..." : "Running OCR..."}
        </div>
      )}
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
