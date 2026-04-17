"use client";

export function ConcentricRings({ size = 520 }: { size?: number }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 m-auto" style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,0.35))" }}>
      <defs>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0f7ff" />
          <stop offset="30%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
      </defs>

      {/* Outer ring with tick marks */}
      <g className="ring-rotate-slow" style={{ transformOrigin: `${c}px ${c}px` }}>
        <circle cx={c} cy={c} r={c - 8} fill="none" stroke="#fde047" strokeOpacity="0.35" strokeWidth="1" />
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i * 360) / 60;
          const isMajor = i % 5 === 0;
          const r1 = c - 8;
          const r2 = c - (isMajor ? 20 : 14);
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={c + r1 * Math.cos(rad)}
              y1={c + r1 * Math.sin(rad)}
              x2={c + r2 * Math.cos(rad)}
              y2={c + r2 * Math.sin(rad)}
              stroke={isMajor ? "#fde047" : "#ef4444"}
              strokeWidth={isMajor ? 1.5 : 0.7}
              strokeOpacity="0.7"
            />
          );
        })}
        {/* accent arcs */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = c + (c - 8) * Math.cos(rad);
          const y = c + (c - 8) * Math.sin(rad);
          return <circle key={deg} cx={x} cy={y} r="4" fill="#fde047" />;
        })}
      </g>

      {/* Mid ring - dashed */}
      <g className="ring-rotate-mid" style={{ transformOrigin: `${c}px ${c}px` }}>
        <circle
          cx={c} cy={c} r={c - 52}
          fill="none" stroke="#fde047" strokeOpacity="0.45"
          strokeWidth="1" strokeDasharray="2 6"
        />
        <circle cx={c} cy={c} r={c - 60} fill="none" stroke="#ef4444" strokeOpacity="0.3" strokeWidth="1" />
        {Array.from({ length: 4 }).map((_, i) => {
          const a = (i * 360) / 4 + 22;
          const rad = (a * Math.PI) / 180;
          return (
            <g key={i}>
              <line
                x1={c + (c - 70) * Math.cos(rad)}
                y1={c + (c - 70) * Math.sin(rad)}
                x2={c + (c - 50) * Math.cos(rad)}
                y2={c + (c - 50) * Math.sin(rad)}
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </g>

      {/* Inner ring */}
      <g className="ring-rotate-fast" style={{ transformOrigin: `${c}px ${c}px` }}>
        <circle cx={c} cy={c} r={c - 100} fill="none" stroke="#fde047" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="60 10 20 10" />
        <circle cx={c} cy={c} r={c - 120} fill="none" stroke="#fde047" strokeOpacity="0.25" strokeWidth="0.6" />
      </g>

      {/* Crosshair */}
      <line x1={c} y1="20" x2={c} y2="50" stroke="#fde047" strokeOpacity="0.7" strokeWidth="1" />
      <line x1={c} y1={size - 20} x2={c} y2={size - 50} stroke="#fde047" strokeOpacity="0.7" strokeWidth="1" />
      <line x1="20" y1={c} x2="50" y2={c} stroke="#fde047" strokeOpacity="0.7" strokeWidth="1" />
      <line x1={size - 20} y1={c} x2={size - 50} y2={c} stroke="#fde047" strokeOpacity="0.7" strokeWidth="1" />

      {/* Center glow */}
      <circle cx={c} cy={c} r={c - 160} fill="url(#core)" opacity="0.7" />
    </svg>
  );
}

export function CircularDial({
  label,
  value,
  max = 100,
  unit = "",
  color = "#fde047",
  size = 110,
}: {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
  size?: number;
}) {
  const c = size / 2;
  const r = c - 10;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="4" />
        <circle
          cx={c} cy={c} r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 360) / 36;
          const rad = (a * Math.PI) / 180;
          const r1 = r - 10;
          const r2 = r - 6;
          return (
            <line
              key={i}
              x1={c + r1 * Math.cos(rad)}
              y1={c + r1 * Math.sin(rad)}
              x2={c + r2 * Math.cos(rad)}
              y2={c + r2 * Math.sin(rad)}
              stroke={color}
              strokeOpacity={i % 3 === 0 ? 0.5 : 0.15}
              strokeWidth="0.6"
            />
          );
        })}
        <text x={c} y={c - 2} textAnchor="middle" fontSize="18" fontWeight="600" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
          {value}
          <tspan fontSize="10" dx="2">{unit}</tspan>
        </text>
        <text x={c} y={c + 16} textAnchor="middle" fontSize="8" fill={color} opacity="0.7" letterSpacing="2">
          {label}
        </text>
      </svg>
    </div>
  );
}

