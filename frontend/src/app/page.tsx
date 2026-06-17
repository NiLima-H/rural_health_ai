"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { AuthGuard } from "@/components/AuthGuard";

export default function HomePage() {
  const { intake, setIntake } = useSession();
  const { lang } = useLang();
  const router = useRouter();
  const [text, setText] = useState(intake.chiefComplaintText);

  function next() {
    setIntake({ ...intake, chiefComplaintText: text });
    router.push("/vitals");
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="card-strong p-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest">
          {lang === "bn" ? "রোগীর তথ্য" : "Patient Intake"}
        </h1>
        <p className="mt-1 text-sm opacity-80">
          {lang === "bn"
            ? "প্রাথমিক তথ্য ও মূল সমস্যা লিখুন — পরবর্তী ধাপে স্বাস্থ্য পরীক্ষা নেওয়া হবে।"
            : "Enter basic information and chief complaint — vitals come next."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="section-title">
            {lang === "bn" ? "রোগী" : "Patient"}
          </h2>
          <div className="grid gap-3">
            <div>
              <label className="label">
                {lang === "bn" ? "নাম" : "Name"}
              </label>
              <input
                className="field"
                value={intake.name ?? ""}
                onChange={(e) =>
                  setIntake({ ...intake, name: e.target.value })
                }
                placeholder={lang === "bn" ? "ঐচ্ছিক" : "optional"}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  {lang === "bn" ? "বয়স" : "Age"}
                </label>
                <input
                  type="number"
                  className="field"
                  value={intake.age ?? ""}
                  onChange={(e) =>
                    setIntake({
                      ...intake,
                      age: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="—"
                />
              </div>
              <div>
                <label className="label">
                  {lang === "bn" ? "লিঙ্গ" : "Sex"}
                </label>
                <select
                  className="field"
                  value={intake.sex ?? ""}
                  onChange={(e) =>
                    setIntake({
                      ...intake,
                      sex: (e.target.value || undefined) as
                        | "male"
                        | "female"
                        | "other"
                        | undefined,
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="male">
                    {lang === "bn" ? "পুরুষ" : "Male"}
                  </option>
                  <option value="female">
                    {lang === "bn" ? "নারী" : "Female"}
                  </option>
                  <option value="other">
                    {lang === "bn" ? "অন্যান্য" : "Other"}
                  </option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">
                {lang === "bn" ? "অন্য রোগ" : "Comorbidities"}
              </label>
              <input
                className="field"
                value={(intake.comorbidities ?? []).join(", ")}
                onChange={(e) =>
                  setIntake({
                    ...intake,
                    comorbidities: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={
                  lang === "bn"
                    ? "যেমন: ডায়াবেটিস, উচ্চ রক্তচাপ"
                    : "e.g. diabetes, hypertension"
                }
              />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="section-title">
            {lang === "bn" ? "মূল সমস্যা" : "Chief complaint"}
          </h2>
          <div className="space-y-3">
            <textarea
              className={`field min-h-32 ${lang === "bn" ? "bn" : ""}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                lang === "bn"
                  ? "রোগীর সমস্যা লিখুন (বাংলায় বা ইংরেজিতে)..."
                  : "Describe the patient's problem (Bengali or English)..."
              }
            />
            <VoiceRecorder
              onTranscript={(t) => setText((prev) => (prev ? prev + "\n" + t : t))}
            />
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button onClick={next} className="btn-primary">
          {lang === "bn" ? "পরবর্তী: স্বাস্থ্য পরীক্ষা" : "Next: Vitals"} →
        </button>
      </div>
      </div>
    </AuthGuard>
  );
}
