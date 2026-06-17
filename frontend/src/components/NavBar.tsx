"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";

const links = [
  { href: "/", key: "nav_intake" as const },
  { href: "/vitals", key: "nav_vitals" as const },
  { href: "/prescription", key: "nav_prescription" as const },
  { href: "/results", key: "nav_results" as const },
];

export function NavBar() {
  const { t, lang, setLang } = useLang();
  const path = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
            ✚
          </span>
          <div className="leading-tight">
            <div className="font-semibold text-emerald-900">{t("app_title")}</div>
            <div className="text-xs text-slate-500">{t("app_tagline")}</div>
          </div>
        </Link>

        <nav className="hidden gap-1 md:flex">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 p-1 text-xs">
          {(["en", "bn"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-md px-2 py-1 ${
                lang === l ? "bg-white text-emerald-700 shadow" : "text-slate-600"
              }`}
            >
              {l === "en" ? "EN" : "বাংলা"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
