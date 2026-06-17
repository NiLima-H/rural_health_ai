"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(username.trim(), password);
      router.replace("/");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="card-strong mb-4 p-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest">
          Worker login
        </h1>
        <p className="mt-1 text-sm opacity-80">
          Sign in with your clinic credentials to access patient triage.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="label">Username</label>
          <input
            className="field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {err && (
          <div className="border border-red-700 bg-red-50 p-3 text-sm text-red-800">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-xs opacity-60">
          Default seeded accounts: <code>nurse / nurse123</code>,{" "}
          <code>doctor / doctor123</code>. Set the <code>WORKERS</code> env
          var on the backend to add your own.
        </p>
      </form>
    </div>
  );
}
