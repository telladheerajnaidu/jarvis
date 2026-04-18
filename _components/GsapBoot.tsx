"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export function GsapBoot({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-boot='rune']", {
        scale: 0.6,
        opacity: 0,
        filter: "blur(20px)",
        rotateX: -40,
        duration: 1.4,
      })
        .from("[data-boot='orbital']", { scale: 0.5, opacity: 0, duration: 1.0 }, "-=1.0")
        .from(
          "[data-boot='rail']",
          { x: -30, opacity: 0, duration: 0.6, stagger: 0.08 },
          "-=0.8"
        )
        .from(
          "[data-boot='auth']",
          { x: 40, opacity: 0, duration: 0.7 },
          "-=0.8"
        )
        .from(
          "[data-boot='ticker']",
          { y: 20, opacity: 0, duration: 0.5 },
          "-=0.6"
        );
    },
    { scope: root }
  );

  return (
    <div ref={root} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
