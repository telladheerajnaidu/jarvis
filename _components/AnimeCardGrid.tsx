"use client";

import { animate, stagger, utils } from "animejs";
import { useEffect, useRef } from "react";

export function AnimeCardGrid({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cards = Array.from(ref.current.querySelectorAll<HTMLElement>("[data-anime-card]"));
    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      const chips = Array.from(card.querySelectorAll<HTMLElement>("[data-anime-chip]"));

      const onEnter = () => {
        utils.remove(chips);
        animate(chips, {
          translateY: [8, 0],
          opacity: [0.3, 1],
          delay: stagger(40),
          duration: 520,
          ease: "outExpo",
        });
        utils.remove(card);
        animate(card, {
          boxShadow: [
            "0 0 0 rgba(236,72,153,0)",
            "0 0 32px rgba(236,72,153,0.35)",
          ],
          duration: 600,
          ease: "outQuad",
        });
      };
      const onLeave = () => {
        utils.remove(card);
        animate(card, {
          boxShadow: "0 0 0 rgba(236,72,153,0)",
          duration: 400,
          ease: "outQuad",
        });
      };
      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  });

  return <div ref={ref} style={{ display: "contents" }}>{children}</div>;
}
