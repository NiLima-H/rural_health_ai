"use client";

import { LanguageProvider } from "@/lib/i18n";
import { SessionProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SessionProvider>{children}</SessionProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
