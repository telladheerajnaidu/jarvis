"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BOOT_LINES = [
  "> INITIALIZING J.A.R.V.I.S. v8.4.1",
  "> LOADING STARK SECURE KERNEL...",
  "> BIOMETRIC SUBSYSTEMS ................ ONLINE",
  "> ARC REACTOR HANDSHAKE .............. STABLE",
  "> MAINFRAME LINK ..................... ESTABLISHED",
  "> AWAITING AUTHORIZATION",
];

export default function LoginPage() {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      const t = setTimeout(() => setBooted(true), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleLines((n) => n + 1), 280);
    return () => clearTimeout(t);
  }, [visibleLines]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/suits");
      } else {
        setError("Authentication failed. Check terminal output.");
      }
    } catch {
      setError("Network error. Check console.");
    } finally {
      setLoading(false);
    }
  }

  if (!booted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full p-8 font-mono text-jarvis-cyan text-sm animate-flicker">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="py-1">{line}</div>
          ))}
          <div className="h-3 w-2 bg-jarvis-cyan inline-block animate-pulse ml-1" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 pointer-events-none scanline overflow-hidden" />
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="arc-reactor mb-4" />
          <h1 className="text-2xl tracking-[0.4em] text-jarvis-cyan">J.A.R.V.I.S.</h1>
          <p className="text-xs text-jarvis-cyan/60 mt-1 tracking-widest">
            JUST A RATHER VERY INTELLIGENT SYSTEM
          </p>
        </div>

        <div className="hud-border p-6 bg-jarvis-panel/60 backdrop-blur-sm">
          <div className="text-[10px] text-jarvis-cyan/70 tracking-[0.3em] mb-4">
            // SECURE TERMINAL // AUTH REQUIRED
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] text-jarvis-cyan/70 tracking-widest">USER ID</label>
              <input
                type="text"
                className="input mt-1"
                placeholder="tony@stark.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-jarvis-cyan/70 tracking-widest">ACCESS CODE</label>
              <input
                type="password"
                className="input mt-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <div className="text-xs text-jarvis-red border border-jarvis-red/40 bg-jarvis-red/10 px-3 py-2">
                {error}
              </div>
            )}
            <button type="submit" className="btn w-full" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "ENGAGE"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-[10px] text-jarvis-cyan/40 text-center tracking-widest">
          STARK INDUSTRIES // MALIBU DATACENTER
        </div>
      </div>
    </main>
  );
}
