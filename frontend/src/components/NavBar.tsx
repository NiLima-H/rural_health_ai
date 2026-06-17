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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white shadow-lg">
            ✚
          </span>
          <div className="leading-tight">
            <div className="font-bold tracking-wide gradient-text text-lg">
              {t("app_title")}
            </div>
            <div className="text-[0.7rem] uppercase tracking-[0.18em] text-indigo-200/80">
              {t("app_tagline")}
            </div>
          </div>
        </Link>

        <nav className="hidden gap-1 md:flex">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow"
                    : "text-indigo-100/90 hover:bg-white/10"
                }`}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 p-1 text-xs">
          {(["en", "bn"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-md px-2 py-1 font-semibold transition ${
                lang === l
                  ? "bg-white text-indigo-700 shadow"
                  : "text-indigo-100/80 hover:bg-white/10"
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
