"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import { makeJadeMaterial } from "@/lib/jade";

/*
 * B3 SKELETAL SILK — the cocoon, per the full spec.
 * 眠 → 醒(inner light, one birth-quiver)→ 透(four cached params read
 * out)→ 骨(ridged-multifractal ridges push up from UNDER the silk:
 * displacement first, normal redistribution 0.3 — the light re-settles
 * on the ridgelines. AI's numbers become material behavior.)
 *
 * Jade SSS: Aura path (a) — the Aura source is not in this repo, so per
 * the spec's own branch (a) this is the MeshPhysicalMaterial parameter
 * set with the spec'd warm-white/honey values. (README: path a.)
 * Layers: the inner light lives on layer 3 with the shell only — it
 * cannot touch the worktop or the neighbours.
 */

const B3_LAYER = 3;
// silk cached parameters — baked constant (swatch-params.json silk entry
// as written into the spec; zero network)
const PARAMS = [
  { k: "rigidity", v: "0.18" },
  { k: "flow", v: "0.85" },
  { k: "specular", v: "0.80" },
  { k: "color", v: "#F0E6D8", swatch: true },
];

const RIG_REST = 0.18;
const RIG_PEAK = 0.6;

/** Silk-wrap normal map: low-freq winding around the long axis + high-freq
 *  thread noise. Built once from a height field, 512². */
function makeSilkNormalMap() {
  const S = 512;
  const h = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const wind = Math.sin((y / S) * Math.PI * 46 + Math.sin((x / S) * Math.PI * 4) * 2.2);
      const thread = Math.sin((y / S) * Math.PI * 240 + ((x * 7919) % 17) * 0.4);
      h[y * S + x] = wind * 0.7 + thread * 0.3 + (Math.random() - 0.5) * 0.25;
    }
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const dx = h[y * S + ((x + 1) % S)] - h[i];
      const dy = h[((y + 1) % S) * S + x] - h[i];
      img.data[i * 4] = 128 + dx * 90;
      img.data[i * 4 + 1] = 128 + dy * 90;
      img.data[i * 4 + 2] = 255;
      img.data[i * 4 + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Contact AO patch: soft radial gradient, no realtime AO. */
function makeAoTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grad.addColorStop(0, "rgba(26,23,20,0.30)");
  grad.addColorStop(0.6, "rgba(26,23,20,0.12)");
  grad.addColorStop(1, "rgba(26,23,20,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const RIDGE_GLSL = /* glsl */ `
  float b3hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }
  float b3noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = b3hash(i), n100 = b3hash(i + vec3(1,0,0));
    float n010 = b3hash(i + vec3(0,1,0)), n110 = b3hash(i + vec3(1,1,0));
    float n001 = b3hash(i + vec3(0,0,1)), n101 = b3hash(i + vec3(1,0,1));
    float n011 = b3hash(i + vec3(0,1,1)), n111 = b3hash(i + vec3(1,1,1));
    return mix(mix(mix(n000,n100,f.x), mix(n010,n110,f.x), f.y),
               mix(mix(n001,n101,f.x), mix(n011,n111,f.x), f.y), f.z);
  }
  // ridged multifractal, 3 octaves: 1 - |noise|
  float b3ridged(vec3 p) {
    float a = 0.5, v = 0.0;
    for (int i = 0; i < 3; i++) {
      v += a * (1.0 - abs(b3noise(p) * 2.0 - 1.0));
      p = p * 2.1 + 11.7;
      a *= 0.5;
    }
    return v;
  }
