import { Severity } from "./types";

export const SEVERITY_META: Record<
  Severity,
  { en: string; bn: string; color: string; bg: string; ring: string }
> = {
  GREEN: {
    en: "Green — Routine care",
    bn: "সবুজ — সাধারণ যত্ন",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
    ring: "ring-emerald-400",
  },
  YELLOW: {
    en: "Yellow — Urgent",
    bn: "হলুদ — জরুরি",
    color: "text-yellow-800",
    bg: "bg-yellow-100",
    ring: "ring-yellow-400",
  },
  RED: {
    en: "Red — Emergency",
    bn: "লাল — জরুরীকালীন",
    color: "text-red-700",
    bg: "bg-red-100",
    ring: "ring-red-500",
  },
  BLACK: {
    en: "Black — Expectant",
    bn: "কালো — মৃত/অপেক্ষমাণ",
    color: "text-slate-900",
    bg: "bg-slate-200",
    ring: "ring-slate-500",
  },
};
