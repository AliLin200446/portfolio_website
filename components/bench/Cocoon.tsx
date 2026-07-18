"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B3 SKELETAL SILK — the cocoon. Translucent jade-white shell with the
 * shape hiding inside. Hover long enough and it is "read": four cached
 * silk parameters surface. Click and bone ridges push through the shell,
 * then sink back — the moment the AI reads the material.
 * SSS = MeshPhysicalMaterial transmission (APPROX-Aura per the spec's own
 * fallback clause; swap when the Aura source lands). The ridge displacement
 * is the spec'd 降维 ridged-noise field, injected at the vertex stage.
 */

const PARAMS = [
  { k: "rigidity", v: "0.18" },
  { k: "flow", v: "0.85" },
  { k: "specular", v: "0.80" },
  { k: "color", v: "#EFE9DC", swatch: true },
];

export default function Cocoon({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const berth = useBenchStore((s) => s.berth);
  const boneNonce = useBenchStore((s) => s.b3BoneNonce);

  const [hover, setHover] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const awake = hover || berth === 2;

  const uniforms = useMemo(() => ({ uBone: { value: 0 } }), []);
  const bone = useRef<{ t0: number } | null>(null);

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: "#F4EFE4",
      roughness: 0.55,
      transmission: 0.5,
      thickness: 0.5,
      attenuationColor: "#E7DFC9",
      attenuationDistance: 0.7,
      sheen: 0.4,
      sheenColor: "#FFF6E6",
    });
    m.onBeforeCompile = (s) => {
      s.uniforms.uBone = uniforms.uBone;
      s.vertexShader =
        "uniform float uBone;\n" +
        s.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          {
            // 降维 ridged noise: two octaves of |sin| ridges along the shell
            vec3 p = position * 9.0;
            float r1 = abs(sin(p.x * 1.7 + p.y * 2.3 + p.z * 0.9));
            float r2 = abs(sin(p.x * 3.9 - p.y * 1.1 + p.z * 2.7));
            float ridge = pow(1.0 - min(r1, r2), 2.0);
            transformed += normal * ridge * uBone;
          }`
        );
    };
    return m;
  }, [uniforms]);

  // hover >0.4s reveals the cached read
  useEffect(() => {
    if (!awake) {
      setShowParams(false);
      return;
    }
    const id = setTimeout(() => setShowParams(true), 400);
    return () => clearTimeout(id);
  }, [awake]);

  const pulse = () => {
    bone.current = { t0: performance.now() };
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

  useFrame(() => {
    let busy = false;

    // bone pulse: rigidity 0.18 → 0.6 fast, back over 2s
    if (bone.current) {
      const t = (performance.now() - bone.current.t0) / 1000;
      const RISE = 0.25;
      let k = 0;
      if (t < RISE) k = t / RISE;
      else if (t < RISE + 2) {
        const d = (t - RISE) / 2;
        k = 1 - d * d * (3 - 2 * d);
      } else {
        bone.current = null;
      }
      // rigidity 0.18→0.6 maps to displacement 0→0.045
      uniforms.uBone.value = 0.045 * k * ((0.6 - 0.18) / 0.42);
      busy = true;
    }

    // inner 2700K light eases in while awake ("there is something inside")
    if (light.current) {
      const target = awake ? 0.15 : 0;
      if (Math.abs(light.current.intensity - target) > 0.004) {
        light.current.intensity += (target - light.current.intensity) * 0.12;
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
        {/* cocoon shell: 0.7 × 0.45 ellipsoid, silk-grain bump via sheen */}
        <mesh position={[0, 0.23, 0]} scale={[1, 0.64, 0.9]}>
          <sphereGeometry args={[0.35, 48, 32]} />
          <primitive object={material} attach="material" />
        </mesh>
        <pointLight
          ref={light}
          position={[0, 0.23, 0]}
          color="#FFB46B"
          intensity={0}
          distance={0.9}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <circleGeometry args={[0.4, 24]} />
          <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
        </mesh>
      </group>

      {/* the cached read: four parameters, staggered, ink-colored */}
      {showParams && (
        <Html
          position={[0.5, 0.42, 0]}
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "#1a1714",
              lineHeight: 1.7,
            }}
          >
            {PARAMS.map((p, i) => (
              <div
                key={p.k}
                style={{
                  opacity: 0,
                  animation: `b3fade 0.3s ease-out ${i * 0.3}s forwards`,
                }}
              >
                {p.k}{" "}
                {p.swatch ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: 9,
                      height: 9,
                      background: p.v,
                      border: "1px solid #6b6459",
                      verticalAlign: "baseline",
                    }}
                  />
                ) : (
                  p.v
                )}
              </div>
            ))}
            <div
              style={{
                opacity: 0,
                animation: `b3fade 0.3s ease-out 1.2s forwards`,
                color: "#6b6459",
              }}
            >
              ◌ CACHED
            </div>
            <style>{`@keyframes b3fade { to { opacity: 1; } }`}</style>
          </div>
        </Html>
      )}
    </group>
  );
}
