"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HudShell } from "../_components/HudChrome";
import { HexBadge } from "../_components/Rings";
import { SuitSilhouette, paletteFor } from "../_components/SuitSilhouette";

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
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h — bug M1

  async function loadSuits(markOverride?: string, opts?: { forceNetwork?: boolean }) {
    const mark = markOverride ?? markApplied;
    setLoading(true);
    setError(null);

    // Bug M1 — client-side localStorage cache with a 24h TTL and no way to
    // invalidate from the UI. The RESYNC button calls loadSuits() which hits
    // this path first: if the cached entry for the current mark is < 24h old,
    // it's returned verbatim and no fetch happens. Network tab stays quiet.
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
    // intentionally no AbortController — rapid APPLY clicks race (bug H1)
  }, [markApplied]);

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    setMarkApplied(markInput);
  }

  async function resync() {
    // The RESYNC button intentionally does NOT pass forceNetwork — so it
    // keeps reading from the localStorage cache and LAST SYNC never advances.
    // This is bug M1.
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
        <header className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.4em] text-jarvis-cyan/60">
              // HALL OF ARMOR // MALIBU VAULT
            </div>
            <h1 className="text-2xl tracking-[0.3em] text-jarvis-cyan flicker">SUIT REGISTRY</h1>
          </div>
          <div className="flex items-center gap-3">
            <HexBadge>{suits.length} UNITS</HexBadge>
            <button className="btn-hud btn-gold" onClick={resync}>RESYNC TELEMETRY</button>
            <button className="btn-hud" onClick={logout}>DISENGAGE</button>
          </div>
        </header>

        <div className="hud-panel hud-corners p-3 mb-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60">HEARTBEAT</div>
              <div className="text-3xl tracking-[0.25em] text-jarvis-gold font-mono">
                {heartbeat != null ? String(heartbeat).padStart(5, "0") : "—"}
              </div>
              <div className="text-[8px] tracking-[0.25em] text-jarvis-cyan/40">
                should change on every RESYNC
              </div>
            </div>
            <div className="h-12 w-px bg-jarvis-cyan/20" />
            <div>
              <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60">SHOWING</div>
              <div className="text-3xl tracking-[0.25em] text-jarvis-cyan font-mono">
                {renderedMark != null ? `MARK ${renderedMark}` : "ALL MARKS"}
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
                // if this does not advance on RESYNC, inspect Network → cache
              </div>
            </div>
          )}
        </div>

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
          <button type="submit" className="btn-hud">APPLY</button>
          <button
            type="button"
            className="btn-hud"
            onClick={() => {
              setMarkInput("");
              setMarkApplied("");
            }}
          >
            CLEAR
          </button>
          <div className="flex-1 text-right text-[9px] text-jarvis-cyan/50 tracking-widest">
            STATUS // {loading ? "QUERYING..." : "READY"}
          </div>
        </form>

        {error && (
          <div className="hud-panel hud-corners p-5 mb-4 text-jarvis-red bg-jarvis-red/5">
            <div className="tracking-widest text-[10px] mb-2">// SYSTEM ERROR</div>
            <div className="text-xs">{error}</div>
            <div className="text-[9px] mt-3 text-jarvis-red/60 tracking-wider">
              Inspect Network + Application tabs for diagnostics.
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-1">
            {suits.map((s) => (
              <Link
                key={s.id}
                href={`/suits/${s.id}`}
                className="hud-panel hud-corners p-4 group hover:bg-jarvis-cyan/5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[9px] tracking-[0.3em] text-jarvis-cyan/60">
                      MARK {s.mark} // {s.year}
                    </div>
                    <div className="text-base tracking-[0.2em] text-jarvis-cyan mt-1">{s.name}</div>
                    <div className="text-[10px] italic text-slate-400">"{s.codename}"</div>
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
                    className="relative w-full h-full group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 left-2 text-[9px] tracking-[0.25em] text-jarvis-cyan/70 bg-jarvis-bg/60 px-2 py-0.5 border border-jarvis-cyan/30">
                    ID // {s.id.toUpperCase()}
                  </div>
                  <div className="absolute bottom-2 right-2 text-[9px] tracking-[0.25em] text-jarvis-gold/80 bg-jarvis-bg/60 px-2 py-0.5 border border-jarvis-gold/30">
                    {s.classification}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-[9px] tracking-[0.25em] text-jarvis-cyan/60">
                  <span>↳ VIEW HUD BRIEFING</span>
                  <span className="text-jarvis-cyan">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center text-jarvis-cyan tracking-[0.4em] flicker">
            QUERYING VAULT...
          </div>
        )}
      </div>
    </HudShell>
  );
}
