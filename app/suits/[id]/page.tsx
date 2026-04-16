"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { HudShell } from "../../_components/HudChrome";
import { CircularDial, HexBadge, WaveformBars } from "../../_components/Rings";
import { SuitSilhouette, paletteFor } from "../../_components/SuitSilhouette";
import { TextScramble, FadeIn, BorderBeam, NumberTicker, PulseGlow, StaggerGroup, StaggerItem } from "../../_components/Animations";

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

type SuitView = SuitApi;

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
        <FadeIn>
          <div className="hud-panel hud-corners p-6 text-jarvis-red bg-jarvis-red/5 max-w-xl relative overflow-hidden">
            <BorderBeam colorFrom="#ef4444" colorTo="#f59e0b" size={40} duration={4} />
            <div className="tracking-widest text-[10px] mb-2">// SYSTEM ERROR</div>
            <div className="text-sm">{error}</div>
            <Link href="/suits" className="btn-hud inline-block mt-4">&larr; REGISTRY</Link>
          </div>
        </FadeIn>
      </HudShell>
    );
  }

  if (!suit) {
    return (
      <HudShell session="LOADING">
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <motion.div
            className="w-16 h-16 border-2 border-jarvis-cyan/20 border-t-jarvis-cyan rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
          <TextScramble className="text-jarvis-cyan tracking-[0.4em]" duration={1.5}>
            LOADING TELEMETRY...
          </TextScramble>
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
        <motion.div
          className="flex items-start justify-between mb-4 gap-4"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <Link href="/suits" className="btn-hud">&larr; REGISTRY</Link>
            <div>
              <div className="text-[10px] tracking-[0.4em] text-jarvis-cyan/60">
                {suit.classification} // {suit.year} // {suit.status.toUpperCase()}
              </div>
              <TextScramble className="text-2xl tracking-[0.3em] text-jarvis-cyan inline-block" duration={0.6}>
                {suit.name}
              </TextScramble>
              <div className="text-[11px] italic text-slate-400">&quot;{suit.codename}&quot; HUD</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HexBadge>{suit.hud_version}</HexBadge>
            <motion.button
              onClick={downloadSpec}
              className="btn-hud btn-gold"
              disabled={downloading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {downloading ? "TRANSMITTING..." : "DOWNLOAD SPEC SHEET"}
            </motion.button>
            <motion.button
              onClick={logout}
              className="btn-hud"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              DISENGAGE
            </motion.button>
          </div>
        </motion.div>

        {/* Main grid: stats | figure | dials */}
        <div className="grid grid-cols-[1fr_1.2fr_1fr] gap-4 mb-4">
          {/* Left -- suit diagnostics */}
          <FadeIn delay={0.1} direction="left">
            <div className="space-y-4">
              <div className="hud-panel hud-corners p-4 relative overflow-hidden">
                <BorderBeam colorFrom="#22d3ee" colorTo="#0891b2" size={35} duration={10} />
                <SectionTitle>SUIT DIAGNOSTICS</SectionTitle>
                <StaggerGroup stagger={0.06} className="space-y-2 text-[10px] tracking-wider mt-3">
                  <StaggerItem><IntegrityRow label="HELMET" value={suit.integrity.helmet} /></StaggerItem>
                  <StaggerItem><IntegrityRow label="CHEST PLATE" value={suit.integrity.chest} /></StaggerItem>
                  <StaggerItem><IntegrityRow label="ARM — LEFT" value={suit.integrity.arm_left} /></StaggerItem>
                  <StaggerItem><IntegrityRow label="ARM — RIGHT" value={suit.integrity.arm_right} /></StaggerItem>
                  <StaggerItem><IntegrityRow label="LEG — LEFT" value={suit.integrity.leg_left} /></StaggerItem>
                  <StaggerItem><IntegrityRow label="LEG — RIGHT" value={suit.integrity.leg_right} /></StaggerItem>
                  <StaggerItem><IntegrityRow label="REACTOR" value={suit.integrity.reactor} emphasize /></StaggerItem>
                </StaggerGroup>
              </div>

              <div className="hud-panel hud-corners p-4">
                <SectionTitle>BATTLE LOG</SectionTitle>
                <StaggerGroup stagger={0.1} className="space-y-1.5 mt-3 text-[10px] tracking-wider text-jarvis-cyan/80">
                  {suit.battles.map((b) => (
                    <StaggerItem key={b}>
                      <div className="flex items-center gap-2">
                        <PulseGlow color="#22d3ee" size={4} />
                        <span className="ml-1">{b}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            </div>
          </FadeIn>

          {/* Center -- suit figure */}
          <motion.div
            className="hud-panel hud-corners p-4 relative overflow-hidden flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <SectionTitle>SUIT PROFILE // MK {suit.mark}</SectionTitle>
            <div className="relative flex-1 min-h-[380px] flex items-center justify-center">
              <div className="absolute inset-0 hud-hexpattern opacity-20" />
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
              <SuitSilhouette
                mark={suit.mark}
                codename={suit.codename}
                status={suit.status}
                {...paletteFor(suit.id)}
                className="relative z-10 w-full h-full min-h-[380px]"
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
          </motion.div>

          {/* Right -- dials */}
          <FadeIn delay={0.2} direction="right">
            <div className="space-y-4">
              <div className="hud-panel hud-corners p-4 relative overflow-hidden">
                <BorderBeam colorFrom="#22d3ee" colorTo="#f59e0b" size={35} duration={10} delay={2} />
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
                  &quot;{suit.ai_core} initialized. Run-up sequence complete.&quot;
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Bottom grid: specs | weapons | description */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <FadeIn delay={0.3} direction="up">
            <div className="hud-panel hud-corners p-4 relative overflow-hidden">
              <SectionTitle>CORE SPECS</SectionTitle>
              <div className="mt-3 space-y-2 text-[11px]">
                <SpecRow label="POWER OUTPUT" value={(suit as any).powerOutput ?? "\u2014"} />
                <SpecRow label="TOP SPEED" value={(suit as any).topSpeed ?? "\u2014"} />
                <SpecRow label="ARMOR" value={suit.armor} />
                <SpecRow label="AI CORE" value={suit.ai_core} />
                <SpecRow label="HUD" value={suit.hud_version} />
                <SpecRow label="FIRST DEPLOYED" value={suit.first_deployed} />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.4} direction="up">
            <div className="hud-panel hud-corners p-4 relative overflow-hidden">
              <BorderBeam colorFrom="#ef4444" colorTo="#f59e0b" size={30} duration={12} delay={4} />
              <SectionTitle>WEAPONS LOADOUT</SectionTitle>
              <StaggerGroup stagger={0.1} className="mt-3 space-y-3">
                {suit.weapons.map((w) => (
                  <StaggerItem key={w.name}>
                    <div>
                      <div className="flex items-center justify-between text-[11px] tracking-wider">
                        <span className="text-jarvis-cyan">{w.name}</span>
                        <span className="text-jarvis-cyan/60">
                          <NumberTicker value={w.charge} className="text-jarvis-cyan/60 text-[11px]" />%
                        </span>
                      </div>
                      <div className="bar-track mt-1">
                        <motion.div
                          className={w.charge < 40 ? "bar-fill bar-fill-red" : w.charge < 75 ? "bar-fill bar-fill-gold" : "bar-fill"}
                          initial={{ width: 0 }}
                          animate={{ width: `${w.charge}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      {w.notes && (
                        <div className="text-[9px] tracking-widest text-jarvis-cyan/50 mt-0.5 italic">
                          {w.notes}
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </FadeIn>

          <FadeIn delay={0.5} direction="up">
            <div className="hud-panel hud-corners p-4">
              <SectionTitle>FIELD BRIEFING</SectionTitle>
              <p className="text-[12px] leading-6 text-slate-300 mt-3">{suit.description}</p>
              <div className="mt-3 border-t border-jarvis-cyan/20 pt-3 text-[10px] tracking-widest text-jarvis-cyan/60">
                CLASSIFICATION // {suit.classification}
              </div>
            </div>
          </FadeIn>
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
        <PulseGlow color="#22d3ee" size={4} />
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
        <span className={textColor}>
          <NumberTicker value={value} className={`${textColor} text-[10px]`} />%
        </span>
      </div>
      <div className="bar-track mt-1">
        <motion.div
          className={`bar-fill ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
