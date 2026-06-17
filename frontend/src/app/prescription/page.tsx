"use client";

import { useSession } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { ImageUploader } from "@/components/ImageUploader";

export default function PrescriptionPage() {
  const { intake, setIntake } = useSession();
  const { lang } = useLang();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        {lang === "bn" ? "প্রেসক্রিপশন / রিপোর্ট স্ক্যান" : "Prescription / report scan"}
      </h1>
      <p className="text-sm text-slate-500">
        {lang === "bn"
          ? "পুরনো প্রেসক্রিপশন বা রিপোর্টের ছবি আপলোড করুন — OCR থেকে পাওয়া টেক্সট মূল সমস্যার সাথে যুক্ত হবে।"
          : "Upload a photo of a previous prescription or report. OCR text is appended to the chief complaint for richer triage context."}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <ImageUploader
          onExtracted={(text, entities) => {
            const merged = [intake.chiefComplaintText, text].filter(Boolean).join("\n\n");
            const meds = (intake.comorbidities || []).concat(entities);
            setIntake({
              chiefComplaintText: merged,
              comorbidities: Array.from(new Set(meds)),
            });
          }}
        />
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-600">
            {lang === "bn" ? "সংকলিত টেক্সট" : "Consolidated text"}
          </h2>
          <pre
            className={`max-h-80 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 ${
              lang === "bn" ? "bn" : ""
            }`}
          >
            {intake.chiefComplaintText || "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}
