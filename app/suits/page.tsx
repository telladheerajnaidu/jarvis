"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Suit = {
  id: string;
  mark: number;
  name: string;
  codename: string;
  status: string;
  year: number;
  image: string;
};

export default function SuitsPage() {
  const [suits, setSuits] = useState<Suit[]>([]);
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
        setError("UNAUTHORIZED // session token not accepted by /api/suits");
        setSuits([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSuits(data.suits);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (e) {
      setError("Network error");
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
    online: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
    offline: "text-slate-400 border-slate-400/40 bg-slate-400/10",
    damaged: "text-jarvis-gold border-jarvis-gold/40 bg-jarvis-gold/10",
    archived: "text-jarvis-cyan border-jarvis-cyan/40 bg-jarvis-cyan/10",
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="arc-reactor" style={{ width: 48, height: 48 }} />
          <div>
            <div className="text-xl tracking-[0.3em] text-jarvis-cyan">SUIT REGISTRY</div>
            <div className="text-[10px] text-jarvis-cyan/60 tracking-widest">
              HALL OF ARMOR // MALIBU VAULT
            </div>
          </div>
        </div>
        <button onClick={logout} className="btn">DISENGAGE</button>
      </header>

      <form onSubmit={applyFilter} className="flex gap-3 mb-8 items-end">
        <div className="flex-1 max-w-xs">
          <label className="text-[10px] text-jarvis-cyan/70 tracking-widest">
            FILTER BY MARK NUMBER
          </label>
          <input
            className="input mt-1"
            type="number"
            placeholder="e.g. 42"
            value={markInput}
            onChange={(e) => setMarkInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn">APPLY</button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setMarkInput("");
            setMarkApplied("");
            setTimeout(loadSuits, 0);
          }}
        >
          CLEAR
        </button>
      </form>

      {error && (
        <div className="hud-border p-6 text-jarvis-red bg-jarvis-red/5 mb-6">
          <div className="tracking-widest text-xs mb-2">// SYSTEM ERROR</div>
          <div className="text-sm">{error}</div>
          <div className="text-[10px] mt-3 text-jarvis-red/60">
            Inspect Network + Application tabs for diagnostics.
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-jarvis-cyan tracking-widest">LOADING...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {suits.map((s) => (
            <Link
              key={s.id}
              href={`/suits/${s.id}`}
              className="hud-border bg-jarvis-panel/60 p-5 hover:shadow-hud transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] text-jarvis-cyan/60 tracking-widest">
                    MARK {s.mark} // {s.year}
                  </div>
                  <div className="text-lg text-jarvis-cyan mt-1 tracking-wider">{s.name}</div>
                  <div className="text-xs text-slate-400 italic">{s.codename}</div>
                </div>
                <span
                  className={`text-[9px] tracking-widest border px-2 py-1 ${
                    statusColor[s.status] || ""
                  }`}
                >
                  {s.status.toUpperCase()}
                </span>
              </div>
              <div className="aspect-square bg-jarvis-bg/50 border border-jarvis-cyan/20 flex items-center justify-center overflow-hidden">
                <img
                  src={s.image}
                  alt={s.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
