"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { ConcentricRings, HexBadge, WaveformBars } from "./_components/Rings";
import {
  TextScramble,
  FadeIn,
  Particles,
  PulseGlow,
  BorderBeam,
  NumberTicker,
  Magnetic,
  ShineBorder,
  ShimmerText,
  ChromaticBloom,
  ParallaxLayer,
  useMouseFromCenter,
} from "./_components/Animations";

const BOOT_LINES = [
  "> SECURE KERNEL ................ OK",
  "> ARC REACTOR HANDSHAKE ........ STABLE",
  "> BIOMETRIC SUBSYSTEMS ......... ONLINE",
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
  const [typingHeat, setTypingHeat] = useState(0);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const tick = () => setNowIso(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      const t = setTimeout(() => setBooted(true), 260);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleLines((n) => n + 1), 160);
    return () => clearTimeout(t);
  }, [visibleLines]);

  useEffect(() => {
    if (booted) {
      const t = setTimeout(() => setFormReady(true), 420);
      return () => clearTimeout(t);
    }
  }, [booted]);

  // cool down typing "heat" so waveform bars pulse with input energy
  useEffect(() => {
    if (typingHeat <= 0) return;
    const t = setTimeout(() => setTypingHeat((h) => Math.max(0, h - 1)), 120);
    return () => clearTimeout(t);
  }, [typingHeat]);

  function bumpHeat() {
    setTypingHeat((h) => Math.min(10, h + 2));
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLFormElement).getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: rect.width / 2, y: rect.height - 28 }]);
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 900);

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
        setError("AUTHENTICATION REJECTED // RETRY");
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
        <ChromaticBloom intensity={0.3} />
        <div className="scanline-overlay" />
        <Particles className="absolute inset-0" quantity={24} color="#22d3ee" size={0.2} />
        <div className="max-w-md w-full px-4 sm:px-8 font-mono text-jarvis-ivory text-xs relative z-10">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="py-1 tracking-wider"
            >
              <TextScramble duration={0.3} speed={0.025}>{line}</TextScramble>
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
      <ChromaticBloom intensity={0.5} />
      <div className="scanline-overlay" />
      <Particles className="absolute inset-0 z-0" quantity={32} color="#ec4899" size={0.2} />

      {/* ============ top bar ============ */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-b border-jarvis-crimson/30 bg-jarvis-bg/60 backdrop-blur-sm relative z-10"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-2">
          <div className="flex items-center gap-3">
            <motion.div
              className="arc-reactor"
              style={{ width: 28, height: 28 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            />
            <TextScramble className="text-[10px] tracking-[0.45em] text-jarvis-gold" duration={0.5}>
              STARK // JARVIS SECURE TERMINAL
            </TextScramble>
          </div>
          <div className="flex items-center gap-4 text-[10px] tracking-widest text-jarvis-cyan/80">
            <span className="tabular-nums">UTC {nowIso}</span>
            <span className="hidden sm:inline text-jarvis-cyan/30">|</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <PulseGlow color="#22d3ee" size={6} />
              <span className="ml-1">UPLINK OK</span>
            </span>
            <HexBadge>LV 04</HexBadge>
          </div>
        </div>
      </motion.div>

      {/* ============ hero scene ============ */}
      <AnimatePresence>
        {formReady && (
          <motion.section
            className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-8 pt-6 sm:pt-10 pb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* title block */}
            <div className="text-center mb-4 sm:mb-6">
              <motion.div
                className="text-[10px] sm:text-[11px] tracking-[0.55em] text-jarvis-cyan/70"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                VOICE OF ARTIFICIAL INTELLIGENCE
              </motion.div>
              <motion.h1
                className="font-mono font-semibold leading-none mt-2 sm:mt-3"
                style={{ fontSize: "clamp(2.2rem, 7vw, 5rem)", letterSpacing: "0.28em" }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              >
                <ShimmerText from="#ec4899" mid="#67e8f9" duration={5}>
                  J.A.R.V.I.S.&nbsp;01
                </ShimmerText>
              </motion.h1>
              <motion.div
                className="text-[9px] sm:text-[10px] tracking-[0.4em] text-jarvis-crimson mt-1 sm:mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                JUST A RATHER VERY INTELLIGENT SYSTEM
              </motion.div>
            </div>

            {/* HUD centerpiece + side readouts */}
            <div className="relative flex items-center justify-center">
              {/* left readout column */}
              <SideColumn
                side="left"
                primary="57°"
                secondary="AZIMUTH"
                code="AX-11"
                heat={typingHeat}
              />

              {/* center HUD */}
              <CenterHUD typingHeat={typingHeat} />

              {/* right readout column */}
              <SideColumn
                side="right"
                primary="24"
                secondary="ACTIVE NODES"
                code="FR-93"
                heat={typingHeat}
              />
            </div>

            {/* form below HUD */}
            <motion.div
              className="relative mx-auto mt-6 sm:mt-8 max-w-[440px]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="hud-panel-solid hud-corners p-5 sm:p-6 relative overflow-hidden shadow-hud">
                <BorderBeam colorFrom="#ec4899" colorTo="#22d3ee" size={60} duration={6} />
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] text-jarvis-cyan/80 tracking-[0.35em]">
                    // AUTH REQUIRED
                  </div>
                  <span className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-jarvis-crimson">
                    <PulseGlow color="#ec4899" size={5} />
                    <span className="ml-1">SECURE CHANNEL</span>
                  </span>
                </div>

                <form onSubmit={handleLogin} className="space-y-3 relative">
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="text-[9px] text-jarvis-cyan/70 tracking-[0.3em]">USER ID</label>
                    <input
                      type="text"
                      className="input-hud mt-1"
                      placeholder="enter user id"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); bumpHeat(); }}
                      autoComplete="username"
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="text-[9px] text-jarvis-cyan/70 tracking-[0.3em]">ACCESS CODE</label>
                    <input
                      type="password"
                      className="input-hud mt-1"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); bumpHeat(); }}
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

                  <Magnetic strength={0.28} className="block w-full">
                    <motion.button
                      type="submit"
                      className="btn-hud w-full mt-1 relative overflow-hidden"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShineBorder duration={4} colors={["#ec4899", "#22d3ee", "#ec4899"]} />
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

                  {/* click ripples from submit */}
                  {ripples.map((r) => (
                    <motion.span
                      key={r.id}
                      className="pointer-events-none absolute rounded-full border border-jarvis-cyan/70"
                      style={{ left: r.x, top: r.y }}
                      initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.8 }}
                      animate={{ width: 320, height: 320, x: -160, y: -160, opacity: 0 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  ))}
                </form>

                <div className="mt-4 grid grid-cols-3 gap-2 text-[8px] text-jarvis-cyan/55 tracking-widest">
                  {["ENC AES-256", "TLS 1.3", "FIPS-OK"].map((label, i) => (
                    <motion.div
                      key={label}
                      className="hud-panel px-2 py-1 text-center"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.08 }}
                    >
                      {label}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ============ bottom bar ============ */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 border-t border-jarvis-crimson/30 bg-jarvis-bg/70 backdrop-blur-sm px-4 sm:px-6 py-2 flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-4 text-[10px] tracking-[0.25em] text-jarvis-cyan/70">
          <span className="flex items-center gap-1.5">
            <PulseGlow color="#22d3ee" size={6} />
            <span className="ml-1">SYSTEMS NOMINAL</span>
          </span>
          <span className="hidden sm:inline text-jarvis-cyan/30">|</span>
          <span className="hidden sm:inline">CPU <NumberTicker value={12} className="text-jarvis-cyan" />%</span>
          <span className="hidden md:inline">MEM <NumberTicker value={38} className="text-jarvis-cyan" />%</span>
          <span className="hidden md:inline">GPU <NumberTicker value={24} className="text-jarvis-cyan" />%</span>
        </div>
        <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/45">
          STARK INDUSTRIES &copy; 2025
        </div>
      </motion.div>
    </main>
  );
}