export function TelemetryStream() {
  const lines = [
    "> SYS :: arc_reactor → 3.02 GJ output stable",
    "> NET :: uplink stark_malibu → 41ms ping",
    "> THR :: thruster_right → 94% efficiency",
    "> HUD :: overlay alpha reconciled",
    "> JRV :: natural language index ok",
    "> TEL :: altitude 0 ft // ground",
    "> SEC :: biometric lock engaged",
    "> AI  :: FRIDAY heartbeat nominal",
    "> SCN :: targeting scan idle",
    "> PWR :: battery cell 1 → 100%",
    "> REP :: repulsor capacitor charge 100%",
    "> RAD :: ambient spectrum clear",
    "> COM :: shield radio encrypted",
    "> SYS :: garage bay doors sealed",
    "> AI  :: session token issued",
    "> NAV :: gps lock acquired",
  ];
  const doubled = [...lines, ...lines];
  return (
    <div className="h-full overflow-hidden text-[10px] text-jarvis-cyan/70 leading-5 tracking-wider">
      <div className="telemetry-scroll">
        {doubled.map((l, i) => (
          <div key={i} className="whitespace-nowrap px-2 py-0.5 border-b border-jarvis-cyan/10">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WaveformBars({ count = 40 }: { count?: number }) {
  return (
    <div className="waveform w-full">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            animationDelay: `${(i * 60) % 900}ms`,
            animationDuration: `${900 + (i % 5) * 120}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function HexBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[9px] tracking-[0.3em] text-jarvis-cyan px-3 py-1 border border-jarvis-cyan/50 inline-block"
      style={{
        clipPath:
          "polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)",
      }}
    >
      {children}
    </span>
  );
}

// ============================================================
// Holosphere — CSS 3D wireframe sphere with crossing rings
// ============================================================

export function Holosphere({ size = 460 }: { size?: number }) {
  const ringConfigs = [
    { axis: "rotateY", deg: 0,   colorVar: "#fde047" },
    { axis: "rotateY", deg: 30,  colorVar: "#facc15" },
    { axis: "rotateY", deg: 60,  colorVar: "#f59e0b" },
    { axis: "rotateY", deg: 90,  colorVar: "#ef4444" },
    { axis: "rotateY", deg: 120, colorVar: "#facc15" },
    { axis: "rotateY", deg: 150, colorVar: "#fde047" },
    { axis: "rotateX", deg: 0,   colorVar: "#fde047", dashed: true },
    { axis: "rotateX", deg: 45,  colorVar: "#ef4444", dashed: true },
    { axis: "rotateX", deg: 90,  colorVar: "#facc15" },
  ];

  return (
    <div
      className="holo-stage"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="holo-sphere"
        style={{ width: size, height: size }}
      >
        {ringConfigs.map((r, i) => (
          <div
            key={i}
            className={`holo-ring ${r.dashed ? "dashed" : ""}`}
            style={{
              transform: `${r.axis}(${r.deg}deg)`,
              borderColor: r.colorVar,
              boxShadow: `0 0 18px ${r.colorVar}55, inset 0 0 22px ${r.colorVar}33`,
            }}
          />
        ))}
        {/* tick marks on equator */}
        <div
          className="holo-ring"
          style={{
            transform: "rotateX(90deg)",
            borderStyle: "dotted",
            borderColor: "#fde047",
          }}
        />
        {/* core glow */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "35%",
            background:
              "radial-gradient(circle, #fff7ed 0%, #fde047 30%, #ef4444 65%, transparent 90%)",
            boxShadow: "0 0 60px #ef4444, 0 0 100px #facc15",
            transform: "translateZ(0)",
            filter: "blur(1px)",
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// HoloCube — rotating 3D wireframe cube with HUD text faces
// ============================================================

export function HoloCube({ size = 180 }: { size?: number }) {
  const half = size / 2;
  const faces = [
    { t: `translateZ(${half}px)`,                          label: "FRONT" },
    { t: `translateZ(-${half}px) rotateY(180deg)`,         label: "REAR" },
    { t: `rotateY(90deg) translateZ(${half}px)`,           label: "PORT" },
    { t: `rotateY(-90deg) translateZ(${half}px)`,          label: "STBD" },
    { t: `rotateX(90deg) translateZ(${half}px)`,           label: "UP" },
    { t: `rotateX(-90deg) translateZ(${half}px)`,          label: "DN" },
  ];
  return (
    <div className="holo-stage" style={{ width: size, height: size }} aria-hidden>
      <div className="holo-cube" style={{ width: size, height: size }}>
        {faces.map((f, i) => (
          <span key={i} style={{ transform: f.t, width: size, height: size }}>
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}
