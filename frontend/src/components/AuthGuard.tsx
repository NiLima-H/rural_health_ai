"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user && path !== "/login") {
      router.replace("/login");
    }
  }, [user, loading, path, router]);

  if (loading) {
    return (
      <div className="card p-8 text-center text-sm opacity-70">Loading…</div>
    );
  }

  if (!user) {
    return null; // router is redirecting
  }

  return <>{children}</>;
}
