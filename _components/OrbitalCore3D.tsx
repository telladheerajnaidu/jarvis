"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Globe() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.y += d * 0.18;
    ref.current.rotation.x += d * 0.04;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.8, 3]} />
      <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.55} />
    </mesh>
  );
}

function Core() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const s = 1 + Math.sin(t * 1.5) * 0.06;
    ref.current.scale.set(s, s, s);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.9, 48, 48]} />
      <meshBasicMaterial color="#ec4899" transparent opacity={0.35} />
    </mesh>
  );
}

function RimGlow() {
  return (
    <mesh>
      <sphereGeometry args={[2.05, 64, 64]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uColorA: { value: new THREE.Color("#ec4899") },
          uColorB: { value: new THREE.Color("#8b5cf6") },
        }}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = -normalize(mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float fres = 1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0);
            fres = pow(fres, 2.4);
            vec3 col = mix(uColorB, uColorA, fres);
            gl_FragColor = vec4(col, fres * 0.85);
          }
        `}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function OrbitRing({
  radius,
  rotation,
  color,
  speed,
}: {
  radius: number;
  rotation: [number, number, number];
  color: string;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.z += d * speed;
  });
  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, 0.006, 8, 160]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

function Satellite({
  radius,
  speed,
  color,
  offset,
  tilt,
}: {
  radius: number;
  speed: number;
  color: string;
  offset: number;
  tilt: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null!);
  const dot = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset;
    if (!dot.current || !group.current) return;
    dot.current.position.x = Math.cos(t) * radius;
    dot.current.position.z = Math.sin(t) * radius;
  });
  return (
    <group ref={group} rotation={tilt}>
      <mesh ref={dot}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} color="#ec4899" intensity={2} distance={12} />
      <pointLight position={[-4, -2, 3]} color="#67e8f9" intensity={1.2} distance={12} />
      <Core />
      <Globe />
      <RimGlow />
      <OrbitRing radius={2.6} rotation={[0.35, 0, 0]} color="#67e8f9" speed={0.12} />
      <OrbitRing radius={2.95} rotation={[-0.45, 0.4, 0]} color="#ec4899" speed={-0.08} />
      <OrbitRing radius={2.3} rotation={[1.15, 0.2, 0.3]} color="#8b5cf6" speed={0.18} />
      <Satellite radius={2.6} speed={0.7} color="#67e8f9" offset={0} tilt={[0.35, 0, 0]} />
      <Satellite radius={2.95} speed={-0.55} color="#ec4899" offset={Math.PI / 2} tilt={[-0.45, 0.4, 0]} />
      <Satellite radius={2.3} speed={0.9} color="#f8fafc" offset={Math.PI} tilt={[1.15, 0.2, 0.3]} />
      <Sparkles count={80} size={3} speed={0.35} scale={[7, 7, 7]} color="#c4b5fd" />
    </>
  );
}

export function OrbitalCore3D({ className }: { className?: string }) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.6]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
