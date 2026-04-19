"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TelemetryStream, WaveformBars, HexBadge } from "./Rings";
import { PulseGlow, NumberTicker, TextScramble } from "./Animations";

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
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border-b border-jarvis-cyan/30 bg-jarvis-bg/70 backdrop-blur-sm"
    >
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2 gap-3 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.div
            className="arc-reactor"
            style={{ width: 34, height: 34 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          />
          <div className="leading-tight">
            <TextScramble className="text-[10px] tracking-[0.4em] text-jarvis-cyan" duration={0.5}>
              J.A.R.V.I.S.
            </TextScramble>
            <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60 hidden sm:block">
              STARK INDUSTRIES MAINFRAME v8.4.1
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] tracking-widest text-jarvis-cyan/80">
          <span className="tabular-nums">UTC {time}</span>
          <span className="text-jarvis-cyan/40 hidden sm:inline">|</span>
          <span className="hidden sm:inline">{date}</span>
          <span className="text-jarvis-cyan/40 hidden md:inline">|</span>
          <span className="flex items-center gap-1.5">
            <PulseGlow color="#60a5fa" size={6} />
            <span className="ml-1">UPLINK</span>
          </span>
          <span className="text-jarvis-cyan/40 hidden md:inline">|</span>
          <HexBadge>{session || "GUEST"}</HexBadge>
        </div>
      </div>
      <div className="ticker border-t border-jarvis-cyan/20 bg-jarvis-bg/50 text-[9px] tracking-[0.25em] text-jarvis-cyan/50 py-1 px-3">
        <div className="ticker-inner">
          <span className="mr-10">ARC REACTOR // 3.02 GJ</span>
          <span className="mr-10">THRUSTER R 94%</span>
          <span className="mr-10">THRUSTER L 93%</span>
          <span className="mr-10">HUD OVERLAY: ALPHA</span>
          <span className="mr-10">NET: MALIBU-01</span>
          <span className="mr-10">FRIDAY CORE: SYNCED</span>
          <span className="mr-10">PROPRIETARY</span>
          <span className="mr-10">ARC REACTOR // 3.02 GJ</span>
          <span className="mr-10">THRUSTER R 94%</span>
          <span className="mr-10">THRUSTER L 93%</span>
          <span className="mr-10">HUD OVERLAY: ALPHA</span>
          <span className="mr-10">NET: MALIBU-01</span>
          <span className="mr-10">FRIDAY CORE: SYNCED</span>
          <span className="mr-10">PROPRIETARY</span>
        </div>
      </div>
    </motion.div>
  );
}

export function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="hud-panel hud-corners p-4 h-full">
      <div className="text-[10px] tracking-[0.35em] text-jarvis-gold/80 mb-3 border-b border-jarvis-gold/20 pb-2 flex items-center justify-between">
        <span>// {title}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-jarvis-red shadow-[0_0_8px_#c17a56]" />
      </div>
      {children}
    </aside>
  );
}

export function BottomBar() {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="border-t border-jarvis-cyan/30 bg-jarvis-bg/70 backdrop-blur-sm px-4 sm:px-6 py-2 flex flex-wrap items-end justify-between gap-3 sm:gap-8"
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] tracking-[0.25em] text-jarvis-cyan/80">
        <span className="flex items-center gap-1.5">
          <PulseGlow color="#60a5fa" size={6} />
          <span className="ml-1">SYSTEMS NOMINAL</span>
        </span>
        <span className="text-jarvis-cyan/40">|</span>
        <span>CPU <NumberTicker value={12} className="text-jarvis-cyan/70 text-[10px]" />%</span>
        <span>MEM <NumberTicker value={38} className="text-jarvis-cyan/70 text-[10px]" />%</span>
        <span>GPU <NumberTicker value={24} className="text-jarvis-cyan/70 text-[10px]" />%</span>
      </div>
      <div className="flex-1 max-w-md hidden md:block">
        <WaveformBars count={48} />
      </div>
      <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60">
        MALIBU DATACENTER // 34&deg;N 118&deg;W
      </div>
    </motion.div>
  );
}

export function HudShell({ children, session }: { children: React.ReactNode; session?: string }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="scanline-overlay" />
      <TopBar session={session} />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] xl:grid-cols-[240px_1fr_240px] gap-3 sm:gap-4 p-3 sm:p-4 relative">
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SidePanel title="TELEMETRY">
            <TelemetryStream />
          </SidePanel>
        </motion.div>
        <main className="relative min-w-0">{children}</main>
        <motion.div
          className="space-y-4 hidden lg:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SidePanel title="DIAGNOSTICS">
            <div className="space-y-3 text-[10px] tracking-wider">
              <Metric label="ARC REACTOR" value={98} color="#c17a56" />
              <Metric label="NEURAL LINK" value={86} color="#60a5fa" />
              <Metric label="THRUSTERS" value={94} color="#7a8b7a" />
              <Metric label="SHIELD MATRIX" value={72} color="#60a5fa" />
              <Metric label="AMMO CORE" value={44} color="#c17a56" />
            </div>
          </SidePanel>
          <SidePanel title="FRIDAY">
            <div className="text-[10px] leading-5 text-jarvis-cyan/70">
              <div className="flex items-center gap-1.5">
                <PulseGlow color="#60a5fa" size={5} />
                <span className="ml-1 text-jarvis-cyan">LISTENING</span>
              </div>
              <div className="mt-2 italic opacity-70">
                &quot;Good to see you, Sir. All systems show nominal.&quot;
              </div>
            </div>
          </SidePanel>
        </motion.div>
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
        <span><NumberTicker value={value} className="text-jarvis-cyan/80 text-[10px]" />%</span>
      </div>
      <div className="bar-track">
        <motion.div
          className="bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
