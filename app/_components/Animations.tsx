"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { motion, useSpring, useTransform, useInView, useMotionValue, type Transition } from "motion/react";

// ============================================================
// TextScramble — character-by-character reveal with random chars
// Adapted from motion-primitives
// ============================================================

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
  className,
  trigger = true,
  onComplete,
}: {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  className?: string;
  trigger?: boolean;
  onComplete?: () => void;
}) {
  const [display, setDisplay] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const text = children;

  useEffect(() => {
    if (!trigger || animating) return;
    setAnimating(true);
    const steps = duration / speed;
    let step = 0;
    const interval = setInterval(() => {
      let scrambled = "";
      const progress = step / steps;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") { scrambled += " "; continue; }
        if (progress * text.length > i) scrambled += text[i];
        else scrambled += characterSet[Math.floor(Math.random() * characterSet.length)];
      }
      setDisplay(scrambled);
      step++;
      if (step > steps) {
        clearInterval(interval);
        setDisplay(null);
        setAnimating(false);
        onComplete?.();
      }
    }, speed * 1000);
    return () => clearInterval(interval);
  }, [trigger]);

  return <span className={className}>{display ?? children}</span>;
}

// ============================================================
// AnimatedNumber — spring-based number counter
// Adapted from motion-primitives
// ============================================================

export function AnimatedNumber({
  value,
  className,
  padStart,
}: {
  value: number;
  className?: string;
  padStart?: number;
}) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => {
    const n = Math.round(current);
    return padStart ? String(n).padStart(padStart, "0") : n.toLocaleString();
  });

  useEffect(() => { spring.set(value); }, [spring, value]);

  return <motion.span className={`tabular-nums ${className || ""}`}>{display}</motion.span>;
}

// ============================================================
// NumberTicker — spring ticker that starts on view
// Adapted from magic-ui
// ============================================================

export function NumberTicker({
  value,
  startValue = 0,
  className,
  decimalPlaces = 0,
  delay = 0,
}: {
  value: number;
  startValue?: number;
  className?: string;
  decimalPlaces?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(startValue);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => motionValue.set(value), delay * 1000);
      return () => clearTimeout(t);
    }
  }, [motionValue, isInView, delay, value]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
        }
      }),
    [springValue, decimalPlaces],
  );

  return (
    <span ref={ref} className={`inline-block tabular-nums ${className || ""}`}>
      {startValue}
    </span>
  );
}

// ============================================================
// BorderBeam — animated beam traveling along element border
// Adapted from magic-ui
// ============================================================

export function BorderBeam({
  size = 50,
  duration = 6,
  delay = 0,
  colorFrom = "#22d3ee",
  colorTo = "#f59e0b",
  borderWidth = 1,
  className,
}: {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
  className?: string;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        borderRadius: "inherit",
        border: `${borderWidth}px solid transparent`,
        maskImage: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
        maskClip: "padding-box, border-box",
      }}
    >
      <motion.div
        className={`absolute aspect-square ${className || ""}`}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
        }}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay }}
      />
    </div>
  );
}

// ============================================================
// GlowEffect — animated glow backdrop
// Adapted from motion-primitives
// ============================================================