// ================= centerpiece HUD =================
function CenterHUD({ typingHeat }: { typingHeat: number }) {
  const { x, y } = useMouseFromCenter(50, 18);
  const rot = useTransform(() => x.get() * 18 + y.get() * 6);

  return (
    <div className="relative flex items-center justify-center" style={{ width: "min(68vw, 560px)", height: "min(68vw, 560px)" }}>
      {/* outer soft glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(236,72,153,0.25) 0%, rgba(168,85,247,0.14) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{ opacity: [0.65, 0.9, 0.65] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* parallax rings */}
      <ParallaxLayer depth={18} tilt={4} className="absolute inset-0">
        <ConcentricRings size={520} />
      </ParallaxLayer>

      {/* rotating pink/violet brush-curves (the abstract swooshes from the ref) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ rotate: rot }}
      >
        <svg viewBox="0 0 520 520" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="curvePink" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="curveViolet" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 60 260 C 120 120, 320 60, 470 180"
            fill="none"
            stroke="url(#curvePink)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.25, ease: "easeOut" }}
          />
          <motion.path
            d="M 80 320 C 200 430, 360 420, 460 300"
            fill="none"
            stroke="url(#curveViolet)"
            strokeWidth="2.4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.45, ease: "easeOut" }}
          />
          <motion.path
            d="M 130 120 Q 260 0, 400 110"
            fill="none"
            stroke="#67e8f9"
            strokeOpacity="0.55"
            strokeWidth="1"
            strokeDasharray="2 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.6 }}
          />
        </svg>
      </motion.div>

      {/* reactive core ripples when typing */}
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 220,
          height: 220,
          border: "1px solid rgba(34, 211, 238, 0.55)",
        }}
        animate={{
          scale: [1, 1 + typingHeat * 0.02, 1],
          opacity: [0.55, 0.15, 0.55],
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 140,
          height: 140,
          border: "1px dashed rgba(236, 72, 153, 0.6)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      {/* central numeric readout */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.55 }}
      >
        <div className="text-[9px] tracking-[0.4em] text-jarvis-cyan/60">// MK CORE</div>
        <div
          className="font-mono leading-none mt-1"
          style={{
            fontSize: "clamp(1.6rem, 4.5vw, 3rem)",
            letterSpacing: "0.18em",
            color: "#ec4899",
            textShadow: "0 0 18px rgba(236,72,153,0.7), 0 0 4px #67e8f9",
          }}
        >
          A-0<NumberTicker value={7} className="inline text-jarvis-red" />
        </div>
        <div className="text-[9px] tracking-[0.4em] text-jarvis-cyan/50 mt-2">
          HEARTBEAT <span className="text-jarvis-cyan">NOMINAL</span>
        </div>
      </motion.div>
    </div>
  );
}

