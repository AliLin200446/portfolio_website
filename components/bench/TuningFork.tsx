"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { berthOf } from "@/lib/bench";
import { makeBenchEnvMap } from "@/lib/bench/envMap";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B2-REV RESONANCE — precision instrument pass: polished PBR copper
 * arms with long sharp axial highlights (low roughness + shared bench
 * env map + a grazing side light), weighted rounded tips, a cold
 * neutral-grey stem/base (restrained two-material split — it stays ONE
 * instrument), grounded contact. Geometry footprint, interaction and
 * the luma-driven vibration are UNCHANGED. Sound (§4) not approved —
 * silent.
 * Original notes: the tuning fork. Strike it and the arms ring in the real
 * fork mode (arms open/close in antiphase); the decay envelope is modulated
 * by the luminance of a hidden video — the metal remembers the footage.
 * 衰减是骨架,亮度是呼吸。
 * Vibration is a vertex-stage cantilever mode (no physics lib). The video
 * is never shown; a 12Hz CPU sampler reads one row of luma (CPU sibling of
 * the Resonance downsample pipeline — chose CPU, cheaper; noted per spec).
 */

const ARM_H = 0.55;
const ARM_GAP = 0.055; // half-distance between arm centers (0.11 apart)
const VIS_HZ = 7; // readable vibration, not the true 440
const DECAY_TAU = 1.8; // e^(-t/τ), ≈6s to silence
const AMP_MAX = 0.035;
const CHIME_AMP = 0.004;
const PRELOAD = 0.006;

/** Placeholder signal footage: a bright band sweeping on dark ground, so
 *  the "bright parts re-breathe the decay" is unmistakable.
 *  TODO-real-footage: swap for a Resonance demo clip. */
function makeSignalFootage() {
  const c = document.createElement("canvas");
  c.width = 320;
  c.height = 180;
  const g = c.getContext("2d")!;
  let raf = 0;
  const t0 = performance.now();
  const draw = () => {
    raf = requestAnimationFrame(draw);
    const t = (performance.now() - t0) / 1000;
    g.fillStyle = "#0b0d10";
    g.fillRect(0, 0, 320, 180);
    // bright band, ~3s period sweep
    const x = ((t % 3) / 3) * 480 - 80;
    const grad = g.createLinearGradient(x - 70, 0, x + 70, 0);
    grad.addColorStop(0, "rgba(245,240,230,0)");
    grad.addColorStop(0.5, "rgba(245,240,230,0.95)");
    grad.addColorStop(1, "rgba(245,240,230,0)");
    g.fillStyle = grad;
    g.fillRect(x - 70, 0, 140, 180);
  };
  draw();
  const stream = c.captureStream(24);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  video.play().catch(() => {});
  return {
    video,
    dispose() {
      cancelAnimationFrame(raf);
      video.pause();
      video.srcObject = null;
    },
  };
}

/** Brushed-metal roughness texture, grain along the arm length. */
function makeBrushTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d")!;
  const img = g.createImageData(64, 256);
  const cols = Array.from({ length: 64 }, () => 120 + Math.random() * 60);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 64; x++) {
      const i = (y * 64 + x) * 4;
      const v = cols[x] + (Math.random() - 0.5) * 14;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Bright fork body: arms + yoke, with aArmSide/aArmT for the
 *  vertex-stage mode. Tips carry a slight swell — the counterweight of
 *  a real fork — then round off. */
function buildForkBody() {
  const parts: THREE.BufferGeometry[] = [];
  const tag = (g: THREE.BufferGeometry, side: number, tOf?: (y: number) => number) => {
    const n = g.attributes.position.count;
    const sideArr = new Float32Array(n).fill(side);
    const tArr = new Float32Array(n);
    if (tOf)
      for (let i = 0; i < n; i++)
        tArr[i] = Math.min(1, Math.max(0, tOf(g.attributes.position.getY(i))));
    g.setAttribute("aArmSide", new THREE.BufferAttribute(sideArr, 1));
    g.setAttribute("aArmT", new THREE.BufferAttribute(tArr, 1));
    return g;
  };

  const ARM_ROOT = 0.31;
  for (const side of [-1, 1]) {
    const arm = new THREE.BoxGeometry(0.045, ARM_H, 0.03, 1, 24, 1);
    arm.translate(0, ARM_H / 2, 0);
    const pos = arm.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // weighted tip: a restrained swell over the last 0.07, rounding
      // off in the final 0.018 — mass, not fat
      if (y > ARM_H - 0.07) {
        const k = (y - (ARM_H - 0.07)) / 0.07;
        let scale = 1 + 0.15 * Math.sin(Math.min(1, k * 1.15) * Math.PI);
        if (y > ARM_H - 0.018) {
          const c = (y - (ARM_H - 0.018)) / 0.018;
          scale *= 1 - 0.5 * c * c;
        }
        pos.setX(i, pos.getX(i) * scale);
        pos.setZ(i, pos.getZ(i) * scale * 0.9); // slightly elliptical
      }
    }
    arm.translate(side * ARM_GAP, ARM_ROOT, 0);
    parts.push(tag(arm, side, (y) => (y - ARM_ROOT) / ARM_H));
  }

  const yoke = new THREE.TorusGeometry(ARM_GAP, 0.018, 12, 22, Math.PI);
  yoke.rotateZ(Math.PI);
  yoke.translate(0, ARM_ROOT, 0);
  parts.push(tag(yoke, 0));

  const flat = parts.map((p) => (p.index ? p.toNonIndexed() : p));
  const merged = mergeGeometries(flat, false)!;
  parts.forEach((p) => p.dispose());
  flat.forEach((p) => p.dispose());
  return merged;
}

