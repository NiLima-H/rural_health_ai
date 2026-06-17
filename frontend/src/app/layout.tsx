import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "RuralCare Triage | গ্রামীণ স্বাস্থ্য ট্রায়াজ",
  description:
    "AI-powered multilingual triage assistant for rural clinics (Bengali / English).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
