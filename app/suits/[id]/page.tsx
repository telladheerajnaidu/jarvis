"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  weapons: string[];
  description: string;
};

type SuitView = SuitApi & {
  powerOutput?: string;
  topSpeed?: string;
};

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
          setError("UNAUTHORIZED // session token not accepted");
          return;
        }
        const data = await res.json();
        if (data.success) setSuit(data.suit);
        else setError(data.error);
      } catch {
        setError("Network error");
      }
    }
    load();
  }, [params.id]);

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
      <main className="min-h-screen p-10">
        <div className="hud-border p-6 text-jarvis-red bg-jarvis-red/5 max-w-xl">
          <div className="tracking-widest text-xs mb-2">// SYSTEM ERROR</div>
          <div className="text-sm">{error}</div>
        </div>
        <Link href="/suits" className="btn inline-block mt-6">BACK TO REGISTRY</Link>
      </main>
    );
  }

  if (!suit) {
    return (
      <main className="min-h-screen p-10 text-jarvis-cyan tracking-widest">
        LOADING SUIT TELEMETRY...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/suits" className="btn">← REGISTRY</Link>
        <button onClick={downloadSpec} className="btn" disabled={downloading}>
          {downloading ? "TRANSMITTING..." : "DOWNLOAD SPEC SHEET"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="hud-border bg-jarvis-panel/60 p-6">
          <div className="aspect-square bg-jarvis-bg/50 flex items-center justify-center overflow-hidden">
            <img src={suit.image} alt={suit.name} className="max-h-full max-w-full object-contain" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-[10px] text-jarvis-cyan/60 tracking-widest">
              MARK {suit.mark} // {suit.year} // {suit.status.toUpperCase()}
            </div>
            <div className="text-3xl text-jarvis-cyan tracking-wider mt-1">{suit.name}</div>
            <div className="text-sm text-slate-400 italic">"{suit.codename}"</div>
          </div>

          <div className="hud-border bg-jarvis-panel/60 p-5 space-y-3 text-sm">
            <Row label="POWER OUTPUT" value={suit.powerOutput ?? "—"} />
            <Row label="TOP SPEED" value={suit.topSpeed ?? "—"} />
            <Row label="ARMOR" value={suit.armor} />
            <Row label="WEAPONS" value={suit.weapons.join(", ")} />
          </div>

          <div className="text-sm text-slate-300 leading-relaxed">{suit.description}</div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-jarvis-cyan/10 pb-2 last:border-0">
      <span className="text-[10px] text-jarvis-cyan/60 tracking-widest">{label}</span>
      <span className="text-jarvis-cyan">{value}</span>
    </div>
  );
}
