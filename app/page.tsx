"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  TextScramble,
  Particles,
  PulseGlow,
  NumberTicker,
  ShimmerText,
  useMouseFromCenter,
} from "./_components/Animations";
import { Starfield3D } from "../_components/Starfield3D";
import { GsapBoot } from "../_components/GsapBoot";
import { BarbaBoot } from "../_components/BarbaBoot";
import { OrbitalCore3D } from "../_components/OrbitalCore3D";

// --- tiny util: fake live telemetry values that drift
function useDriftingNumber(seed: number, min: number, max: number, step = 0.3) {
  const [v, setV] = useState(min + (max - min) * seed);
  useEffect(() => {
    const id = setInterval(() => {
      setV((prev) => {
        const delta = (Math.random() - 0.5) * (max - min) * (step / 10);
        let next = prev + delta;
        if (next < min) next = min + Math.random() * ((max - min) * 0.1);
        if (next > max) next = max - Math.random() * ((max - min) * 0.1);
        return next;
      });
    }, 900 + seed * 250);
    return () => clearInterval(id);
  }, [min, max, step, seed]);
  return v;
}

const COORD_CYCLE = [
  "34°02'N 118°41'W",
  "34°02'N 118°40'W",
  "34°03'N 118°40'W",
  "34°03'N 118°39'W",
  "34°02'N 118°39'W",
];

