"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { VoiceRecorder } from "@/components/VoiceRecorder";

export default function Home() {
  const { intake, setIntake } = useSession();
  const { lang } = useLang();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <section className="glass-dark p-8 shadow-2xl">
        <h1 className="text-3xl font-bold tracking-wide md:text-4xl gradient-text">
          {lang === "bn" ? "গ্রামীণ স্বাস্থ্য ট্রায়াজ" : "RuralCare Triage"}
        </h1>
        <p className="mt-3 max-w-2xl text-indigo-100/90 leading-relaxed">
          {lang === "bn"
            ? "রোগীর তথ্য, কণ্ঠস্বর, প্রেসক্রিপশন ও স্বাস্থ্য পরীক্ষার ভিত্তিতে AI-চালিত ট্রায়াজ।"
            : "AI-driven triage using patient history, voice, prescriptions, and vitals — built for rural clinics in Bangladesh and beyond."}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass p-6">
          <h2 className="mb-4 text-lg font-bold tracking-wide text-slate-800">
            {lang === "bn" ? "রোগীর তথ্য" : "Patient Information"}
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field
              label={lang === "bn" ? "নাম" : "Name"}
              value={intake.name || ""}
              onChange={(v) => setIntake({ name: v })}
            />
            <Field
              label={lang === "bn" ? "বয়স" : "Age"}
              type="number"
              value={intake.age ?? ""}
              onChange={(v) => setIntake({ age: v ? Number(v) : undefined })}
            />
            <Field
              label={lang === "bn" ? "মোবাইল" : "Phone"}
              value={intake.phone || ""}
              onChange={(v) => setIntake({ phone: v })}
            />
            <Field
              label={lang === "bn" ? "গ্রাম" : "Village"}
              value={intake.village || ""}
              onChange={(v) => setIntake({ village: v })}
            />
            <div className="col-span-2">
              <label className="label">
                {lang === "bn" ? "লিঙ্গ" : "Sex"}
              </label>
              <select
                value={intake.sex || ""}
                onChange={(e) =>
                  setIntake({ sex: (e.target.value || undefined) as any })
                }
                className="field"
              >
                <option value="">—</option>
                <option value="male">{lang === "bn" ? "পুরুষ" : "Male"}</option>
                <option value="female">{lang === "bn" ? "মহিলা" : "Female"}</option>
                <option value="other">{lang === "bn" ? "অন্যান্য" : "Other"}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="mb-4 text-lg font-bold tracking-wide text-slate-800">
            {lang === "bn" ? "প্রধান সমস্যা" : "Chief Complaint"}
          </h2>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {lang === "bn" ? "লিখুন বা বলুন" : "Type or speak"}
            </label>
            <VoiceRecorder
              onTranscript={(t) => setIntake({ chiefComplaintText: t })}
            />
          </div>
          <textarea
            value={intake.chiefComplaintText || ""}
            onChange={(e) => setIntake({ chiefComplaintText: e.target.value })}
            rows={5}
            placeholder={
              lang === "bn"
                ? "যেমন: ৩ দিন ধরে জ্বর ও কাশি..."
                : "e.g., Fever and cough for 3 days..."
            }
            className={`field ${lang === "bn" ? "bn" : ""}`}
          />
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Field
              label={lang === "bn" ? "কত দিন ধরে" : "Duration (days)"}
              type="number"
              value={intake.durationDays ?? ""}
              onChange={(v) =>
                setIntake({ durationDays: v ? Number(v) : undefined })
              }
            />
            <Field
              label={lang === "bn" ? "গর্ভবতী?" : "Pregnant?"}
              value={
                intake.pregnancy === undefined
                  ? ""
                  : intake.pregnancy
                  ? lang === "bn"
                    ? "হ্যাঁ"
                    : "Yes"
                  : lang === "bn"
                  ? "না"
                  : "No"
              }
              onChange={(v) =>
                setIntake({
                  pregnancy:
                    v.toLowerCase().startsWith("y") || v === "হ্যাঁ"
                      ? true
                      : v.toLowerCase().startsWith("n") || v === "না"
                      ? false
                      : undefined,
                })
              }
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push("/vitals")}
          className="btn-primary"
        >
          {lang === "bn" ? "পরবর্তী: স্বাস্থ্য পরীক্ষা →" : "Next: Vitals →"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field"
      />
    </label>
  );
}
