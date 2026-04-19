"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ---- shared GLSL: Ashima simplex noise (3D) + fbm ----
const NOISE_GLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0,0.5,1.0,2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){
  float v = 0.0; float a = 0.5;
  for(int i=0;i<5;i++){ v += a*snoise(p); p *= 2.03; a *= 0.5; }
  return v;
}
`;

function Earth() {
  const earth = useRef<THREE.Mesh>(null!);
  const clouds = useRef<THREE.Mesh>(null!);

  const earthMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSunDir: { value: new THREE.Vector3(0.85, 0.3, 0.5).normalize() },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vLocalPos;
          varying vec3 vView;
          void main(){
            vNormal = normalize(normalMatrix * normal);
            vLocalPos = position;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = -normalize(mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          precision highp float;
          ${NOISE_GLSL}
          uniform float uTime;
          uniform vec3 uSunDir;
          varying vec3 vNormal;
          varying vec3 vLocalPos;
          varying vec3 vView;

          const vec3 OCEAN_DEEP     = vec3(0.030, 0.090, 0.205);
          const vec3 OCEAN_SHALLOW  = vec3(0.115, 0.325, 0.475);
          const vec3 LAND_FOREST    = vec3(0.245, 0.345, 0.200);
          const vec3 LAND_SAVANNA   = vec3(0.470, 0.430, 0.260);
          const vec3 LAND_DESERT    = vec3(0.620, 0.500, 0.320);
          const vec3 LAND_TUNDRA    = vec3(0.520, 0.540, 0.500);
          const vec3 ICE            = vec3(0.935, 0.960, 1.000);
          const vec3 ATMO_DAY       = vec3(0.440, 0.680, 0.940);
          const vec3 SUN_COL        = vec3(1.050, 0.920, 0.780);
          const vec3 AMBIENT        = vec3(0.055, 0.080, 0.140);

          void main(){
            vec3 n = normalize(vLocalPos);
            float base   = fbm(n * 1.65);
            float detail = fbm(n * 6.1) * 0.32;
            float h = base + detail;
            float land = smoothstep(0.02, 0.19, h);
            float lat = abs(n.y);

            float oceanNoise = fbm(n * 3.1) * 0.5 + 0.5;
            vec3 ocean = mix(OCEAN_DEEP, OCEAN_SHALLOW, oceanNoise * (1.0 - lat * 0.55));

            float aridBand = smoothstep(0.16, 0.40, lat) * (1.0 - smoothstep(0.48, 0.78, lat));
            vec3 land_col = mix(LAND_FOREST, LAND_SAVANNA, aridBand);
            land_col = mix(land_col, LAND_DESERT, smoothstep(0.22, 0.55, h) * aridBand);
            land_col = mix(land_col, LAND_TUNDRA, smoothstep(0.55, 0.78, lat));

            float ice = smoothstep(0.80, 0.94, lat);
            vec3 surface = mix(ocean, land_col, land);
            surface = mix(surface, ICE, ice);

            float coastBand = 1.0 - smoothstep(0.0, 0.045, abs(h - 0.04));
            surface = mix(surface, surface + vec3(0.06, 0.10, 0.12), coastBand * 0.35);

            float lambert = max(dot(normalize(vNormal), normalize(uSunDir)), 0.0);
            float wrap = pow(lambert, 0.85);
            vec3 lit = surface * (AMBIENT + SUN_COL * wrap);

            float night = 1.0 - wrap;
            vec3 cities = vec3(0.92, 0.72, 0.36) * land * pow(night, 1.4) * 0.30;
            lit += cities;

            float term = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.2);
            lit += ATMO_DAY * term * (0.18 + wrap * 0.35);

            gl_FragColor = vec4(lit, 1.0);
          }
        `,
      }),
    [],
  );

  const cloudMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uSunDir: { value: new THREE.Vector3(0.85, 0.3, 0.5).normalize() },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vLocalPos;
          void main(){
            vNormal = normalize(normalMatrix * normal);
            vLocalPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;
          ${NOISE_GLSL}
          uniform float uTime;
          uniform vec3 uSunDir;
          varying vec3 vNormal;
          varying vec3 vLocalPos;
          void main(){
            vec3 n = normalize(vLocalPos);
            float c = fbm(n * 2.5 + vec3(uTime * 0.02, 0.0, 0.0));
            c = smoothstep(0.05, 0.42, c);
            float band = 1.0 - smoothstep(0.58, 0.96, abs(n.y));
            float a = c * band;
            float lambert = max(dot(normalize(vNormal), normalize(uSunDir)), 0.0);
            float shade = 0.35 + 0.65 * pow(lambert, 0.9);
            vec3 col = vec3(0.965, 0.950, 0.920) * shade;
            gl_FragColor = vec4(col, a * 0.82);
          }
        `,
      }),
    [],
  );

  useFrame((_, d) => {
    if (earth.current) earth.current.rotation.y += d * 0.055;
    if (clouds.current) clouds.current.rotation.y += d * 0.082;
    earthMat.uniforms.uTime.value += d;
    cloudMat.uniforms.uTime.value += d;
  });

  return (
    <group rotation={[0.32, 0, 0]}>
      <mesh ref={earth} material={earthMat}>
        <sphereGeometry args={[1.55, 96, 96]} />
      </mesh>
      <mesh ref={clouds} material={cloudMat}>
        <sphereGeometry args={[1.585, 96, 96]} />
      </mesh>
      <Atmosphere />
    </group>
  );
}

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[1.74, 96, 96]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        uniforms={{
          uColor: { value: new THREE.Color("#6fa8d6") },
          uWarm: { value: new THREE.Color("#e3b089") },
        }}
        vertexShader={`
          varying vec3 vN;
          varying vec3 vV;
          void main(){
            vN = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vV = -normalize(mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform vec3 uWarm;
          varying vec3 vN;
          varying vec3 vV;
          void main(){
            float f = 1.0 - max(dot(normalize(vN), normalize(vV)), 0.0);
            float halo = pow(f, 2.6);
            float warm = pow(f, 6.0);
            vec3 col = mix(uColor, uWarm, warm * 0.7);
            gl_FragColor = vec4(col, halo * 0.85);
          }
        `}
      />
    </mesh>
  );
}

function Moon() {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime * 0.11;
    group.current.position.x = Math.cos(t) * 3.05;
    group.current.position.z = Math.sin(t) * 3.05;
    group.current.position.y = Math.sin(t * 0.4) * 0.30;
  });
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshStandardMaterial color="#d7cfbe" roughness={0.95} metalness={0.02} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[5, 2.3, 4]} color="#fff4df" intensity={1.6} />
      <Stars radius={90} depth={40} count={3500} factor={2} fade speed={0.6} />
      <Earth />
      <Moon />
    </>
  );
}

export function OrbitalCore3D({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0.2, 5.4], fov: 44 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.8]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
