"use client";

import { useSession } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { ImageUploader } from "@/components/ImageUploader";

export default function PrescriptionPage() {
  const { intake, setIntake } = useSession();
  const { lang } = useLang();

  return (
    <div className="space-y-6">
      <div className="card-strong p-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest">
          {lang === "bn" ? "প্রেসক্রিপশন / রিপোর্ট স্ক্যান" : "Prescription / report scan"}
        </h1>
        <p className="mt-1 text-sm opacity-80">
          {lang === "bn"
            ? "পুরনো প্রেসক্রিপশন বা রিপোর্টের ছবি আপলোড করুন — OCR থেকে পাওয়া টেক্সট মূল সমস্যার সাথে যুক্ত হবে।"
            : "Upload a photo of a previous prescription or report. OCR text is appended to the chief complaint for richer triage context."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
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
        </div>
        <div className="card p-6">
          <h2 className="section-title">
            {lang === "bn" ? "সংকলিত টেক্সট" : "Consolidated text"}
          </h2>
          <pre
            className={`max-h-80 overflow-auto rounded-lg border border-line bg-white p-3 text-xs leading-relaxed text-ink ${
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
