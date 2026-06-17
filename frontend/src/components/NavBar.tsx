"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";

const links = [
  { href: "/", en: "Patient", bn: "রোগী" },
  { href: "/vitals", en: "Vitals", bn: "স্বাস্থ্য পরীক্ষা" },
  { href: "/prescription", en: "Prescription", bn: "প্রেসক্রিপশন" },
  { href: "/results", en: "Results", bn: "ফলাফল" },
];

export function NavBar() {
  const { lang, setLang } = useLang();
  const path = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold uppercase tracking-widest text-ink">
          <span className="flex h-7 w-7 items-center justify-center border border-ink bg-ink text-bg">
            ✚
          </span>
          <span className="hidden sm:inline">RuralCare · Triage</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-2.5 py-1.5 font-semibold transition ${
                  active
                    ? "bg-ink text-bg"
                    : "text-ink-soft hover:bg-ink hover:text-bg"
                }`}
              >
                {lang === "bn" ? l.bn : l.en}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 border border-line bg-white p-0.5 text-xs font-bold">
          <button
            onClick={() => setLang("en")}
            className={`px-2 py-1 ${
              lang === "en" ? "bg-ink text-bg" : "text-ink-soft"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("bn")}
            className={`px-2 py-1 ${
              lang === "bn" ? "bg-ink text-bg" : "text-ink-soft"
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>
    </header>
  );
}
