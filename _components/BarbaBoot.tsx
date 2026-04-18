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
        "background:radial-gradient(circle at 50% 50%,rgba(236,72,153,0.35),rgba(10,10,30,0.95) 60%)",
        "backdrop-filter:blur(14px)",
        "-webkit-backdrop-filter:blur(14px)",
      ].join(";");
      curtain.innerHTML = `
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <div style="font-family:'Cinzel',serif;font-size:22px;letter-spacing:0.6em;color:#f8fafc;text-shadow:0 0 24px rgba(236,72,153,0.8);">
            SUMMONING J.A.R.V.I.S.
          </div>
        </div>`;
      document.body.appendChild(curtain);

      try {
        barba.init({
          prefetchIgnore: true,
          preventRunning: true,
          transitions: [
            {
              name: "jarvis-boot",
              once: ({ next }: any) => {
                return gsap.to(curtain, {
                  opacity: 0,
                  duration: 1.1,
                  delay: 0.25,
                  ease: "power2.inOut",
                  onComplete: () => curtain.remove(),
                });
              },
            },
          ],
        });
      } catch {
        gsap.to(curtain, { opacity: 0, duration: 0.9, onComplete: () => curtain.remove() });
      }
    })();

    return () => {
      destroyed = true;
    };
  }, []);

  return null;
}
