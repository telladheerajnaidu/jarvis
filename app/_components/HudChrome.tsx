"use client";

import { useEffect, useState } from "react";
import { TelemetryStream, WaveformBars, HexBadge } from "./Rings";

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function TopBar({ session }: { session?: string }) {
  const now = useNow();
  const time = now ? now.toISOString().slice(11, 19) : "--:--:--";
  const date = now ? now.toISOString().slice(0, 10) : "----/--/--";
  return (
    <div className="border-b border-jarvis-cyan/30 bg-jarvis-bg/70 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-2 gap-6">
        <div className="flex items-center gap-4">
          <div className="arc-reactor" style={{ width: 34, height: 34 }} />
          <div className="leading-tight">
            <div className="text-[10px] tracking-[0.4em] text-jarvis-cyan">J.A.R.V.I.S.</div>
            <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/50">
              STARK INDUSTRIES MAINFRAME v8.4.1
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[10px] tracking-widest text-jarvis-cyan/70">
          <span>UTC {time}</span>
          <span className="text-jarvis-cyan/40">|</span>
          <span>{date}</span>
          <span className="text-jarvis-cyan/40">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot" />
            UPLINK
          </span>
          <span className="text-jarvis-cyan/40">|</span>
          <HexBadge>{session || "GUEST"}</HexBadge>
        </div>
      </div>
      <div className="ticker border-t border-jarvis-cyan/20 bg-jarvis-bg/50 text-[9px] tracking-[0.25em] text-jarvis-cyan/50 py-1 px-3">
        <div className="ticker-inner">
          <span className="mr-10">ARC REACTOR // 3.02 GJ</span>
          <span className="mr-10">⌁ THRUSTER R 94%</span>
          <span className="mr-10">⌁ THRUSTER L 93%</span>
          <span className="mr-10">⌁ HUD OVERLAY: ALPHA</span>
          <span className="mr-10">⌁ NET: MALIBU-01</span>
          <span className="mr-10">⌁ FRIDAY CORE: SYNCED</span>
          <span className="mr-10">⌁ PROPRIETARY</span>
          <span className="mr-10">⌁ ARC REACTOR // 3.02 GJ</span>
          <span className="mr-10">⌁ THRUSTER R 94%</span>
          <span className="mr-10">⌁ THRUSTER L 93%</span>
          <span className="mr-10">⌁ HUD OVERLAY: ALPHA</span>
          <span className="mr-10">⌁ NET: MALIBU-01</span>
          <span className="mr-10">⌁ FRIDAY CORE: SYNCED</span>
          <span className="mr-10">⌁ PROPRIETARY</span>
        </div>
      </div>
    </div>
  );
}

export function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="hud-panel hud-corners p-4 h-full">
      <div className="text-[10px] tracking-[0.3em] text-jarvis-cyan/70 mb-3 border-b border-jarvis-cyan/20 pb-2">
        // {title}
      </div>
      {children}
    </aside>
  );
}

export function BottomBar() {
  return (
    <div className="border-t border-jarvis-cyan/30 bg-jarvis-bg/70 backdrop-blur-sm px-6 py-2 flex items-end justify-between gap-8">
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
      <div className="flex-1 max-w-md">
        <WaveformBars count={48} />
      </div>
      <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/50">
        MALIBU DATACENTER // 34°N 118°W
      </div>
    </div>
  );
}

export function HudShell({ children, session }: { children: React.ReactNode; session?: string }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="scanline-overlay" />
      <TopBar session={session} />
      <div className="flex-1 grid grid-cols-[240px_1fr_240px] gap-4 p-4 relative">
        <div>
          <SidePanel title="TELEMETRY">
            <TelemetryStream />
          </SidePanel>
        </div>
        <main className="relative">{children}</main>
        <div className="space-y-4">
          <SidePanel title="DIAGNOSTICS">
            <div className="space-y-3 text-[10px] tracking-wider">
              <Metric label="ARC REACTOR" value={98} color="#22d3ee" />
              <Metric label="NEURAL LINK" value={86} color="#22d3ee" />
              <Metric label="THRUSTERS" value={94} color="#22d3ee" />
              <Metric label="SHIELD MATRIX" value={72} color="#f59e0b" />
              <Metric label="AMMO CORE" value={44} color="#ef4444" />
            </div>
          </SidePanel>
          <SidePanel title="FRIDAY">
            <div className="text-[10px] leading-5 text-jarvis-cyan/70">
              <div className="pulse-dot text-jarvis-cyan">● LISTENING</div>
              <div className="mt-2 italic opacity-70">
                "Good to see you, Sir. All systems show nominal."
              </div>
            </div>
          </SidePanel>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1 text-jarvis-cyan/80">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
