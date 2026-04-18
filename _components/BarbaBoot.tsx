"use client";

import { useEffect } from "react";
import gsap from "gsap";

export function BarbaBoot() {
  useEffect(() => {
    let destroyed = false;

    (async () => {
      const barba = (await import("@barba/core")).default;
      if (destroyed) return;

      const curtain = document.createElement("div");
      curtain.setAttribute("data-barba", "container");
      curtain.style.cssText = [
        "position:fixed",
        "inset:0",
        "z-index:90",
        "pointer-events:none",
        "background:radial-gradient(ellipse at 50% 50%,rgba(236,72,153,0.32) 0%,rgba(139,92,246,0.25) 30%,rgba(4,6,20,0.98) 72%)",
        "backdrop-filter:blur(18px) saturate(140%)",
        "-webkit-backdrop-filter:blur(18px) saturate(140%)",
        "overflow:hidden",
      ].join(";");

      // radial sweep behind rune
      const sweep = document.createElement("div");
      sweep.style.cssText = [
        "position:absolute",
        "inset:-40%",
        "background:conic-gradient(from 0deg,rgba(103,232,249,0) 0deg,rgba(103,232,249,0.35) 30deg,rgba(236,72,153,0.35) 120deg,rgba(139,92,246,0) 220deg,rgba(103,232,249,0) 360deg)",
        "filter:blur(40px)",
        "mix-blend-mode:screen",
        "opacity:0",
      ].join(";");
      curtain.appendChild(sweep);

      // scanlines
      const scan = document.createElement("div");
      scan.style.cssText = [
        "position:absolute",
        "inset:0",
        "background:repeating-linear-gradient(0deg,rgba(255,255,255,0.035) 0px,rgba(255,255,255,0.035) 1px,transparent 1px,transparent 3px)",
        "mix-blend-mode:overlay",
        "opacity:0",
      ].join(";");
      curtain.appendChild(scan);

      // center rune + legend
      const center = document.createElement("div");
      center.style.cssText = [
        "position:absolute",
        "inset:0",
        "display:flex",
        "flex-direction:column",
        "align-items:center",
        "justify-content:center",
        "gap:38px",
      ].join(";");

      // rune SVG (Elder Futhark Jera-inspired glyph). strokeDasharray lets us draw-on.
      const runeWrap = document.createElement("div");
      runeWrap.style.cssText = "position:relative;width:260px;height:260px;";
      runeWrap.innerHTML = `
        <svg viewBox="0 0 260 260" width="260" height="260" style="position:absolute;inset:0;filter:drop-shadow(0 0 24px rgba(236,72,153,0.7)) drop-shadow(0 0 8px rgba(103,232,249,0.55));">
          <defs>
            <linearGradient id="runeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#67e8f9" />
              <stop offset="55%" stop-color="#f472b6" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
          </defs>
          <circle id="runeRing" cx="130" cy="130" r="118" fill="none" stroke="url(#runeGrad)" stroke-width="1.2" stroke-opacity="0.85" />
          <circle id="runeRing2" cx="130" cy="130" r="104" fill="none" stroke="#67e8f9" stroke-opacity="0.35" stroke-width="0.8" stroke-dasharray="3 6" />
          <g id="runeGlyph" fill="none" stroke="url(#runeGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <path id="runePath1" d="M78 70 L130 130 L78 190" />
            <path id="runePath2" d="M182 70 L130 130 L182 190" />
            <path id="runePath3" d="M130 52 L130 208" />
          </g>
          <g id="runeTicks" stroke="#67e8f9" stroke-opacity="0.6" stroke-width="1">
            ${Array.from({ length: 24 })
              .map((_, i) => {
                const a = (i * 360) / 24;
                const rad = (a * Math.PI) / 180;
                const x1 = 130 + 124 * Math.cos(rad);
                const y1 = 130 + 124 * Math.sin(rad);
                const x2 = 130 + (i % 3 === 0 ? 134 : 130) * Math.cos(rad);
                const y2 = 130 + (i % 3 === 0 ? 134 : 130) * Math.sin(rad);
                return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
              })
              .join("")}
          </g>
        </svg>`;
      center.appendChild(runeWrap);

      const legend = document.createElement("div");
      legend.style.cssText = [
        "font-family:'Cinzel',serif",
        "font-size:13px",
        "letter-spacing:0.85em",
        "color:#f8fafc",
        "text-shadow:0 0 18px rgba(236,72,153,0.8),0 0 6px rgba(103,232,249,0.5)",
        "opacity:0",
        "padding-left:0.85em",
      ].join(";");
      legend.textContent = "SUMMONING  J.A.R.V.I.S.";
      center.appendChild(legend);

      const sub = document.createElement("div");
      sub.style.cssText = [
        "font-family:'JetBrains Mono',monospace",
        "font-size:10px",
        "letter-spacing:0.5em",
        "color:rgba(103,232,249,0.8)",
        "opacity:0",
      ].join(";");
      sub.textContent = "// QUANTUM HANDSHAKE ◆ AES-1024";
      center.appendChild(sub);

      curtain.appendChild(center);
      document.body.appendChild(curtain);

      // draw-on setup
      const paths = curtain.querySelectorAll<SVGPathElement>("#runeGlyph path");
      paths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
      });
      const ring = curtain.querySelector<SVGCircleElement>("#runeRing");
      const ring2 = curtain.querySelector<SVGCircleElement>("#runeRing2");
      if (ring) {
        const cLen = 2 * Math.PI * 118;
        ring.style.strokeDasharray = String(cLen);
        ring.style.strokeDashoffset = String(cLen);
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(sweep, { opacity: 1, duration: 0.6 }, 0)
        .to(sweep, { rotate: 180, duration: 2.6, ease: "none" }, 0)
        .to(scan, { opacity: 1, duration: 0.4 }, 0.1)
        .to(
          ring,
          { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" },
          0.15,
        )
        .to(
          paths,
          {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: "power2.inOut",
            stagger: 0.12,
          },
          0.35,
        )
        .to(ring2 as SVGCircleElement, { rotate: 360, transformOrigin: "130px 130px", duration: 2.4, ease: "none" }, 0.4)
        .to(legend, { opacity: 1, y: 0, duration: 0.7 }, 1.0)
        .fromTo(legend, { y: 12 }, { y: 0, duration: 0.7, ease: "power3.out" }, 1.0)
        .to(sub, { opacity: 1, duration: 0.5 }, 1.2)
        // hold the full tableau
        .to({}, { duration: 0.6 }, "+=0")
        // glitch flicker exit
        .to(curtain, { opacity: 0.4, duration: 0.05, ease: "steps(1)" }, "+=0.1")
        .to(curtain, { opacity: 1, duration: 0.05, ease: "steps(1)" }, "+=0.04")
        .to(curtain, { opacity: 0.2, duration: 0.05, ease: "steps(1)" }, "+=0.05")
        .to(curtain, { opacity: 1, duration: 0.05, ease: "steps(1)" }, "+=0.04")
        .to(
          curtain,
          {
            opacity: 0,
            filter: "blur(40px) saturate(200%)",
            scale: 1.08,
            duration: 0.85,
            ease: "power2.inOut",
            onComplete: () => curtain.remove(),
          },
          "+=0.05",
        );

      try {
        barba.init({
          prefetchIgnore: true,
          preventRunning: true,
          transitions: [{ name: "jarvis-boot", once: () => tl }],
        });
      } catch {
        // already animating via tl above — no-op
      }
    })();

    return () => {
      destroyed = true;
    };
  }, []);

  return null;
}