/** Dark stand: stem + a wider, planted base. Static — no attributes. */
function buildStand() {
  const ARM_ROOT = 0.31;
  const stem = new THREE.CylinderGeometry(0.015, 0.017, 0.22, 14);
  stem.translate(0, ARM_ROOT - ARM_GAP - 0.11, 0);
  const base = new THREE.CylinderGeometry(0.082, 0.09, 0.032, 28);
  base.translate(0, 0.016, 0);
  const merged = mergeGeometries(
    [stem.toNonIndexed(), base.toNonIndexed()],
    false
  )!;
  stem.dispose();
  base.dispose();
  return merged;
}

export default function TuningFork({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const stand = useRef<THREE.Mesh>(null);
  const berth = useBenchStore((s) => s.berth);
  const setLuma = useBenchStore((s) => s.setB2Luma);
  const strikeNonce = useBenchStore((s) => s.b2StrikeNonce);

  const [hover, setHover] = useState(false);
  const awake = hover || berth === berthOf("resonance");

  const uniforms = useMemo(
    () => ({
      uAmp: { value: 0 },
      uPhase: { value: 0 },
      uPreload: { value: 0 },
    }),
    []
  );
  const bodyGeom = useMemo(buildForkBody, []);
  const standGeom = useMemo(buildStand, []);
  const envMap = useMemo(makeBenchEnvMap, []);
  const material = useMemo(() => {
    // polished instrument copper: low roughness + env reflections give
    // the long axial highlight; no brush map on the arms anymore
    const m = new THREE.MeshPhysicalMaterial({
      color: "#8C6A3F",
      metalness: 0.95,
      roughness: 0.3,
      envMap,
      envMapIntensity: 0.55,
    });
    // anisotropy when the engine supports it; the brush map carries the
    // grain direction either way (spec'd fallback)
    if ("anisotropy" in m) (m as { anisotropy: number }).anisotropy = 0.6;
    m.onBeforeCompile = (s) => {
      s.uniforms.uAmp = uniforms.uAmp;
      s.uniforms.uPhase = uniforms.uPhase;
      s.uniforms.uPreload = uniforms.uPreload;
      s.vertexShader =
        "attribute float aArmSide;\nattribute float aArmT;\nuniform float uAmp;\nuniform float uPhase;\nuniform float uPreload;\n" +
        s.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          {
            // first cantilever mode, arms in antiphase (open/close)
            float f = aArmT * aArmT * (3.0 - 2.0 * aArmT);
            transformed.x += aArmSide * f * (uAmp * sin(uPhase) - uPreload);
          }`
        );
    };
    return m;
  }, [uniforms, envMap]);

  // ---- signal chain: hidden video → 12Hz row-luma sampler → EMA ----
  const luma = useRef(0);
  useEffect(() => {
    if (!awake) return;
    const footage = makeSignalFootage();
    const sc = document.createElement("canvas");
    sc.width = 16;
    sc.height = 9;
    const sg = sc.getContext("2d", { willReadFrequently: true })!;
    const id = setInterval(() => {
      try {
        sg.drawImage(footage.video, 0, 0, 16, 9);
        const row = sg.getImageData(0, 4, 16, 1).data;
        let sum = 0;
        for (let i = 0; i < 16; i++)
          sum +=
            0.2126 * row[i * 4] + 0.7152 * row[i * 4 + 1] + 0.0722 * row[i * 4 + 2];
        const v = sum / 16 / 255;
        luma.current += 0.3 * (v - luma.current); // EMA α=0.3
        setLuma(luma.current);
      } catch {
        /* first frames may be empty */
      }
    }, 83); // 12Hz
    return () => {
      clearInterval(id);
      footage.dispose();
      luma.current = 0;
      setLuma(0);
    };
  }, [awake, setLuma]);

  // ---- state machine: idle | chime | preload | ring ----
  const mode = useRef<{ name: "idle" | "chime" | "preload" | "ring"; t0: number }>({
    name: "idle",
    t0: 0,
  });

  const strike = () => {
    mode.current = { name: "preload", t0: performance.now() };
    invalidate();
  };

  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    strike();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strikeNonce]);

  const wasAwake = useRef(false);
  useEffect(() => {
    if (awake && !wasAwake.current) {
      // one-shot chime on wake, never loops
      mode.current = { name: "chime", t0: performance.now() };
      invalidate();
    }
    if (!awake) {
      mode.current = { name: "idle", t0: 0 };
      uniforms.uAmp.value = 0;
      uniforms.uPreload.value = 0;
      invalidate();
    }
    wasAwake.current = awake;
  }, [awake, uniforms, invalidate]);

  useFrame((_, delta) => {
    const m = mode.current;
    let busy = false;
    const t = (performance.now() - m.t0) / 1000;

    if (m.name === "chime") {
      uniforms.uAmp.value = t < 0.4 ? CHIME_AMP * (1 - t / 0.4) : 0;
      uniforms.uPhase.value += VIS_HZ * Math.PI * 2 * delta;
      if (t >= 0.4) mode.current = { name: "idle", t0: 0 };
      busy = true;
    } else if (m.name === "preload") {
      uniforms.uAmp.value = 0;
      uniforms.uPreload.value = PRELOAD * Math.min(1, t / 0.04);
      if (t >= 0.04) {
        uniforms.uPreload.value = 0;
        uniforms.uPhase.value = 0;
        mode.current = { name: "ring", t0: performance.now() };
      }
      busy = true;
    } else if (m.name === "ring") {
      const A = Math.exp(-t / DECAY_TAU);
      if (t > 6) {
        uniforms.uAmp.value = 0;
        mode.current = { name: "idle", t0: 0 };
      } else {
        // decay is the skeleton, luminance is the breath
        uniforms.uAmp.value = AMP_MAX * A * (0.55 + 0.45 * luma.current);
        uniforms.uPhase.value += VIS_HZ * Math.PI * 2 * delta;
        busy = true;
      }
    }

    // transition secondary (§3): the stand answers the arms with a
    // lagged counter-shiver, ≤15% of the modal amplitude — spent
    // inertia through the SAME uniforms, not a new move
    if (stand.current)
      stand.current.position.x =
        useBenchStore.getState().transitionId === "resonance"
          ? -0.15 * uniforms.uAmp.value * Math.sin(uniforms.uPhase.value)
          : 0;

    if (group.current) {
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    }
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
        onClick={strike}
      >
        <mesh geometry={bodyGeom} material={material} />
        {/* stand: cold neutral grey (no blue), planted */}
        <mesh ref={stand} geometry={standGeom}>
          <meshStandardMaterial
            color="#8A8884"
            metalness={0.9}
            roughness={0.42}
            envMap={envMap}
            envMapIntensity={0.4}
          />
        </mesh>
        {/* grazing side light: hangs the axial highlight, short throw */}
        <pointLight
          position={[-0.5, 0.65, 0.38]}
          intensity={1.1}
          distance={1.2}
          decay={2}
          color="#fff2df"
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <circleGeometry args={[0.17, 24]} />
          <meshBasicMaterial color="#1a1714" transparent opacity={0.22} />
        </mesh>
      </group>
    </group>
  );
}
