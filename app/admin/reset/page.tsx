"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ConcentricRings, HexBadge } from "../../_components/Rings";
import { TextScramble, BorderBeam, PulseGlow } from "../../_components/Animations";

const STEPS = [
  "> PURGE COMMAND RECEIVED",
  "> REVOKING SESSION TOKEN.............. OK",
  "> CLEARING COOKIE // path=/........... OK",
  "> CLEARING COOKIE // path=/admin...... OK",
  "> CLEARING COOKIE // path=/suits...... OK",
  "> CLEARING COOKIE // path=/api........ OK",
  "> FRIDAY INTEGRITY CHECK ............. NOMINAL",
  "> MAINFRAME READY FOR NEXT CANDIDATE",
];

export default function AdminReset() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/reset", { method: "POST" });
        if (!res.ok) throw new Error();
      } catch {
        setErr("RESET FAILED // check server logs");
      }
    })();
  }, []);

  useEffect(() => {
    if (step >= STEPS.length) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setStep((n) => n + 1), 220);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <main className="min-h-screen hud-grid-fine relative overflow-hidden">
      <div className="scanline-overlay" />

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-jarvis-cyan/30 bg-jarvis-bg/70 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
            <motion.div
              className="arc-reactor"
              style={{ width: 32, height: 32 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            />
            <div className="leading-tight">
              <TextScramble className="text-[10px] tracking-[0.4em] text-jarvis-gold" duration={0.6}>
                ADMIN CONSOLE
              </TextScramble>
              <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/50">
                MAINFRAME PURGE PROTOCOL
              </div>
            </div>
          </div>
          <HexBadge>LVL 09</HexBadge>
        </div>
      </motion.div>

      <div className="relative grid grid-cols-[1fr_1.2fr_1fr] gap-4 p-6 h-[calc(100vh-50px)]">
        <div />

        <section className="relative flex items-center justify-center">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative w-[520px] h-[520px]">
              <ConcentricRings size={520} />
            </div>
          </motion.div>

          <motion.div
            className="relative z-10 w-[440px]"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="hud-panel hud-corners p-6 backdrop-blur-md relative overflow-hidden">
              <BorderBeam colorFrom="#22d3ee" colorTo="#ec4899" size={50} duration={6} />
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] tracking-[0.3em] text-jarvis-gold">
                  // PURGE SEQUENCE
                </div>
                {done ? (
                  <HexBadge>COMPLETE</HexBadge>
                ) : (
                  <span className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-jarvis-cyan/70">
                    <PulseGlow color="#22d3ee" size={5} />
                    <span className="ml-1">EXECUTING...</span>
                  </span>
                )}
              </div>

              <div className="font-mono text-[11px] text-jarvis-cyan/90 space-y-1 min-h-[200px]">
                {STEPS.slice(0, step).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="tracking-wider"
                  >
                    <TextScramble duration={0.3} speed={0.025}>{line}</TextScramble>
                  </motion.div>
                ))}
                {!done && (
                  <motion.div
                    className="h-3 w-2 bg-jarvis-cyan inline-block ml-1"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </div>

              {err && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-[10px] text-jarvis-red border border-jarvis-red/40 bg-jarvis-red/10 px-3 py-2 tracking-wider"
                >
                  {err}
                </motion.div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/" className="btn-hud text-center block">&larr; RETURN TO LOGIN</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/suits" className="btn-hud btn-gold text-center block">TEST GALLERY &rarr;</Link>
                </motion.div>
              </div>

              <div className="mt-4 text-[9px] text-jarvis-cyan/50 text-center tracking-[0.3em]">
                ALL BUGS RE-ARMED // READY FOR NEXT RUN
              </div>
            </div>
          </motion.div>
        </section>

        <div />
      </div>
    </main>
  );
}
