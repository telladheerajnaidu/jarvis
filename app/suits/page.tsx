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

  async function loadSuits() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/suits?mark=${markApplied}`);
      if (res.status === 401) {
        setError("UNAUTHORIZED // SESSION TOKEN REJECTED BY /api/suits");
        setSuits([]);
        return;
      }
      const data = await res.json();
      if (data.success) setSuits(data.suits);
      else setError(data.error || "UNKNOWN ERROR");
    } catch {
      setError("NETWORK ERROR // CHECK UPLINK");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuits();
  }, []);

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    loadSuits();
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
            <button className="btn-hud" onClick={logout}>DISENGAGE</button>
          </div>
        </header>

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
              setTimeout(loadSuits, 0);
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
                    {...paletteFor(s.id)}
                    className="relative w-full h-full p-4 group-hover:scale-105 transition-transform"
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
