"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PatientIntake, TriageResult, Vitals } from "./types";

type Store = {
  intake: PatientIntake;
  setIntake: (patch: Partial<PatientIntake>) => void;
  vitals: Vitals;
  setVitals: (patch: Partial<Vitals>) => void;
  result: TriageResult | null;
  setResult: (r: TriageResult | null) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);
const KEY = "ruralcare.session.v1";

const defaults = {
  intake: { language: "en" as const },
  vitals: {},
  result: null as TriageResult | null,
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [intake, setIntakeState] = useState<PatientIntake>(defaults.intake);
  const [vitals, setVitalsState] = useState<Vitals>(defaults.vitals);
  const [result, setResult] = useState<TriageResult | null>(defaults.result);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.intake) setIntakeState(p.intake);
        if (p.vitals) setVitalsState(p.vitals);
        if (p.result) setResult(p.result);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ intake, vitals, result }));
    } catch {}
  }, [intake, vitals, result]);

  const value = useMemo<Store>(
    () => ({
      intake,
      setIntake: (patch) => setIntakeState((p) => ({ ...p, ...patch })),
      vitals,
      setVitals: (patch) => setVitalsState((p) => ({ ...p, ...patch })),
      result,
      setResult,
      reset: () => {
        setIntakeState(defaults.intake);
        setVitalsState(defaults.vitals);
        setResult(null);
      },
    }),
    [intake, vitals, result]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be inside SessionProvider");
  return ctx;
}
