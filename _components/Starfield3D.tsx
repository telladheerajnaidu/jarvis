"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Particles({ count = 6000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const { viewport } = useThree();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const palette = [
      new THREE.Color("#ec4899"),
      new THREE.Color("#22d3ee"),
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#f8fafc"),
    ];
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 10;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = Math.random() * 1.4 + 0.3;
    }
    return { positions, colors, sizes };
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
    ref.current.rotation.x += delta * 0.005;
    const mx = state.mouse.x;
    const my = state.mouse.y;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mx * 0.6, 0.04);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, my * 0.6, 0.04);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function Starfield3D({ className }: { className?: string }) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 12], fov: 55 }}
        dpr={[1, 1.6]}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