const TICKER = [
  "STARK INDUSTRIES // MALIBU-01",
  "QUANTUM CHANNEL ◆ AES-1024",
  "F.R.I.D.A.Y SYNC NOMINAL",
  "ORBITAL UPLINK ◆ 847 NODES",
  "THREAT MATRIX ◆ GREEN",
  "REPULSOR CAPACITORS CHARGED",
  "MARK SERIES PROJECTIONS ONLINE",
  "BIOMETRIC LOCK ENGAGED",
  "GEOSYNC BEACON LOCKED",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowIso, setNowIso] = useState("--:--:--");
  const [coordIdx, setCoordIdx] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);

  useEffect(() => {
    const tick = () => setNowIso(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    const id2 = setInterval(() => setCoordIdx((n) => (n + 1) % COORD_CYCLE.length), 1800);
    const id3 = setTimeout(() => setReveal(true), 150);
    return () => { clearInterval(id); clearInterval(id2); clearTimeout(id3); };
  }, []);

  // streaming log on right panel
  useEffect(() => {
    const LINES = [
      "▸ arc.reactor → 3.02 GJ stable",
      "▸ friday.aux.sync → 7ms",
      "▸ geofence.watch → clear",
      "▸ malibu.tunnel → encrypted",
      "▸ repulsor.test → 98.7%",
      "▸ satellite.link → locked",
      "▸ threat.scan → nominal",
      "▸ bio.hash → accepted",
      "▸ node.847 → heartbeat ok",
    ];
    let i = 0;
    const id = setInterval(() => {
      setLogLines((prev) => {
        const next = [...prev, LINES[i % LINES.length]];
        return next.slice(-5);
      });
      i++;
    }, 1200);
    return () => clearInterval(id);
  }, []);

  // custom cursor reticle
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cx = useSpring(cursorX, { stiffness: 420, damping: 36 });
  const cy = useSpring(cursorY, { stiffness: 420, damping: 36 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [cursorX, cursorY]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
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
        setError("AUTHORIZATION DENIED");
      }
    } catch {
      setError("UPLINK INTERRUPTED");
    } finally {
      setLoading(false);
    }
  }

  const flux = useDriftingNumber(0.2, 91, 99, 0.6);
  const latency = useDriftingNumber(0.6, 2.6, 4.8, 0.6);

  return (
    <GsapBoot>
    <main className="min-h-screen relative overflow-hidden" style={{ cursor: "none" }}>
      <BarbaBoot />
      {/* ============ background layers ============ */}
      <div aria-hidden className="absolute inset-0 -z-0">
        <span className="aurora-blob a" />
        <span className="aurora-blob b" />
        <span className="aurora-blob c" />
      </div>
      <Starfield3D className="absolute inset-0 -z-0" />
      <div aria-hidden className="absolute inset-0 hud-grid-fine opacity-40 -z-0" />
      <span aria-hidden className="scan-h" />
      <span aria-hidden className="scan-v" style={{ animationDelay: "-4s" }} />

      {/* cinema frame */}
      <span aria-hidden className="cine-bar top" />
      <span aria-hidden className="cine-bar bot" />
      <div aria-hidden className="film-grain" />
      <div aria-hidden className="cine-vignette" />

      {/* cursor reticle */}
      <motion.svg
        aria-hidden
        className="cursor-reticle"
        style={{ x: cx, y: cy }}
        viewBox="0 0 46 46"
      >
        <circle cx="23" cy="23" r="14" fill="none" stroke="#93c5fd" strokeWidth="0.6" strokeOpacity="0.7" />
        <circle cx="23" cy="23" r="2" fill="#e8a77f" />
        <line x1="23" y1="0" x2="23" y2="6" stroke="#93c5fd" strokeOpacity="0.85" />
        <line x1="23" y1="40" x2="23" y2="46" stroke="#93c5fd" strokeOpacity="0.85" />
        <line x1="0" y1="23" x2="6" y2="23" stroke="#93c5fd" strokeOpacity="0.85" />
        <line x1="40" y1="23" x2="46" y2="23" stroke="#93c5fd" strokeOpacity="0.85" />
      </motion.svg>

      {/* ============ top chrome ============ */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-30 flex items-center justify-between px-6 md:px-10 pt-10 pb-4 text-[10px] tracking-[0.4em] text-jarvis-ivory/80"
      >
        <div className="flex items-center gap-4">
          <span className="text-jarvis-cyan">◇ S·I / NAV</span>
          <span className="text-jarvis-ivory/40">//</span>
          <TextScramble duration={0.6} speed={0.03}>
            ORBITAL COMMAND
          </TextScramble>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-jarvis-ivory/50 tabular-nums">T+ {nowIso}</span>
          <span className="text-jarvis-ivory/30">//</span>
          <span className="text-jarvis-ivory/50 tabular-nums">{COORD_CYCLE[coordIdx]}</span>
          <span className="text-jarvis-ivory/30">//</span>
          <span className="flex items-center gap-1.5 text-jarvis-cyan/80">
            <PulseGlow color="#93c5fd" size={5} />
            <span className="ml-1">LINK</span>
          </span>
        </div>
      </motion.header>

      {/* ============ hero title ============ */}
      <div className="relative z-20 text-center px-4 mt-2 md:mt-4">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[10px] md:text-[11px] tracking-[0.7em] text-jarvis-cyan/80"
        >
          V O I C E &nbsp;&middot;&nbsp; O F &nbsp;&middot;&nbsp; I N T E L L I G E N C E
        </motion.div>

        <div data-boot="rune"><HeroRune3D /></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-3 mt-2 text-[9px] tracking-[0.55em] text-jarvis-ivory/55"
        >
          <span className="h-px w-8 bg-jarvis-ivory/20" />
          <span>J &middot; A &middot; R &middot; V &middot; I &middot; S</span>
          <span className="h-px w-8 bg-jarvis-ivory/20" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[9px] tracking-[0.5em] text-jarvis-crimson/80 mt-1.5"
        >
          MK L VIII &nbsp;·&nbsp; REVISION 4812.1
        </motion.div>
      </div>

      {/* ============ main stage: core + side rails ============ */}
      <div className="relative z-10 grid grid-cols-12 gap-6 px-6 md:px-10 mt-4 md:mt-6">
        {/* LEFT rail */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: reveal ? 1 : 0, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="hidden lg:flex col-span-3 flex-col items-start justify-start gap-6 pt-6"
          data-boot="rail"
        >
          <div className="flex items-baseline gap-3">
            <div className="text-[9px] tracking-[0.5em] text-jarvis-ivory/50">NO.</div>
            <div className="serif-num text-[64px] leading-none text-jarvis-ivory">
              0<NumberTicker value={4} className="serif-num" />70
            </div>
          </div>
          <div className="text-[10px] tracking-[0.4em] text-jarvis-ivory/55">SESSION INDEX</div>

          <div className="w-full space-y-4 mt-4">
            <Readout label="QUANTUM FLUX" value={flux.toFixed(2)} unit="%" bar={flux / 100} />
            <Readout label="UPLINK LATENCY" value={latency.toFixed(2)} unit="ms" bar={latency / 8} invert />
            <Readout label="NODES SYNCED" value={"847"} unit="/ 849" bar={847 / 849} />
            <Readout label="AUX POWER" value={"92"} unit="%" bar={0.92} />
          </div>

          <div className="mt-4 w-full">
            <div className="text-[9px] tracking-[0.4em] text-jarvis-ivory/50 mb-2">WAVEFORM · CH 01</div>
            <Sparkline seed={0.37} color="#93c5fd" />
          </div>
        </motion.aside>

        {/* CENTER — orbital core (WebGL globe + SVG chrome overlay) */}
        <div data-boot="orbital" className="col-span-12 lg:col-span-6 flex items-center justify-center min-h-[460px] md:min-h-[520px] relative">
          <OrbitalCore />
        </div>

        {/* RIGHT — auth + log stream */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: reveal ? 1 : 0, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="col-span-12 lg:col-span-3 flex flex-col gap-5 pt-6"
          data-boot="auth"
        >
          {/* glass auth panel — elevated primary CTA */}
          <motion.div
            className="relative"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* bracket accents */}
            <span aria-hidden className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-jarvis-cyan/80 pointer-events-none" />
            <span aria-hidden className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-jarvis-cyan/80 pointer-events-none" />
            <span aria-hidden className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-jarvis-crimson/80 pointer-events-none" />
            <span aria-hidden className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-jarvis-crimson/80 pointer-events-none" />

            <div className="glass-primary p-6 pl-7 rounded-sm relative overflow-hidden">
              <div className="flex items-start justify-between mb-1 relative z-10">
                <div className="flex items-center gap-2 text-[10px] tracking-[0.45em] text-jarvis-cyan">
                  <PulseGlow color="#93c5fd" size={6} />
                  <span className="ml-1">AUTHORIZATION</span>
                </div>
                <div className="text-[9px] tracking-[0.3em] text-jarvis-crimson flex items-center gap-1.5">
                  <span>SECURE</span>
                </div>
              </div>
              <div className="relative z-10 mb-4">
                <div className="text-[15px] tracking-[0.22em] text-jarvis-ivory font-light">
                  SIGN IN TO CONTINUE
                </div>
                <div className="text-[9px] tracking-[0.35em] text-jarvis-ivory/55 mt-1">
                  Operative credentials required · clearance MK L VIII
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                <div>
                  <div className="text-[9px] tracking-[0.4em] text-jarvis-cyan/80 mb-1">OPERATIVE</div>
                  <input
                    type="text"
                    className="input-emph"
                    placeholder="user identifier"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.4em] text-jarvis-cyan/80 mb-1">CIPHER</div>
                  <input
                    type="password"
                    className="input-emph"
                    placeholder="access code"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[10px] tracking-[0.35em] text-jarvis-red"
                  >
                    ◆ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="btn-capsule group"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <motion.span
                      className="inline-block w-3 h-3 border-2 border-jarvis-cyan/40 border-t-jarvis-cyan rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    LINKING
                  </span>
                ) : (
                  <>
                    <span>ENGAGE</span>
                    <span className="text-jarvis-cyan">⟶</span>
                  </>
                )}
              </button>
            </form>
            </div>
          </motion.div>

          {/* log stream */}
          <div className="glass p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[9px] tracking-[0.4em] text-jarvis-ivory/50">SUBSYSTEM LOG</div>
              <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/80">LIVE</div>
            </div>
            <div className="font-mono text-[10px] leading-[1.6] text-jarvis-ivory/75 space-y-0.5 min-h-[90px]">
              <AnimatePresence initial={false}>
                {logLines.map((l, i) => (
                  <motion.div
                    key={`${i}-${l}`}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1 - i * 0.12, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {l}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* ============ bottom marquee ============ */}
      <div data-boot="ticker" className="fixed left-0 right-0 bottom-0 z-30 border-t border-jarvis-ivory/10 bg-jarvis-bg/70 backdrop-blur-sm overflow-hidden">
        <div className="py-2 text-[10px] tracking-[0.5em] text-jarvis-ivory/70">
          <div className="marq">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-3">
                <span className="text-jarvis-cyan/80">◇</span>
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
    </GsapBoot>
  );
}

