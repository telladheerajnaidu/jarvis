"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HudShell } from "../../_components/HudChrome";
import { CircularDial, HexBadge, WaveformBars } from "../../_components/Rings";

type Integrity = {
  overall: number;
  helmet: number;
  chest: number;
  arm_left: number;
  arm_right: number;
  leg_left: number;
  leg_right: number;
  reactor: number;
};

type SuitApi = {
  id: string;
  mark: number;
  name: string;
  codename: string;
  status: string;
  year: number;
  image: string;
  power_output: string;
  top_speed: string;
  armor: string;
  height: string;
  weight: string;
  flight_ceiling: string;
  thruster_efficiency: number;
  hud_version: string;
  ai_core: string;
  first_deployed: string;
  classification: string;
  description: string;
  battles: string[];
  weapons: { name: string; charge: number; notes?: string }[];
  integrity: Integrity;
};

// NOTE: The view type intentionally exposes camelCase fields that do NOT exist
// on the API payload (power_output / top_speed are snake_case). This is bug S4.
type SuitView = SuitApi & {
  powerOutput?: string;
  topSpeed?: string;
};

export default function SuitDetailPage() {
  const params = useParams<{ id: string }>();
  const [suit, setSuit] = useState<SuitView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/suits/${params.id}`);
        if (res.status === 401) {
          setError("UNAUTHORIZED // SESSION TOKEN REJECTED");
          return;
        }
        const data = await res.json();
        if (data.success) setSuit(data.suit);
        else setError(data.error);
      } catch {
        setError("NETWORK ERROR");
      }
    }
    load();
  }, [params.id]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  async function downloadSpec() {
    if (!suit) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/suits/${suit.id}/spec`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (error) {
    return (
      <HudShell session="ERROR">
        <div className="hud-panel hud-corners p-6 text-jarvis-red bg-jarvis-red/5 max-w-xl">
          <div className="tracking-widest text-[10px] mb-2">// SYSTEM ERROR</div>
          <div className="text-sm">{error}</div>
          <Link href="/suits" className="btn-hud inline-block mt-4">← REGISTRY</Link>
        </div>
      </HudShell>
    );
  }

  if (!suit) {
    return (
      <HudShell session="LOADING">
        <div className="h-full flex items-center justify-center text-jarvis-cyan tracking-[0.4em] flicker">
          LOADING TELEMETRY...
        </div>
      </HudShell>
    );
  }

  const integrityBad = suit.integrity.overall < 50;
  const integrityColor = integrityBad ? "#ef4444" : suit.integrity.overall < 80 ? "#f59e0b" : "#22d3ee";

  return (
    <HudShell session={`MK ${suit.mark}`}>
      <div className="h-full flex flex-col overflow-y-auto pr-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/suits" className="btn-hud">← REGISTRY</Link>
            <div>
              <div className="text-[10px] tracking-[0.4em] text-jarvis-cyan/60">
                {suit.classification} // {suit.year} // {suit.status.toUpperCase()}
              </div>
              <h1 className="text-2xl tracking-[0.3em] text-jarvis-cyan flicker">{suit.name}</h1>
              <div className="text-[11px] italic text-slate-400">"{suit.codename}" HUD</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HexBadge>{suit.hud_version}</HexBadge>
            <button onClick={downloadSpec} className="btn-hud btn-gold" disabled={downloading}>
              {downloading ? "TRANSMITTING..." : "DOWNLOAD SPEC SHEET"}
            </button>
            <button onClick={logout} className="btn-hud">DISENGAGE</button>
          </div>
        </div>

        {/* Main grid: stats | figure | dials */}
        <div className="grid grid-cols-[1fr_1.2fr_1fr] gap-4 mb-4">
          {/* Left — suit diagnostics */}
          <div className="space-y-4">
            <div className="hud-panel hud-corners p-4">
              <SectionTitle>SUIT DIAGNOSTICS</SectionTitle>
              <div className="space-y-2 text-[10px] tracking-wider mt-3">
                <IntegrityRow label="HELMET" value={suit.integrity.helmet} />
                <IntegrityRow label="CHEST PLATE" value={suit.integrity.chest} />
                <IntegrityRow label="ARM — LEFT" value={suit.integrity.arm_left} />
                <IntegrityRow label="ARM — RIGHT" value={suit.integrity.arm_right} />
                <IntegrityRow label="LEG — LEFT" value={suit.integrity.leg_left} />
                <IntegrityRow label="LEG — RIGHT" value={suit.integrity.leg_right} />
                <IntegrityRow label="REACTOR" value={suit.integrity.reactor} emphasize />
              </div>
            </div>

            <div className="hud-panel hud-corners p-4">
              <SectionTitle>BATTLE LOG</SectionTitle>
              <ul className="space-y-1.5 mt-3 text-[10px] tracking-wider text-jarvis-cyan/80">
                {suit.battles.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-jarvis-cyan pulse-dot" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Center — suit figure */}
          <div className="hud-panel hud-corners p-4 relative overflow-hidden flex flex-col">
            <SectionTitle>SUIT PROFILE // MK {suit.mark}</SectionTitle>
            <div className="relative flex-1 min-h-[380px] flex items-center justify-center">
              <div className="absolute inset-0 hud-hexpattern opacity-20" />
              {/* Radial targeting overlay */}
              <svg className="absolute inset-0 m-auto" width="320" height="320" viewBox="0 0 320 320" style={{ opacity: 0.75 }}>
                <g className="ring-rotate-slow" style={{ transformOrigin: "160px 160px" }}>
                  <circle cx="160" cy="160" r="150" fill="none" stroke="#22d3ee" strokeOpacity="0.3" strokeDasharray="4 6" />
                </g>
                <g className="ring-rotate-mid" style={{ transformOrigin: "160px 160px" }}>
                  <circle cx="160" cy="160" r="130" fill="none" stroke="#f59e0b" strokeOpacity="0.25" strokeDasharray="2 8" />
                </g>
                <line x1="160" y1="5" x2="160" y2="25" stroke="#22d3ee" strokeOpacity="0.5" />
                <line x1="160" y1="295" x2="160" y2="315" stroke="#22d3ee" strokeOpacity="0.5" />
                <line x1="5" y1="160" x2="25" y2="160" stroke="#22d3ee" strokeOpacity="0.5" />
                <line x1="295" y1="160" x2="315" y2="160" stroke="#22d3ee" strokeOpacity="0.5" />
              </svg>
              <img
                src={suit.image}
                alt={suit.name}
                className="relative z-10 max-h-[380px] max-w-full object-contain"
                style={{ filter: "drop-shadow(0 0 24px rgba(34,211,238,0.4))" }}
              />
              <div className="absolute top-2 right-2 text-[9px] tracking-[0.25em] text-jarvis-gold border border-jarvis-gold/40 px-2 py-0.5 bg-jarvis-bg/60">
                STATUS // {suit.status.toUpperCase()}
              </div>
              <div className="absolute bottom-2 left-2 text-[9px] tracking-[0.25em] text-jarvis-cyan/70 border border-jarvis-cyan/40 px-2 py-0.5 bg-jarvis-bg/60">
                BIOMETRIC LOCK // ACTIVE
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[9px] tracking-[0.25em] text-jarvis-cyan/70 text-center">
              <MiniStat label="HEIGHT" value={suit.height} />
              <MiniStat label="WEIGHT" value={suit.weight} />
              <MiniStat label="CEILING" value={suit.flight_ceiling} />
            </div>
          </div>

          {/* Right — dials */}
          <div className="space-y-4">
            <div className="hud-panel hud-corners p-4">
              <SectionTitle>LIVE TELEMETRY</SectionTitle>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CircularDial label="INTEGRITY" value={suit.integrity.overall} unit="%" color={integrityColor} />
                <CircularDial label="THRUSTERS" value={suit.thruster_efficiency} unit="%" />
                <CircularDial label="REACTOR" value={suit.integrity.reactor} unit="%" color="#f59e0b" />
                <CircularDial label="SHIELDS" value={Math.max(10, suit.integrity.chest)} unit="%" />
              </div>
            </div>

            <div className="hud-panel hud-corners p-4">
              <SectionTitle>AUDIO FEED</SectionTitle>
              <div className="mt-3">
                <WaveformBars count={44} />
              </div>
              <div className="text-[10px] italic text-jarvis-cyan/70 mt-2">
                "{suit.ai_core} initialized. Run-up sequence complete."
              </div>
            </div>
          </div>
        </div>

        {/* Bottom grid: specs | weapons | description */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="hud-panel hud-corners p-4">
            <SectionTitle>CORE SPECS</SectionTitle>
            <div className="mt-3 space-y-2 text-[11px]">
              <SpecRow label="POWER OUTPUT" value={suit.powerOutput ?? "—"} />
              <SpecRow label="TOP SPEED" value={suit.topSpeed ?? "—"} />
              <SpecRow label="ARMOR" value={suit.armor} />
              <SpecRow label="AI CORE" value={suit.ai_core} />
              <SpecRow label="HUD" value={suit.hud_version} />
              <SpecRow label="FIRST DEPLOYED" value={suit.first_deployed} />
            </div>
          </div>

          <div className="hud-panel hud-corners p-4">
            <SectionTitle>WEAPONS LOADOUT</SectionTitle>
            <div className="mt-3 space-y-3">
              {suit.weapons.map((w) => (
                <div key={w.name}>
                  <div className="flex items-center justify-between text-[11px] tracking-wider">
                    <span className="text-jarvis-cyan">{w.name}</span>
                    <span className="text-jarvis-cyan/60">{w.charge}%</span>
                  </div>
                  <div className="bar-track mt-1">
                    <div
                      className={w.charge < 40 ? "bar-fill bar-fill-red" : w.charge < 75 ? "bar-fill bar-fill-gold" : "bar-fill"}
                      style={{ width: `${w.charge}%` }}
                    />
                  </div>
                  {w.notes && (
                    <div className="text-[9px] tracking-widest text-jarvis-cyan/50 mt-0.5 italic">
                      {w.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hud-panel hud-corners p-4">
            <SectionTitle>FIELD BRIEFING</SectionTitle>
            <p className="text-[12px] leading-6 text-slate-300 mt-3">{suit.description}</p>
            <div className="mt-3 border-t border-jarvis-cyan/20 pt-3 text-[10px] tracking-widest text-jarvis-cyan/60">
              CLASSIFICATION // {suit.classification}
            </div>
          </div>
        </div>
      </div>
    </HudShell>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-jarvis-cyan/20 pb-2">
      <div className="text-[10px] tracking-[0.3em] text-jarvis-cyan/70">// {children}</div>
      <div className="flex gap-1">
        <span className="w-1 h-1 bg-jarvis-cyan rounded-full pulse-dot" />
        <span className="w-1 h-1 bg-jarvis-cyan/50 rounded-full" />
        <span className="w-1 h-1 bg-jarvis-cyan/30 rounded-full" />
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-jarvis-cyan/10 pb-1.5 last:border-0">
      <span className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60">{label}</span>
      <span className="text-jarvis-cyan text-right">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="hud-panel py-1.5 px-2">
      <div className="text-jarvis-cyan/50">{label}</div>
      <div className="text-jarvis-cyan text-[11px] tracking-wider mt-0.5">{value}</div>
    </div>
  );
}

function IntegrityRow({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  const color =
    value < 30 ? "bar-fill-red" : value < 70 ? "bar-fill-gold" : "bar-fill";
  const textColor =
    value < 30 ? "text-jarvis-red" : value < 70 ? "text-jarvis-gold" : "text-jarvis-cyan";
  return (
    <div>
      <div className="flex justify-between">
        <span className={`tracking-[0.25em] ${emphasize ? "text-jarvis-gold" : "text-jarvis-cyan/80"}`}>
          {label}
        </span>
        <span className={textColor}>{value}%</span>
      </div>
      <div className="bar-track mt-1">
        <div className={`bar-fill ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
