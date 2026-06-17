import { Vitals } from "./types";

export type VitalsFlag = {
  field: keyof Vitals;
  level: "info" | "warn" | "danger";
  message: string;
};

const inRange = (v: number, lo: number, hi: number) => v >= lo && v <= hi;

// Adult defaults (extend per-age as needed).
export function analyzeVitals(v: Vitals): VitalsFlag[] {
  const flags: VitalsFlag[] = [];
  if (v.heartRate !== undefined) {
    if (v.heartRate < 40 || v.heartRate > 140)
      flags.push({
        field: "heartRate",
        level: "danger",
        message: `Heart rate ${v.heartRate} bpm is critical.`,
      });
    else if (!inRange(v.heartRate, 60, 110))
      flags.push({
        field: "heartRate",
        level: "warn",
        message: `Heart rate ${v.heartRate} bpm is outside normal range (60–110).`,
      });
  }
  if (v.systolic !== undefined && v.diastolic !== undefined) {
    if (v.systolic >= 180 || v.diastolic >= 120 || v.systolic < 80)
      flags.push({
        field: "systolic",
        level: "danger",
        message: `BP ${v.systolic}/${v.diastolic} suggests hypertensive crisis or shock.`,
      });
    else if (!inRange(v.systolic, 90, 140) || !inRange(v.diastolic, 60, 90))
      flags.push({
        field: "systolic",
        level: "warn",
        message: `BP ${v.systolic}/${v.diastolic} is outside normal range.`,
      });
  }
  if (v.spo2 !== undefined) {
    if (v.spo2 < 90)
      flags.push({
        field: "spo2",
        level: "danger",
        message: `SpO₂ ${v.spo2}% — severe hypoxemia, give oxygen immediately.`,
      });
    else if (v.spo2 < 94)
      flags.push({
        field: "spo2",
        level: "warn",
        message: `SpO₂ ${v.spo2}% is low, monitor closely.`,
      });
  }
  if (v.temperatureC !== undefined) {
    if (v.temperatureC >= 40 || v.temperatureC <= 35)
      flags.push({
        field: "temperatureC",
        level: "danger",
        message: `Temperature ${v.temperatureC}°C is critical.`,
      });
    else if (v.temperatureC >= 38)
      flags.push({
        field: "temperatureC",
        level: "warn",
        message: `Fever ${v.temperatureC}°C — consider antipyretics and cause work-up.`,
      });
  }
  if (v.respiratoryRate !== undefined) {
    if (v.respiratoryRate < 8 || v.respiratoryRate > 30)
      flags.push({
        field: "respiratoryRate",
        level: "danger",
        message: `Respiratory rate ${v.respiratoryRate}/min is abnormal.`,
      });
    else if (!inRange(v.respiratoryRate, 12, 20))
      flags.push({
        field: "respiratoryRate",
        level: "warn",
        message: `Respiratory rate ${v.respiratoryRate}/min is outside normal.`,
      });
  }
  if (v.bloodGlucose !== undefined) {
    if (v.bloodGlucose < 60 || v.bloodGlucose > 300)
      flags.push({
        field: "bloodGlucose",
        level: "danger",
        message: `Blood glucose ${v.bloodGlucose} mg/dL is critical.`,
      });
  }
  return flags;
}

export const levelClass = (l: VitalsFlag["level"]) =>
  l === "danger"
    ? "border-red-300 bg-red-50 text-red-800"
    : l === "warn"
    ? "border-yellow-300 bg-yellow-50 text-yellow-800"
    : "border-emerald-300 bg-emerald-50 text-emerald-800";