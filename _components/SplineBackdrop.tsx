"use client";

import { useEffect, useRef, useState } from "react";

export function SplineBackdrop({ scene, className }: { scene: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    let app: any = null;
    let cancelled = false;

    (async () => {
      try {
        const mod: any = await import("@splinetool/runtime");
        if (cancelled || !canvasRef.current) return;
        const Application = mod.Application;
        app = new Application(canvasRef.current);
        await app.load(scene);
        if (cancelled) {
          app?.dispose?.();
          return;
        }
        setReady(true);
      } catch (err) {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      try {
        app?.dispose?.();
      } catch {}
    };
  }, [scene]);

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: ready ? 0.55 : 0,
        transition: "opacity 900ms ease-out",
      }}
    >
      {!failed && <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />}
    </div>
  );
}