// ================= side column (readouts + waveform) =================
function SideColumn({
  side,
  primary,
  secondary,
  code,
  heat,
}: {
  side: "left" | "right";
  primary: string;
  secondary: string;
  code: string;
  heat: number;
}) {
  const isLeft = side === "left";
  return (
    <FadeIn
      delay={0.3}
      direction={isLeft ? "left" : "right"}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 ${isLeft ? "left-0" : "right-0"} flex-col items-${isLeft ? "start" : "end"} gap-3 z-10`}
    >
      <div className={`text-[9px] tracking-[0.4em] text-jarvis-crimson ${isLeft ? "text-left" : "text-right"}`}>
        {code}
      </div>
      <div
        className="font-mono leading-none"
        style={{
          fontSize: "clamp(2rem, 4vw, 3rem)",
          color: "#67e8f9",
          letterSpacing: "0.06em",
          textShadow: "0 0 12px rgba(103,232,249,0.6)",
        }}
      >
        {primary}
      </div>
      <div className={`text-[9px] tracking-[0.4em] text-jarvis-cyan/70 ${isLeft ? "text-left" : "text-right"}`}>
        {secondary}
      </div>
      <div className="w-[140px] h-[52px] opacity-90" style={{ filter: `brightness(${1 + heat * 0.04})` }}>
        <WaveformBars count={18} />
      </div>
      <div className={`text-[8px] tracking-[0.35em] text-jarvis-gold/60 ${isLeft ? "text-left" : "text-right"}`}>
        CH.{isLeft ? "01" : "02"} LIVE
      </div>
    </FadeIn>
  );
}
