"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "bn";

type Dict = Record<string, { en: string; bn: string }>;

const dict: Dict = {
  app_title: { en: "RuralCare Triage", bn: "গ্রামীণ স্বাস্থ্য ট্রায়াজ" },
  app_tagline: {
    en: "AI-powered multilingual triage for rural clinics",
    bn: "গ্রামীণ ক্লিনিকের জন্য এআই-চালিত বহুভাষিক ট্রায়াজ",
  },
  nav_intake: { en: "Intake", bn: "রোগী ভর্তি" },
  nav_vitals: { en: "Vitals", bn: "স্বাস্থ্য পরীক্ষা" },
  nav_prescription: { en: "Prescription", bn: "প্রেসক্রিপশন" },
  nav_results: { en: "Results", bn: "ফলাফল" },
  start: { en: "Start assessment", bn: "মূল্যায়ন শুরু করুন" },
  // ...more entries added as features grow
  severity_green: { en: "Green — Routine care", bn: "সবুজ — সাধারণ যত্ন" },
  severity_yellow: { en: "Yellow — Urgent", bn: "হলুদ — জরুরি" },
  severity_red: { en: "Red — Emergency", bn: "লাল — জরুরীকালীন" },
  severity_black: { en: "Black — Expectant / Deceased", bn: "কালো — মৃত/অপেক্ষমাণ" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof typeof dict) => string;
  bn: (cond: boolean) => string; // helper: returns bn class when true
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    if (saved === "en" || saved === "bn") setLang(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("lang", lang);
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (k) => dict[k]?.[lang] ?? String(k),
      bn: (cond) => (cond ? "bn" : ""),
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
