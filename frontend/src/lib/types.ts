export type Severity = "GREEN" | "YELLOW" | "RED" | "BLACK";

export type Vitals = {
  heartRate?: number; // bpm
  systolic?: number; // mmHg
  diastolic?: number; // mmHg
  spo2?: number; // %
  temperatureC?: number; // °C
  respiratoryRate?: number; // breaths/min
  bloodGlucose?: number; // mg/dL (random)
};

export type PatientIntake = {
  name?: string;
  age?: number;
  sex?: "male" | "female" | "other";
  phone?: string;
  village?: string;
  language: "en" | "bn";
  chiefComplaintText?: string;
  chiefComplaintAudioUrl?: string;
  durationDays?: number;
  comorbidities?: string[];
  pregnancy?: boolean;
};

export type TriageResult = {
  severity: Severity;
  confidence: number; // 0..1
  diagnosisSuggestions: string[];
  firstAid: string[];
  referral: {
    level: "self_care" | "primary_clinic" | "district_hospital" | "icu";
    facility?: string;
    rationale: string;
  };
  entities: { symptom: string; duration?: string; severity?: string }[];
  rationale: string;
  warnings: string[];
  generatedAt: string;
};
