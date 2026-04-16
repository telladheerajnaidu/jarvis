"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { HudShell } from "../_components/HudChrome";
import { HexBadge } from "../_components/Rings";
import { SuitSilhouette, paletteFor } from "../_components/SuitSilhouette";
import { AnimatedNumber, TextScramble, FadeIn, BorderBeam, PulseGlow, StaggerGroup, StaggerItem } from "../_components/Animations";

type SuitCard = {
  id: string;
  mark: number;
  name: string;
  codename: string;
  status: string;
  year: number;
  image: string;
  classification: string;
};

export default function SuitsPage() {
  const [suits, setSuits] = useState<SuitCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markInput, setMarkInput] = useState("");
  const [markApplied, setMarkApplied] = useState("");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [heartbeat, setHeartbeat] = useState<number | null>(null);
  const [renderedMark, setRenderedMark] = useState<number | null>(null);

  const CACHE_KEY = "jarvis_suits_cache_v1";
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  async function loadSuits(markOverride?: string, opts?: { forceNetwork?: boolean }) {
    const mark = markOverride ?? markApplied;
    setLoading(true);
    setError(null);

    if (!opts?.forceNetwork && typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as {
            at: number;
            mark: string;
            data: {
              suits: SuitCard[];
              server_timestamp: string;
              heartbeat?: number;
              mark_queried?: number | null;
            };
          };
          if (
            cached.mark === mark &&
            Date.now() - cached.at < CACHE_TTL_MS
          ) {
            setSuits(cached.data.suits);
            setLastSync(cached.data.server_timestamp);
            if (typeof cached.data.heartbeat === "number") setHeartbeat(cached.data.heartbeat);
            setRenderedMark(
              typeof cached.data.mark_queried === "number" ? cached.data.mark_queried : null,
            );
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore corrupt cache
      }
    }

    try {
      const res = await fetch(`/api/suits?mark=${mark}`);
      if (res.status === 401) {
        setError("UNAUTHORIZED // SESSION TOKEN REJECTED BY /api/suits");
        setSuits([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSuits(data.suits);
        if (data.server_timestamp) setLastSync(data.server_timestamp);
        if (typeof data.heartbeat === "number") setHeartbeat(data.heartbeat);
        setRenderedMark(
          typeof data.mark_queried === "number" ? data.mark_queried : null,
        );
        try {
          window.localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              at: Date.now(),
              mark,
              data: {
                suits: data.suits,
                server_timestamp: data.server_timestamp,
                heartbeat: data.heartbeat,
                mark_queried: data.mark_queried,
              },
            }),
          );
        } catch {}
      } else setError(data.error || "UNKNOWN ERROR");
    } catch {
      setError("NETWORK ERROR // CHECK UPLINK");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuits(markApplied);
  }, [markApplied]);

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    setMarkApplied(markInput);
  }

  async function resync() {
    await loadSuits(markApplied);
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  const statusColor: Record<string, string> = {
    online: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
    offline: "text-slate-400 border-slate-400/50 bg-slate-400/10",
    damaged: "text-jarvis-gold border-jarvis-gold/50 bg-jarvis-gold/10",
    archived: "text-jarvis-cyan border-jarvis-cyan/50 bg-jarvis-cyan/10",
  };

  return (
    <HudShell session="MARK REGISTRY">
      <div className="h-full flex flex-col">
        <motion.header
          className="mb-4 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="text-[10px] tracking-[0.4em] text-jarvis-cyan/60">
              // HALL OF ARMOR // MALIBU VAULT
            </div>
            <TextScramble className="text-2xl tracking-[0.3em] text-jarvis-cyan inline-block" duration={0.6}>
              SUIT REGISTRY
            </TextScramble>
          </div>
          <div className="flex items-center gap-3">
            <HexBadge>{suits.length} UNITS</HexBadge>
            <motion.button
              className="btn-hud btn-gold"
              onClick={resync}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              RESYNC TELEMETRY
            </motion.button>
            <motion.button
              className="btn-hud"
              onClick={logout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              DISENGAGE
            </motion.button>
          </div>
        </motion.header>

        <FadeIn delay={0.15}>
          <div className="hud-panel hud-corners p-3 mb-3 flex items-center justify-between gap-6 relative overflow-hidden">
            <BorderBeam colorFrom="#f59e0b" colorTo="#22d3ee" size={50} duration={8} />
            <div className="flex items-center gap-6">
              <div>
                <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60">HEARTBEAT</div>
                <div className="text-3xl tracking-[0.25em] text-jarvis-gold font-mono">
                  {heartbeat != null ? (
                    <AnimatedNumber value={heartbeat} padStart={5} className="text-jarvis-gold" />
                  ) : "—"}
                </div>
                <div className="text-[8px] tracking-[0.25em] text-jarvis-cyan/40">
                  should change on every RESYNC
                </div>
              </div>
              <div className="h-12 w-px bg-jarvis-cyan/20" />
              <div>
                <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60">SHOWING</div>
                <div className="text-3xl tracking-[0.25em] text-jarvis-cyan font-mono">
                  {renderedMark != null ? (
                    <TextScramble duration={0.4} characterSet="0123456789MARK ">
                      {`MARK ${renderedMark}`}
                    </TextScramble>
                  ) : (
                    <TextScramble duration={0.4} characterSet="ALMARKS ">ALL MARKS</TextScramble>
                  )}
                </div>
                <div className="text-[8px] tracking-[0.25em] text-jarvis-cyan/40">
                  mark number currently rendered
                </div>
              </div>
            </div>
            {lastSync && (
              <div className="text-right">
                <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60">LAST SYNC</div>
                <div className="text-sm tracking-[0.25em] text-jarvis-cyan font-mono">
                  {new Date(lastSync).toLocaleTimeString()}
                </div>
                <div className="text-[8px] tracking-[0.25em] text-jarvis-cyan/40">
                  // if this does not advance on RESYNC, inspect Network
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <form onSubmit={applyFilter} className="flex items-end gap-3 mb-4 hud-panel hud-corners p-3">
            <div className="flex-1 max-w-xs">
              <label className="text-[9px] text-jarvis-cyan/70 tracking-[0.3em]">
                FILTER BY MARK NUMBER
              </label>
              <input
                className="input-hud mt-1"
                type="number"
                placeholder="e.g. 42"
                value={markInput}
                onChange={(e) => setMarkInput(e.target.value)}
              />
            </div>
            <motion.button type="submit" className="btn-hud" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              APPLY
            </motion.button>
            <motion.button
              type="button"
              className="btn-hud"
              onClick={() => { setMarkInput(""); setMarkApplied(""); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              CLEAR
            </motion.button>
            <div className="flex-1 text-right text-[9px] text-jarvis-cyan/50 tracking-widest flex items-center justify-end gap-2">
              {loading && (
                <motion.span
                  className="inline-block w-3 h-3 border-2 border-jarvis-cyan/30 border-t-jarvis-cyan rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              )}
              STATUS // {loading ? "QUERYING..." : "READY"}
            </div>
          </form>
        </FadeIn>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="hud-panel hud-corners p-5 text-jarvis-red bg-jarvis-red/5 overflow-hidden"
            >
              <div className="tracking-widest text-[10px] mb-2">// SYSTEM ERROR</div>
              <div className="text-xs">{error}</div>
              <div className="text-[9px] mt-3 text-jarvis-red/60 tracking-wider">
                Inspect Network + Application tabs for diagnostics.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !error && (
          <StaggerGroup stagger={0.06} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-1">
            {suits.map((s) => (
              <StaggerItem key={s.id}>
                <Link
                  href={`/suits/${s.id}`}
                  className="hud-panel hud-corners p-4 group hover:bg-jarvis-cyan/5 transition-all block relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60">
                        MARK {s.mark} // {s.year}
                      </div>
                      <div className="text-base tracking-[0.2em] text-jarvis-cyan mt-1">{s.name}</div>
                      <div className="text-[10px] italic text-slate-400">&quot;{s.codename}&quot;</div>
                    </div>
                    <span
                      className={`text-[9px] tracking-[0.25em] border px-2 py-1 ${statusColor[s.status] || ""}`}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="relative aspect-square bg-jarvis-bg/70 border border-jarvis-cyan/20 overflow-hidden">
                    <div className="absolute inset-0 hud-hexpattern opacity-30" />
                    <SuitSilhouette
                      mark={s.mark}
                      codename={s.codename}
                      {...paletteFor(s.id)}
                      className="relative w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 text-[9px] tracking-[0.25em] text-jarvis-cyan/70 bg-jarvis-bg/60 px-2 py-0.5 border border-jarvis-cyan/30">
                      ID // {s.id.toUpperCase()}
                    </div>
                    <div className="absolute bottom-2 right-2 text-[9px] tracking-[0.25em] text-jarvis-gold/80 bg-jarvis-bg/60 px-2 py-0.5 border border-jarvis-gold/30">
                      {s.classification}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[9px] tracking-[0.25em] text-jarvis-cyan/60">
                    <span>VIEW HUD BRIEFING</span>
                    <motion.span
                      className="text-jarvis-cyan"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                    >
                      &rarr;
                    </motion.span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <motion.div
              className="w-12 h-12 border-2 border-jarvis-cyan/20 border-t-jarvis-cyan rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <TextScramble className="text-jarvis-cyan tracking-[0.4em] text-sm" duration={1.5}>
              QUERYING VAULT...
            </TextScramble>
          </div>
        )}
      </div>
    </HudShell>
  );
}
