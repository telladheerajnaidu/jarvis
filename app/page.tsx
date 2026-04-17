"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { TelemetryStream, WaveformBars, HexBadge, Holosphere } from "./_components/Rings";
import {
  TextScramble,
  TypingText,
  FadeIn,
  Particles,
  PulseGlow,
  BorderBeam,
  NumberTicker,
  Spotlight,
  Magnetic,
  Ripple,
  ShineBorder,
  AuroraBackground,
  ShimmerText,
} from "./_components/Animations";

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
  const [formReady, setFormReady] = useState(false);

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

  useEffect(() => {
    if (booted) {
      const t = setTimeout(() => setFormReady(true), 600);
      return () => clearTimeout(t);
    }
  }, [booted]);

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
      <main className="min-h-screen hud-grid-fine relative flex items-center justify-center overflow-hidden">
        <AuroraBackground intensity={0.2} />
        <div className="scanline-overlay" />
        <Particles className="absolute inset-0" quantity={30} color="#fde047" size={0.25} />
        <div className="max-w-2xl w-full p-4 sm:p-8 font-mono text-jarvis-ivory text-xs relative z-10">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="py-1 tracking-wider"
            >
              <TextScramble duration={0.4} speed={0.03}>{line}</TextScramble>
            </motion.div>
          ))}
          <motion.div
            className="h-3 w-2 bg-jarvis-cyan inline-block ml-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen hud-grid-fine relative overflow-hidden">
      <AuroraBackground intensity={0.25} />
      <div className="scanline-overlay" />
      <Particles className="absolute inset-0 z-0" quantity={36} color="#fde047" size={0.25} />
      <Spotlight color="rgba(239, 68, 68, 0.12)" size={720} />

      {/* Top bar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-b border-jarvis-cyan/30 bg-jarvis-bg/70 backdrop-blur-sm relative z-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              className="arc-reactor"
              style={{ width: 32, height: 32 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            />
            <div className="leading-tight">
              <TextScramble className="text-[10px] tracking-[0.4em] text-jarvis-cyan" duration={0.6}>
                J.A.R.V.I.S.
              </TextScramble>
              <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60 hidden sm:block">SECURE TERMINAL // MAINFRAME v8.4.1</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] tracking-widest text-jarvis-cyan/80">
            <span className="tabular-nums">UTC {nowIso}</span>
            <span className="text-jarvis-cyan/40 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <PulseGlow color="#fde047" size={6} />
              <span className="ml-1">UPLINK NOMINAL</span>
            </span>
            <span className="text-jarvis-cyan/40 hidden md:inline">|</span>
            <HexBadge>SESSION 04</HexBadge>
          </div>
        </div>
      </motion.div>

      {/* 3-column HUD — collapses on smaller screens */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] xl:grid-cols-[260px_1fr_260px] gap-4 p-3 sm:p-4 lg:h-[calc(100vh-90px)] relative z-10">
        {/* Left -- telemetry */}
        <FadeIn delay={0.2} direction="left" className="hidden lg:block">
          <div className="hud-panel hud-corners p-4 overflow-hidden h-full relative">
            <BorderBeam colorFrom="#ef4444" colorTo="#fde047" size={40} duration={8} />
            <div className="text-[10px] tracking-[0.35em] text-jarvis-gold/80 mb-3 border-b border-jarvis-gold/20 pb-2">
              // BOOT TELEMETRY
            </div>
            <TelemetryStream />
          </div>
        </FadeIn>

        {/* Center -- holosphere + login */}
        <section className="relative flex items-center justify-center min-h-[560px] sm:min-h-[640px] py-6 lg:py-0">
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            aria-hidden
          >
            <div className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] lg:w-[560px] lg:h-[560px]">
              <Ripple count={4} mainSize={260} color="rgba(239, 68, 68, 0.18)" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="hidden sm:block lg:hidden"><Holosphere size={420} /></div>
                <div className="hidden lg:block"><Holosphere size={520} /></div>
                <div className="block sm:hidden"><Holosphere size={280} /></div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {formReady && (
              <motion.div
                className="relative z-20 w-full max-w-[380px] px-2 sm:px-0"
                initial={{ scale: 0.94, opacity: 0, y: 14 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="flex flex-col items-center mb-5">
                  <motion.div
                    className="arc-reactor mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
                  />
                  <ShimmerText className="text-xl tracking-[0.5em]" from="#ef4444" mid="#fef9c3" duration={4}>
                    J.A.R.V.I.S.
                  </ShimmerText>
                  <motion.div
                    className="text-[9px] text-jarvis-cyan/60 mt-1 tracking-[0.3em]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    JUST A RATHER VERY INTELLIGENT SYSTEM
                  </motion.div>
                </div>

                <div className="hud-panel hud-corners p-6 backdrop-blur-xl relative overflow-hidden shadow-hud">
                  <BorderBeam colorFrom="#ef4444" colorTo="#fde047" size={60} duration={6} />
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] text-jarvis-cyan/80 tracking-[0.3em]">
                      // AUTH REQUIRED
                    </div>
                    <HexBadge>LV 04</HexBadge>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="text-[9px] text-jarvis-cyan/70 tracking-[0.3em]">USER ID</label>
                      <input
                        type="text"
                        className="input-hud mt-1"
                        placeholder="enter user id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                    >
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
                    </motion.div>
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[10px] text-jarvis-red border border-jarvis-red/40 bg-jarvis-red/10 px-3 py-2 tracking-wider overflow-hidden"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Magnetic strength={0.25} className="block w-full">
                      <motion.button
                        type="submit"
                        className="btn-hud w-full mt-2 relative overflow-hidden"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShineBorder duration={4} colors={["#ef4444", "#fde047", "#ef4444"]} />
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span
                              className="inline-block w-3 h-3 border-2 border-jarvis-cyan/40 border-t-jarvis-cyan rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                            AUTHENTICATING...
                          </span>
                        ) : (
                          "ENGAGE"
                        )}
                      </motion.button>
                    </Magnetic>
                  </form>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-[8px] text-jarvis-cyan/50 tracking-widest">
                    {["ENC AES-256", "TLS 1.3", "FIPS-OK"].map((label, i) => (
                      <motion.div
                        key={label}
                        className="hud-panel px-2 py-1 text-center"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        {label}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  className="text-[9px] text-jarvis-cyan/40 text-center mt-4 tracking-[0.3em]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  STARK INDUSTRIES // MALIBU DATACENTER
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right -- diagnostics */}
        <FadeIn delay={0.2} direction="right" className="hidden lg:block">
          <div className="space-y-4 h-full flex flex-col">
            <div className="hud-panel hud-corners p-4 relative overflow-hidden">
              <BorderBeam colorFrom="#fde047" colorTo="#ef4444" size={35} duration={10} delay={3} />
              <div className="text-[10px] tracking-[0.35em] text-jarvis-gold/80 mb-3 border-b border-jarvis-gold/20 pb-2">
                // DIAGNOSTICS
              </div>
              <div className="space-y-3 text-[10px] tracking-wider">
                <AnimatedBar label="ARC REACTOR" value={98} delay={0.3} />
                <AnimatedBar label="UPLINK" value={92} delay={0.45} />
                <AnimatedBar label="SENSOR SUITE" value={86} delay={0.6} />
                <AnimatedBar label="AUX POWER" value={74} delay={0.75} />
                <AnimatedBar label="SECURITY CORE" value={100} delay={0.9} />
              </div>
            </div>

            <div className="hud-panel hud-corners p-4 relative overflow-hidden">
              <div className="text-[10px] tracking-[0.35em] text-jarvis-gold/80 mb-2">
                // SYSTEM MESSAGE
              </div>
              <div className="text-[10px] leading-5 text-jarvis-cyan/80 italic">
                <TypingText
                  text={`"Welcome back, Sir. Shall I warm up the hangar?"`}
                  speed={35}
                  delay={1200}
                />
              </div>
              <motion.div
                className="mt-3 text-[9px] tracking-widest text-jarvis-cyan/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
              >
                — F.R.I.D.A.Y.
              </motion.div>
            </div>

            <div className="hud-panel hud-corners p-3">
              <div className="text-[9px] tracking-[0.35em] text-jarvis-gold/60 mb-2">// AUDIO</div>
              <WaveformBars count={32} />
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Bottom bar */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="border-t border-jarvis-cyan/30 bg-jarvis-bg/70 backdrop-blur-sm px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 relative z-10"
      >
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] tracking-[0.25em] text-jarvis-cyan/80">
          <span className="flex items-center gap-1.5">
            <PulseGlow color="#fde047" size={6} />
            <span className="ml-1">SYSTEMS NOMINAL</span>
          </span>
          <span className="text-jarvis-cyan/40">|</span>
          <span>CPU <NumberTicker value={12} className="text-jarvis-cyan/70" />%</span>
          <span>MEM <NumberTicker value={38} className="text-jarvis-cyan/70" />%</span>
          <span>GPU <NumberTicker value={24} className="text-jarvis-cyan/70" />%</span>
        </div>
        <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/50">
          PROPRIETARY // STARK INDUSTRIES &copy; 2025
        </div>
      </motion.div>
    </main>
  );
}

function AnimatedBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex justify-between mb-1 text-jarvis-cyan/80">
        <span>{label}</span>
        <span><NumberTicker value={value} className="text-jarvis-cyan/80 text-[10px]" delay={delay} />%</span>
      </div>
      <div className="bar-track">
        <motion.div
          className="bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
