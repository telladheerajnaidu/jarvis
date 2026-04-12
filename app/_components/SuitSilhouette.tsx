type Props = {
  mark: number;
  primary: string;
  accent: string;
  className?: string;
};

const PALETTES: Record<string, { primary: string; accent: string }> = {
  mk3: { primary: "#b91c1c", accent: "#f59e0b" },
  mk7: { primary: "#b91c1c", accent: "#f59e0b" },
  mk42: { primary: "#b45309", accent: "#fde047" },
  mk43: { primary: "#b91c1c", accent: "#f59e0b" },
  mk46: { primary: "#b91c1c", accent: "#f59e0b" },
  mk50: { primary: "#dc2626", accent: "#fbbf24" },
  mk85: { primary: "#7f1d1d", accent: "#fbbf24" },
};

export function paletteFor(id: string) {
  return PALETTES[id] || { primary: "#b91c1c", accent: "#f59e0b" };
}

export function SuitSilhouette({ mark, primary, accent, className }: Props) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`body-${mark}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primary} stopOpacity="0.85" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id={`reactor-${mark}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* background hex hint */}
      <g opacity="0.08" stroke="#22d3ee" strokeWidth="0.5" fill="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx="150" cy="150" r={40 + i * 18} />
        ))}
      </g>

      {/* helmet dome */}
      <path
        d="M 95 70 Q 95 35 150 35 Q 205 35 205 70 L 205 120 Q 205 135 195 140 L 105 140 Q 95 135 95 120 Z"
        fill={`url(#body-${mark})`}
        stroke={accent}
        strokeWidth="2"
      />
      {/* faceplate split */}
      <line x1="150" y1="40" x2="150" y2="138" stroke={accent} strokeOpacity="0.5" strokeWidth="1" />
      {/* eye slits */}
      <path
        d="M 115 95 Q 130 88 145 95 L 145 102 Q 130 98 115 102 Z"
        fill={accent}
      />
      <path
        d="M 155 95 Q 170 88 185 95 L 185 102 Q 170 98 155 102 Z"
        fill={accent}
      />

      {/* neck */}
      <rect x="130" y="140" width="40" height="15" fill={primary} fillOpacity="0.6" />

      {/* shoulders + chest */}
      <path
        d="M 55 165 Q 75 150 100 155 L 200 155 Q 225 150 245 165 L 240 210 Q 225 220 210 215 L 210 250 Q 150 260 90 250 L 90 215 Q 75 220 60 210 Z"
        fill={`url(#body-${mark})`}
        stroke={accent}
        strokeWidth="2"
      />
      {/* armor plates */}
      <line x1="100" y1="175" x2="200" y2="175" stroke={accent} strokeOpacity="0.4" />
      <line x1="120" y1="195" x2="180" y2="195" stroke={accent} strokeOpacity="0.4" />

      {/* arc reactor */}
      <circle cx="150" cy="195" r="14" fill={`url(#reactor-${mark})`} />
      <circle cx="150" cy="195" r="10" fill="#bef264" fillOpacity="0.9" />
      <circle cx="150" cy="195" r="5" fill="#fef9c3" />

      {/* mark label */}
      <text
        x="150"
        y="285"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="14"
        fill={accent}
        letterSpacing="4"
      >
        MK {mark}
      </text>
    </svg>
  );
}
