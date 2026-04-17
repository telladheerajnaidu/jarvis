type Props = {
  mark: number;
  primary: string;
  accent: string;
  codename?: string;
  status?: string;
  className?: string;
};

const PALETTES: Record<string, { primary: string; accent: string }> = {
  mk3: { primary: "#9333ea", accent: "#f59e0b" },
  mk7: { primary: "#9333ea", accent: "#f59e0b" },
  mk42: { primary: "#0891b2", accent: "#22d3ee" },
  mk43: { primary: "#9333ea", accent: "#f59e0b" },
  mk46: { primary: "#9333ea", accent: "#f59e0b" },
  mk50: { primary: "#ec4899", accent: "#22d3ee" },
  mk85: { primary: "#6b21a8", accent: "#22d3ee" },
};

export function paletteFor(id: string) {
  return PALETTES[id] || { primary: "#9333ea", accent: "#f59e0b" };
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let r = "";
  for (const [v, s] of map) {
    while (n >= v) { r += s; n -= v; }
  }
  return r;
}

export function SuitSilhouette({ mark, primary, accent, codename, status, className }: Props) {
  const roman = toRoman(mark);
  return (
    <div className={`relative flex flex-col items-center justify-center ${className || ""}`}>
      {/* concentric rings backdrop */}
      <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`glow-${mark}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#a855f7" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`reactor-${mark}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e0f2fe" />
            <stop offset="60%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="150" cy="150" r="140" fill={`url(#glow-${mark})`} />

        <g stroke="#ec4899" strokeOpacity="0.25" fill="none">
          <circle cx="150" cy="150" r="135" strokeDasharray="2 6" />
          <circle cx="150" cy="150" r="110" strokeDasharray="4 4" />
          <circle cx="150" cy="150" r="85" strokeDasharray="1 3" />
        </g>
        <g stroke={accent} strokeOpacity="0.35" fill="none">
          <circle cx="150" cy="150" r="125" strokeDasharray="1 9" />
        </g>

        {/* crosshair ticks */}
        <g stroke="#ec4899" strokeOpacity="0.5">
          <line x1="150" y1="10" x2="150" y2="24" />
          <line x1="150" y1="276" x2="150" y2="290" />
          <line x1="10" y1="150" x2="24" y2="150" />
          <line x1="276" y1="150" x2="290" y2="150" />
        </g>

        {/* corner brackets */}
        <g stroke={accent} strokeOpacity="0.5" strokeWidth="1.5" fill="none">
          <path d="M 20 35 L 20 20 L 35 20" />
          <path d="M 265 20 L 280 20 L 280 35" />
          <path d="M 280 265 L 280 280 L 265 280" />
          <path d="M 35 280 L 20 280 L 20 265" />
        </g>

        {/* arc reactor glow */}
        <circle cx="150" cy="150" r="50" fill={`url(#reactor-${mark})`} opacity="0.6" />

        {/* arc reactor core */}
        <g>
          <circle cx="150" cy="150" r="28" fill="none" stroke="#a855f7" strokeOpacity="0.6" />
          <circle cx="150" cy="150" r="22" fill="none" stroke="#ec4899" strokeOpacity="0.8" />
          <circle cx="150" cy="150" r="16" fill="#06b6d4" fillOpacity="0.25" />
          <circle cx="150" cy="150" r="10" fill="#bef264" fillOpacity="0.9">
            <animate attributeName="r" values="9;11;9" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.85;1;0.85" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="150" r="5" fill="#e0e7ff" />
          {/* radial coils */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const x1 = 150 + Math.cos(a) * 16;
            const y1 = 150 + Math.sin(a) * 16;
            const x2 = 150 + Math.cos(a) * 24;
            const y2 = 150 + Math.sin(a) * 24;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeOpacity="0.7" strokeWidth="1.5" />;
          })}
        </g>
      </svg>

      {/* text overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center select-none">
        <div
          className="text-[10px] tracking-[0.45em] font-mono"
          style={{ color: accent, opacity: 0.9 }}
        >
          // MARK {mark}
        </div>
        <div
          className="font-mono leading-none mt-2"
          style={{
            fontSize: "clamp(3.5rem, 9vw, 5.5rem)",
            color: primary,
            textShadow: `0 0 18px ${primary}66, 0 0 4px ${accent}`,
            letterSpacing: "0.08em",
          }}
        >
          {roman}
        </div>
        {codename && (
          <div
            className="text-[10px] tracking-[0.4em] mt-3 font-mono"
            style={{ color: "#ec4899", opacity: 0.85 }}
          >
            &quot;{codename.toUpperCase()}&quot;
          </div>
        )}
        {status && (
          <div
            className="text-[9px] tracking-[0.3em] mt-2 font-mono px-2 py-0.5 border"
            style={{ color: accent, borderColor: `${accent}55` }}
          >
            {status.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
