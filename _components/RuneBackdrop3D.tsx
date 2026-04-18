"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Rune() {
  const outer = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const core = useRef<THREE.Mesh>(null!);

  useFrame((state, d) => {
    const t = state.clock.elapsedTime;
    if (outer.current) {
      outer.current.rotation.y += d * 0.22;
      outer.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
    if (inner.current) {
      inner.current.rotation.y -= d * 0.35;
      inner.current.rotation.z += d * 0.12;
    }
    if (core.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.08;
      core.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      <mesh ref={outer}>
        <icosahedronGeometry args={[2.1, 2]} />
        <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={inner}>
        <torusKnotGeometry args={[1.15, 0.08, 160, 16, 2, 5]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.75} />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[0.6, 48, 48]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.35, 64, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          uniforms={{
            uA: { value: new THREE.Color("#a855f7") },
            uB: { value: new THREE.Color("#67e8f9") },
          }}
          vertexShader={`
            varying vec3 vN; varying vec3 vV;
            void main(){
              vN = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position,1.0);
              vV = -normalize(mv.xyz);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={`
            uniform vec3 uA; uniform vec3 uB;
            varying vec3 vN; varying vec3 vV;
            void main(){
              float f = 1.0 - max(dot(normalize(vN), normalize(vV)),0.0);
              f = pow(f, 2.2);
              gl_FragColor = vec4(mix(uB,uA,f), f*0.9);
            }
          `}
        />
      </mesh>
    </group>
  );
}

function OrbitTracers() {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, d) => {
    if (group.current) group.current.rotation.y += d * 0.08;
  });
  const ringConfigs = useMemo(
    () => [
      { r: 3.1, tilt: [0.4, 0, 0] as [number, number, number], c: "#67e8f9" },
      { r: 3.45, tilt: [-0.55, 0.3, 0] as [number, number, number], c: "#ec4899" },
      { r: 2.8, tilt: [1.1, 0.2, 0.3] as [number, number, number], c: "#a855f7" },
    ],
    [],
  );
  return (
    <group ref={group}>
      {ringConfigs.map((cfg, i) => (
        <mesh key={i} rotation={cfg.tilt}>
          <torusGeometry args={[cfg.r, 0.006, 8, 180]} />
          <meshBasicMaterial color={cfg.c} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 3, 5]} color="#ec4899" intensity={1.8} distance={14} />
      <pointLight position={[-4, -2, 3]} color="#67e8f9" intensity={1.1} distance={14} />
      <Rune />
      <OrbitTracers />
      <Sparkles count={120} size={3} speed={0.3} scale={[9, 9, 9]} color="#c4b5fd" />
    </>
  );
}

export function RuneBackdrop3D({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.75 }}
    >
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.6]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