export function GlowEffect({
  colors = ["#22d3ee", "#0891b2", "#f59e0b", "#22d3ee"],
  mode = "rotate",
  blur = "medium",
  duration = 5,
  className,
}: {
  colors?: string[];
  mode?: "rotate" | "pulse" | "breathe";
  blur?: "soft" | "medium" | "strong";
  duration?: number;
  className?: string;
}) {
  const blurClass = blur === "soft" ? "blur-sm" : blur === "strong" ? "blur-xl" : "blur-md";

  const animations = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(", ")})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(", ")})`,
      ],
    },
    pulse: {
      background: colors.map((c: string) => `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 100%)`),
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
    },
    breathe: {
      background: colors.map((c: string) => `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 100%)`),
      scale: [1, 1.05, 1],
    },
  } as const;

  return (
    <motion.div
      animate={animations[mode] as any}
      transition={{ repeat: Infinity, duration, ease: "linear" }}
      className={`pointer-events-none absolute inset-0 ${blurClass} ${className || ""}`}
      style={{ willChange: "transform" }}
    />
  );
}

// ============================================================
// Particles — canvas-based floating particle system
// Adapted from magic-ui
// ============================================================

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

type Circle = {
  x: number; y: number;
  translateX: number; translateY: number;
  size: number; alpha: number; targetAlpha: number;
  dx: number; dy: number; magnetism: number;
};

export function Particles({
  className = "",
  quantity = 80,
  color = "#22d3ee",
  size = 0.4,
  staticity = 50,
  ease = 50,
  ...props
}: ComponentPropsWithoutRef<"div"> & {
  quantity?: number;
  color?: string;
  size?: number;
  staticity?: number;
  ease?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const raf = useRef<number | null>(null);
  const rgb = hexToRgb(color);

  useEffect(() => {
    if (!canvasRef.current) return;
    ctxRef.current = canvasRef.current.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!containerRef.current || !canvasRef.current || !ctxRef.current) return;
      canvasSize.current.w = containerRef.current.offsetWidth;
      canvasSize.current.h = containerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      ctxRef.current.scale(dpr, dpr);
      circles.current = [];
      for (let i = 0; i < quantity; i++) circles.current.push(makeCircle());
    }

    function makeCircle(): Circle {
      return {
        x: Math.floor(Math.random() * canvasSize.current.w),
        y: Math.floor(Math.random() * canvasSize.current.h),
        translateX: 0, translateY: 0,
        size: Math.floor(Math.random() * 2) + size,
        alpha: 0,
        targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
        dx: (Math.random() - 0.5) * 0.1,
        dy: (Math.random() - 0.5) * 0.1,
        magnetism: 0.1 + Math.random() * 4,
      };
    }

    function animate() {
      if (!ctxRef.current) return;
      ctxRef.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
      circles.current.forEach((c, i) => {
        const edges = [
          c.x + c.translateX - c.size,
          canvasSize.current.w - c.x - c.translateX - c.size,
          c.y + c.translateY - c.size,
          canvasSize.current.h - c.y - c.translateY - c.size,
        ];
        const closest = Math.min(...edges);
        const remap = Math.max(0, Math.min(1, closest / 20));
        if (remap > 1) { c.alpha = Math.min(c.alpha + 0.02, c.targetAlpha); }
        else c.alpha = c.targetAlpha * remap;
        c.x += c.dx;
        c.y += c.dy;
        c.translateX += (mouse.current.x / (staticity / c.magnetism) - c.translateX) / ease;
        c.translateY += (mouse.current.y / (staticity / c.magnetism) - c.translateY) / ease;
        ctxRef.current!.translate(c.translateX, c.translateY);
        ctxRef.current!.beginPath();
        ctxRef.current!.arc(c.x, c.y, c.size, 0, 2 * Math.PI);
        ctxRef.current!.fillStyle = `rgba(${rgb.join(",")}, ${c.alpha})`;
        ctxRef.current!.fill();
        ctxRef.current!.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (c.x < -c.size || c.x > canvasSize.current.w + c.size ||
            c.y < -c.size || c.y > canvasSize.current.h + c.size) {
          circles.current.splice(i, 1);
          circles.current.push(makeCircle());
        }
      });
      raf.current = requestAnimationFrame(animate);
    }

    function onMouseMove(e: MouseEvent) {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left - canvasSize.current.w / 2;
      mouse.current.y = e.clientY - rect.top - canvasSize.current.h / 2;
    }

    resize();
    animate();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [color, quantity, size, staticity, ease]);

  return (
    <div ref={containerRef} className={`pointer-events-none ${className}`} aria-hidden {...props}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

// ============================================================
// TypingText — typewriter effect with blinking cursor
// Simplified from magic-ui
// ============================================================

export function TypingText({
  text,
  speed = 60,
  delay = 0,
  className,
  cursor = true,
  onComplete,
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); onComplete?.(); }
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  const done = displayed.length >= text.length;

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && <span className="inline-block w-2 h-4 bg-jarvis-cyan ml-0.5 animate-pulse" />}
    </span>
  );
}

// ============================================================
// TextRevealLine — motion fade+slide per line
// ============================================================

export function TextRevealLine({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// FadeIn — generic fade-in wrapper
// ============================================================

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const offsets = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// StaggerGroup — staggered children animation
// ============================================================

export function StaggerGroup({
  children,
  stagger = 0.08,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// PulseGlow — pulsing glow ring for status indicators
// ============================================================

export function PulseGlow({
  color = "#22d3ee",
  size = 8,
  className,
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`relative inline-flex ${className || ""}`}>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color, width: size, height: size }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span
        className="relative rounded-full"
        style={{ backgroundColor: color, width: size, height: size }}
      />
    </span>
  );
}