// ================= HeroRune3D — extruded sci-fi title =================
function HeroRune3D() {
  const { x, y } = useMouseFromCenter(55, 16);
  const rotY = useTransform(x, (v) => v * 14);
  const rotX = useTransform(y, (v) => -v * 8);
  // Elder Futhark transliteration of "JARVIS":
  // J=ᛃ (Jera) · A=ᚨ (Ansuz) · R=ᚱ (Raidho) · V=ᚹ (Wunjo) · I=ᛁ (Isa) · S=ᛋ (Sowilo)
  const glyphs = ["ᛃ", "ᚨ", "ᚱ", "ᚹ", "ᛁ", "ᛋ"];
  // stack copies in z-space for extrusion
  const stack = Array.from({ length: 8 });
  return (
    <div
      className="relative inline-block mt-3"
      style={{ perspective: 1400, transformStyle: "preserve-3d" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: "preserve-3d",
          transformPerspective: 1400,
          willChange: "transform",
        }}
        className="relative"
      >
        {stack.map((_, i) => {
          const depth = -(i + 1) * 3;
          const fade = 1 - i * 0.13;
          const tint = i === 0 ? "#f5ecd9" : i < 3 ? "#cfc0a8" : i < 5 ? "#7a8b7a" : "#4c1d95";
          return (
            <div
              key={i}
              aria-hidden={i !== 0}
              className="absolute inset-0 flex items-center justify-center gap-[0.4em] select-none pointer-events-none"
              style={{
                fontSize: "clamp(1.8rem, 5.6vw, 4.2rem)",
                letterSpacing: "0.2em",
                fontWeight: 300,
                color: tint,
                opacity: fade,
                transform: `translateZ(${depth}px)`,
                filter: i === 0 ? "drop-shadow(0 0 18px rgba(147,197,253,0.55))" : "none",
              }}
            >
              {glyphs.map((g, j) => (
                <span key={j}>{g}</span>
              ))}
            </div>
          );
        })}
        {/* Foreground glyph row with gradient + shimmer */}
        <div
          className="relative flex items-center justify-center gap-[0.4em] leading-none"
          style={{
            fontSize: "clamp(1.8rem, 5.6vw, 4.2rem)",
            letterSpacing: "0.2em",
            fontWeight: 300,
          }}
        >
          {glyphs.map((g, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 8, rotateX: -30 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.12 + i * 0.07, duration: 0.6, ease: "easeOut" }}
              style={{
                background: "linear-gradient(180deg, #fffaeb 0%, #93c5fd 55%, #7a8b7a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 1px rgba(147,197,253,0.4)",
                filter: "drop-shadow(0 0 10px rgba(232, 167, 127, 0.25))",
              }}
            >
              {g}
            </motion.span>
          ))}
        </div>
        {/* scanning highlight line */}
        <motion.div
          aria-hidden
          className="absolute left-0 right-0 h-[2px] pointer-events-none"
          style={{
            top: "50%",
            background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.85), transparent)",
            filter: "blur(1px)",
          }}
          animate={{ top: ["-5%", "105%"] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

// ================= OrbitalCore — signature centerpiece =================
function OrbitalCore() {
  const size = 460;
  const c = size / 2;
  const R = 188;

  return (
    <div className="orbit-stage relative" style={{ width: size, height: size }}>
      {/* WebGL Earth — fills the 460x460 stage so HUD chrome aligns with the globe */}
      <OrbitalCore3D className="absolute inset-0" />

      {/* ambient base ring glow (softened — WebGL globe provides the bulk of the glow now) */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          inset: "8%",
          background:
            "radial-gradient(circle at 50% 55%, rgba(147,197,253,0.08), transparent 70%)",
          filter: "blur(18px)",
          mixBlendMode: "screen",
        }}
      />

      {/* HUD chrome — flat, no mouse tilt so it aligns perfectly with the 3D globe */}
      <div className="absolute inset-0">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0 0 14px rgba(147,197,253,0.35))" }}
        >
          <defs>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="20%" stopColor="#93c5fd" />
              <stop offset="55%" stopColor="#7a8b7a" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0a1118" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="limb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0" />
              <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e8a77f" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* outer limb — HUD frame around WebGL globe */}
          <circle cx={c} cy={c} r={R + 6} fill="none" stroke="url(#limb)" strokeWidth="1" strokeOpacity="0.55" />
          <circle cx={c} cy={c} r={R + 14} fill="none" stroke="#93c5fd" strokeOpacity="0.15" />

          {/* tick ring */}
          <g>
            {Array.from({ length: 72 }).map((_, i) => {
              const a = (i * 360) / 72;
              const rad = (a * Math.PI) / 180;
              const r1 = R + 14;
              const r2 = R + (i % 6 === 0 ? 28 : 20);
              return (
                <line
                  key={i}
                  x1={c + r1 * Math.cos(rad)}
                  y1={c + r1 * Math.sin(rad)}
                  x2={c + r2 * Math.cos(rad)}
                  y2={c + r2 * Math.sin(rad)}
                  stroke={i % 6 === 0 ? "#e8a77f" : "#93c5fd"}
                  strokeOpacity={i % 6 === 0 ? 0.85 : 0.35}
                  strokeWidth={i % 6 === 0 ? 1.2 : 0.6}
                />
              );
            })}
          </g>

          {/* crosshair */}
          <g stroke="#93c5fd" strokeOpacity="0.4" strokeWidth="0.8">
            <line x1={c} y1="2" x2={c} y2="24" />
            <line x1={c} y1={size - 24} x2={c} y2={size - 2} />
            <line x1="2" y1={c} x2="24" y2={c} />
            <line x1={size - 24} y1={c} x2={size - 2} y2={c} />
          </g>

          {/* scan arc sweep */}
          <motion.g
            style={{ transformOrigin: `${c}px ${c}px` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <path
              d={`M ${c + R - 8} ${c} A ${R - 8} ${R - 8} 0 0 0 ${c} ${c - R + 8}`}
              fill="none"
              stroke="#e8a77f"
              strokeOpacity="0.85"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx={c + R - 8} cy={c} r="4" fill="#f5d7a1" />
          </motion.g>

          {/* marker pings — softened so they don't hide the Earth */}
          {[
            { lat: 48, lon: 250 },
            { lat: -38, lon: 55 },
          ].map((m, i) => {
            const latR = (m.lat * Math.PI) / 180;
            const lonR = (m.lon * Math.PI) / 180;
            const px = c + R * Math.cos(latR) * Math.sin(lonR) * 0.92;
            const py = c - R * Math.sin(latR) * 0.55;
            return (
              <g key={i}>
                <circle cx={px} cy={py} r="2" fill="#f5d7a1">
                  <animate attributeName="r" values="1.6;3.4;1.6" dur={`${2.4 + i * 0.4}s`} repeatCount="indefinite" />
                </circle>
                <circle cx={px} cy={py} r="6" fill="none" stroke="#f5d7a1" strokeOpacity="0.55">
                  <animate attributeName="r" values="3;14;3" dur={`${2.4 + i * 0.4}s`} repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.55;0;0.55" dur={`${2.4 + i * 0.4}s`} repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
        </svg>
      </div>

      {/* orbit rings + satellites now rendered in <OrbitalCore3D /> via WebGL */}

      {/* readout badge — bottom-left so the globe stays unobstructed */}
      <div
        className="absolute pointer-events-none flex flex-col items-start"
        style={{ left: 8, bottom: 8 }}
      >
        <div className="text-[9px] tracking-[0.55em] text-jarvis-cyan/70">// CORE</div>
        <div
          className="serif-num leading-none mt-1"
          style={{
            fontSize: "clamp(1.4rem, 2.2vw, 2rem)",
            color: "#f5d7a1",
            textShadow:
              "0 0 10px rgba(245,215,161,0.55), 0 0 22px rgba(232,167,127,0.35)",
          }}
        >
          0<NumberTicker value={7} className="serif-num" />
        </div>
        <div className="text-[9px] tracking-[0.5em] text-jarvis-ivory/60 mt-1">
          HEARTBEAT · <span className="text-jarvis-cyan">NOMINAL</span>
        </div>
      </div>

      {/* coordinate callout — top-right */}
      <div
        className="absolute pointer-events-none text-right"
        style={{ right: 8, top: 8 }}
      >
        <div className="text-[9px] tracking-[0.5em] text-jarvis-cyan/70">
          EARTH · MALIBU-01
        </div>
        <div className="text-[9px] tracking-[0.4em] text-jarvis-ivory/50 mt-1">
          34°02&apos;N · 118°40&apos;W
        </div>
      </div>

      {/* corner brackets */}
      <Corners />
    </div>
  );
}

function Satellite({ angle, distance, color }: { angle: number; distance: number; color: "cyan" | "pink" }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;
  return (
    <span
      className={`orbit-sat ${color === "pink" ? "pink" : ""}`}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    />
  );
}

function Corners() {
  const pad = 10;
  const arm = 18;
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <g stroke="#93c5fd" strokeWidth="0.6" fill="none" opacity="0.75">
        <path d={`M ${pad} ${pad + arm} L ${pad} ${pad} L ${pad + arm} ${pad}`} />
        <path d={`M ${100 - pad - arm} ${pad} L ${100 - pad} ${pad} L ${100 - pad} ${pad + arm}`} />
        <path d={`M ${100 - pad} ${100 - pad - arm} L ${100 - pad} ${100 - pad} L ${100 - pad - arm} ${100 - pad}`} />
        <path d={`M ${pad + arm} ${100 - pad} L ${pad} ${100 - pad} L ${pad} ${100 - pad - arm}`} />
      </g>
    </svg>
  );
}

function Readout({
  label,
  value,
  unit,
  bar,
  invert = false,
}: {
  label: string;
  value: string;
  unit: string;
  bar: number;
  invert?: boolean;
}) {
  const pct = Math.min(1, Math.max(0, bar));
  return (
    <div>
      <div className="flex items-baseline justify-between text-jarvis-ivory/80">
        <span className="text-[9px] tracking-[0.45em] text-jarvis-ivory/55">{label}</span>
        <span className="text-[11px] tabular-nums">
          <span className="serif-num text-[18px] text-jarvis-ivory">{value}</span>
          <span className="ml-1 text-jarvis-ivory/45 text-[9px] tracking-[0.3em]">{unit}</span>
        </span>
      </div>
      <div className="mt-1 h-[2px] bg-jarvis-ivory/10 relative overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 bottom-0"
          style={{
            background: invert
              ? "linear-gradient(90deg, #e8a77f, #7a8b7a)"
              : "linear-gradient(90deg, #93c5fd, #e8a77f)",
          }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function Sparkline({ seed, color = "#93c5fd" }: { seed: number; color?: string }) {
  const [pts, setPts] = useState<number[]>(() =>
    Array.from({ length: 40 }).map((_, i) => 0.5 + 0.4 * Math.sin(i * 0.35 + seed * 6)),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setPts((prev) => {
        const next = prev.slice(1);
        const last = prev[prev.length - 1];
        let v = last + (Math.random() - 0.5) * 0.25;
        if (v < 0.1) v = 0.1; if (v > 0.95) v = 0.95;
        next.push(v);
        return next;
      });
    }, 280);
    return () => clearInterval(id);
  }, []);
  const w = 220, h = 44;
  const path = pts
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - v * h}`)
    .join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id={`spark-${seed}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={`url(#spark-${seed})`} strokeWidth="1.3" />
      <circle cx={w} cy={h - pts[pts.length - 1] * h} r="2" fill={color} />
    </svg>
  );
}
