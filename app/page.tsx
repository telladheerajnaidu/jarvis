"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConcentricRings, TelemetryStream, WaveformBars, HexBadge } from "./_components/Rings";

const BOOT_LINES = [
  "> INITIALIZING J.A.R.V.I.S. v8.4.1",
  "> LOADING STARK SECURE KERNEL.................... OK",
  "> BIOMETRIC SUBSYSTEMS ........................... ONLINE",
  "> ARC REACTOR HANDSHAKE .......................... STABLE",
  "> MAINFRAME LINK TO MALIBU-01 .................... ESTABLISHED",
  "> FRIDAY AUX CORE ................................ STANDBY",
  "> AWAITING AUTHORIZATION.",
];

export default function LoginPage() {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowIso, setNowIso] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setNowIso(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      const t = setTimeout(() => setBooted(true), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleLines((n) => n + 1), 240);
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
        setError("AUTHENTICATION REJECTED // SEE TERMINAL");
      }
    } catch {
      setError("NETWORK ERROR // CHECK UPLINK");
    } finally {
      setLoading(false);
    }
  }

  if (!booted) {
    return (
      <main className="min-h-screen hud-grid-fine relative flex items-center justify-center">
        <div className="scanline-overlay" />
        <div className="max-w-2xl w-full p-8 font-mono text-jarvis-cyan text-xs flicker">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="py-1 tracking-wider">{line}</div>
          ))}
          <div className="h-3 w-2 bg-jarvis-cyan inline-block animate-pulse ml-1" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen hud-grid-fine relative overflow-hidden">
      <div className="scanline-overlay" />

      {/* Top bar */}
      <div className="border-b border-jarvis-cyan/30 bg-jarvis-bg/70 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
            <div className="arc-reactor" style={{ width: 32, height: 32 }} />
            <div className="leading-tight">
              <div className="text-[10px] tracking-[0.4em] text-jarvis-cyan">J.A.R.V.I.S.</div>
              <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/50">SECURE TERMINAL // MAINFRAME v8.4.1</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[10px] tracking-widest text-jarvis-cyan/70">
            <span>UTC {nowIso}</span>
            <span className="text-jarvis-cyan/40">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot" />
              UPLINK NOMINAL
            </span>
            <span className="text-jarvis-cyan/40">|</span>
            <HexBadge>SESSION 04</HexBadge>
          </div>
        </div>
      </div>

      {/* 3-column HUD */}
      <div className="grid grid-cols-[260px_1fr_260px] gap-4 p-4 h-[calc(100vh-90px)]">
        {/* Left — telemetry */}
        <div className="hud-panel hud-corners p-4 overflow-hidden">
          <div className="text-[10px] tracking-[0.3em] text-jarvis-cyan/70 mb-3 border-b border-jarvis-cyan/20 pb-2">
            // BOOT TELEMETRY
          </div>
          <TelemetryStream />
        </div>

        {/* Center — big ring + login */}
        <section className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[560px] h-[560px]">
              <ConcentricRings size={560} />
            </div>
          </div>

          <div className="relative z-10 w-[360px]">
            <div className="flex flex-col items-center mb-5">
              <div className="arc-reactor mb-4" />
              <div className="text-xl tracking-[0.5em] text-jarvis-cyan flicker">J.A.R.V.I.S.</div>
              <div className="text-[9px] text-jarvis-cyan/60 mt-1 tracking-[0.3em]">
                JUST A RATHER VERY INTELLIGENT SYSTEM
              </div>
            </div>

            <div className="hud-panel hud-corners p-5 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] text-jarvis-cyan/80 tracking-[0.3em]">
                  // AUTH REQUIRED
                </div>
                <HexBadge>LV 04</HexBadge>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="text-[9px] text-jarvis-cyan/70 tracking-[0.3em]">USER ID</label>
                  <input
                    type="text"
                    className="input-hud mt-1"
                    placeholder="tony@stark.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-jarvis-cyan/70 tracking-[0.3em]">ACCESS CODE</label>
                  <input
                    type="password"
                    className="input-hud mt-1"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                {error && (
                  <div className="text-[10px] text-jarvis-red border border-jarvis-red/40 bg-jarvis-red/10 px-3 py-2 tracking-wider">
                    {error}
                  </div>
                )}
                <button type="submit" className="btn-hud w-full mt-2" disabled={loading}>
                  {loading ? "AUTHENTICATING..." : "ENGAGE"}
                </button>
              </form>

              <div className="mt-4 grid grid-cols-3 gap-2 text-[8px] text-jarvis-cyan/50 tracking-widest">
                <div className="hud-panel px-2 py-1 text-center">ENC AES-256</div>
                <div className="hud-panel px-2 py-1 text-center">TLS 1.3</div>
                <div className="hud-panel px-2 py-1 text-center">FIPS-OK</div>
              </div>
            </div>

            <div className="text-[9px] text-jarvis-cyan/40 text-center mt-4 tracking-[0.3em]">
              STARK INDUSTRIES // MALIBU DATACENTER
            </div>
          </div>
        </section>

        {/* Right — diagnostics */}
        <div className="space-y-4">
          <div className="hud-panel hud-corners p-4">
            <div className="text-[10px] tracking-[0.3em] text-jarvis-cyan/70 mb-3 border-b border-jarvis-cyan/20 pb-2">
              // DIAGNOSTICS
            </div>
            <div className="space-y-3 text-[10px] tracking-wider">
              <Bar label="ARC REACTOR" value={98} />
              <Bar label="UPLINK" value={92} />
              <Bar label="SENSOR SUITE" value={86} />
              <Bar label="AUX POWER" value={74} />
              <Bar label="SECURITY CORE" value={100} />
            </div>
          </div>

          <div className="hud-panel hud-corners p-4">
            <div className="text-[10px] tracking-[0.3em] text-jarvis-cyan/70 mb-2">
              // SYSTEM MESSAGE
            </div>
            <div className="text-[10px] leading-5 text-jarvis-cyan/80 italic">
              "Welcome back, Sir. Shall I warm up the hangar?"
            </div>
            <div className="mt-3 text-[9px] tracking-widest text-jarvis-cyan/50">
              — F.R.I.D.A.Y.
            </div>
          </div>

          <div className="hud-panel hud-corners p-3">
            <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60 mb-2">// AUDIO</div>
            <WaveformBars count={32} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-jarvis-cyan/30 bg-jarvis-bg/70 backdrop-blur-sm px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] tracking-[0.25em] text-jarvis-cyan/70">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot" />
            SYSTEMS NOMINAL
          </span>
          <span className="text-jarvis-cyan/40">|</span>
          <span>CPU 12%</span>
          <span>MEM 38%</span>
          <span>GPU 24%</span>
        </div>
        <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/50">
          PROPRIETARY // STARK INDUSTRIES © 2025
        </div>
      </div>
    </main>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1 text-jarvis-cyan/80">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