`;

export default function Cocoon({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate, camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const berth = useBenchStore((s) => s.berth);
  const boneNonce = useBenchStore((s) => s.b3BoneNonce);
  const reveal = useBenchStore((s) => s.b3Reveal);

  const [hover, setHover] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const awake = hover || berth === berthOf("skeletal-silk");

  const uniforms = useMemo(
    () => ({ uRigidity: { value: RIG_REST }, uBirth: { value: 0 } }),
    []
  );
  const aoTex = useMemo(makeAoTexture, []);

  // 64×48 ellipsoid with per-vertex ridge seeds
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(0.35, 64, 48);
    g.scale(1, 0.643, 0.643); // 0.7 × 0.45 × 0.45
    const n = g.attributes.position.count;
    const seeds = new Float32Array(n);
    let s = 977;
    for (let i = 0; i < n; i++) {
      s = (s * 16807) % 2147483647;
      seeds[i] = s / 2147483647;
    }
    g.setAttribute("aRidgeSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, []);

  const material = useMemo(() => {
    // jade from lib/jade (Aura path a), silk normals on top
    const m = makeJadeMaterial({ thickness: 0.4 });
    m.normalMap = makeSilkNormalMap();
    m.normalScale = new THREE.Vector2(0.15, 0.15);
    m.onBeforeCompile = (s) => {
      s.uniforms.uRigidity = uniforms.uRigidity;
      s.uniforms.uBirth = uniforms.uBirth;
      s.vertexShader =
        "attribute float aRidgeSeed;\nuniform float uRigidity;\nuniform float uBirth;\n" +
        RIDGE_GLSL +
        s.vertexShader
          .replace(
            "#include <beginnormal_vertex>",
            `#include <beginnormal_vertex>
            {
              // ridge normal redistribution (0.3 weight): the warm light
              // re-settles on the ridgelines
              float amp = uRigidity * 0.05;
              vec3 sp = position * 7.0 + aRidgeSeed * 0.6;
              vec3 t1 = normalize(cross(objectNormal, vec3(0.0, 1.0, 0.001)));
              vec3 t2 = cross(objectNormal, t1);
              float e = 0.35;
              float r0 = b3ridged(sp);
              float rx = b3ridged(sp + t1 * e);
              float ry = b3ridged(sp + t2 * e);
              objectNormal = normalize(
                objectNormal - (t1 * (rx - r0) + t2 * (ry - r0)) * amp * 0.3 * 40.0
              );
            }`
          )
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            {
              float amp = uRigidity * 0.05;
              vec3 sp = position * 7.0 + aRidgeSeed * 0.6;
              // ridges push up from under the silk: displacement first
              transformed += normal * b3ridged(sp) * amp;
              // birth quiver: one-shot local swell, ~0.5px
              transformed += normal * uBirth *
                0.0016 * sin(aRidgeSeed * 6.2832 + uBirth * 3.1416);
            }`
          );
    };
    return m;
  }, [uniforms]);

  // inner light: layer-isolated to the shell only
  useEffect(() => {
    camera.layers.enable(B3_LAYER);
    if (light.current) light.current.layers.set(B3_LAYER);
  }, [camera]);

  // 透: hover/focus sustained >0.4s reveals the read
  useEffect(() => {
    const on = awake || reveal;
    if (!on) {
      if (showParams) {
        setLeaving(true);
        const id = setTimeout(() => {
          setShowParams(false);
          setLeaving(false);
        }, 500);
        return () => clearTimeout(id);
      }
      return;
    }
    const id = setTimeout(() => setShowParams(true), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awake, reveal]);

  // 骨: attack 0.25 ease-out → hold 0.8 → release 2.0 ease-in-out
  const bone = useRef<{ t0: number; from: number } | null>(null);
  const birth = useRef<{ t0: number } | null>(null);

  const pulse = () => {
    bone.current = { t0: performance.now(), from: uniforms.uRigidity.value };
    invalidate();
  };

  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    pulse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boneNonce]);

  const wasAwake = useRef(false);
  useEffect(() => {
    if (awake && !wasAwake.current) {
      birth.current = { t0: performance.now() }; // one quiver per wake
      invalidate();
    }
    wasAwake.current = awake;
  }, [awake, invalidate]);

  useFrame(() => {
    // sleep early-exit: nothing animating, nothing to pay for
    const sleeping =
      !awake && !bone.current && !birth.current &&
      (light.current?.intensity ?? 0) < 0.004;
    if (sleeping) return;

    let busy = false;

    if (bone.current) {
      const t = (performance.now() - bone.current.t0) / 1000;
      let v: number;
      if (t < 0.25) {
        const k = t / 0.25;
        v = bone.current.from + (RIG_PEAK - bone.current.from) * (1 - (1 - k) * (1 - k));
      } else if (t < 1.05) {
        v = RIG_PEAK;
      } else if (t < 3.05) {
        const k = (t - 1.05) / 2;
        const e = k < 0.5 ? 2 * k * k : 1 - (1 - k) * (1 - k) * 2 < 1 ? 1 - 2 * (1 - k) * (1 - k) : 1;
        v = RIG_PEAK + (RIG_REST - RIG_PEAK) * e;
      } else {
        v = RIG_REST;
        bone.current = null;
      }
      uniforms.uRigidity.value = v;
      busy = true;
    }

    if (birth.current) {
      const t = (performance.now() - birth.current.t0) / 1000;
      uniforms.uBirth.value = t < 0.6 ? Math.sin((t / 0.6) * Math.PI) : 0;
      if (t >= 0.6) birth.current = null;
      busy = true;
    }

    if (light.current) {
      const target = awake ? 0.15 : 0;
      if (Math.abs(light.current.intensity - target) > 0.003) {
        // 0.8s ease toward target
        light.current.intensity += (target - light.current.intensity) * 0.09;
        busy = true;
      }
    }

    if (group.current)
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    if (busy) invalidate();
  });

  return (
    <group position={position}>
      <group
        ref={group}
        rotation={[0, 0, THREE.MathUtils.degToRad(8)]}
        onPointerOver={() => {
          setHover(true);
          invalidate();
        }}
        onPointerOut={() => {
          setHover(false);
          invalidate();
        }}
        onClick={pulse}
      >
        <mesh
          position={[0, 0.225, 0]}
          geometry={geometry}
          onUpdate={(m) => m.layers.enable(B3_LAYER)}
        >
          <primitive object={material} attach="material" />
        </mesh>
        <pointLight
          ref={light}
          position={[0, 0.225, 0]}
          color="#FFD9A8"
          intensity={0}
          distance={0.9}
          decay={2}
        />
      </group>

      {/* contact AO patch + soft shadow, one draw */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[1.0, 0.8]} />
        <meshBasicMaterial map={aoTex} transparent />
      </mesh>

      {/* 透: the four-line read, DOM overlay at the cocoon's right */}
      {showParams && (
        <Html
          position={[0.5, 0.42, 0]}
          style={{ pointerEvents: "auto", whiteSpace: "nowrap" }}
        >
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 13,
              letterSpacing: "0.06em",
              color: "#1a1714",
              lineHeight: 1.75,
            }}
          >
            {PARAMS.map((p, i) => (
              <div
                key={p.k}
                style={{
                  opacity: 0,
                  transform: "translateY(4px)",
                  animation: `b3line 0.3s ease-out ${
                    (leaving ? (PARAMS.length - 1 - i) : i) * 0.09
                  }s forwards ${leaving ? "reverse" : ""}`,
                }}
              >
                {p.k.padEnd(10, " ")}
                {p.swatch ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        background: p.v,
                        border: "1px solid #6b6459",
                      }}
                    />{" "}
                    {p.v}
                  </>
                ) : (
                  p.v
                )}
              </div>
            ))}
            <div
              title="parameters from cached Claude Vision analysis — see the live pipeline on the project page"
              style={{
                fontSize: 7,
                letterSpacing: "0.22em",
                color: "#6b6459",
                marginTop: 4,
                opacity: 0,
                animation: `b3line 0.3s ease-out ${leaving ? 0 : 0.4}s forwards ${
                  leaving ? "reverse" : ""
                }`,
              }}
            >
              ◌ CACHED
            </div>
            <style>{`@keyframes b3line { to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        </Html>
      )}
    </group>
  );
}
