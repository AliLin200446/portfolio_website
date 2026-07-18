"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { LatentRenderer } from "@/lib/latent-gl/renderer";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B1 LATENT — film roll index object.
 * Pulling the leader IS the parameter: exposed length 0.3→1.8 maps to
 * engineStrength 0→100, driving the real Latent production pipeline
 * (lib/latent-gl, build-artifact import) offscreen; its output canvas is
 * the emulsion-face texture. No new shaders here beyond a vertex droop
 * injected into the strip materials (spec'd bezier sag, quadratic approx).
 */

const PULL_MIN = 0.3;
const PULL_MAX = 1.8;
const STRIP_W = 0.62;
const ROLL_R = 0.21;
const ROLL_LEN = 1.0;
const INERTIA_DAMP = 0.15;
const WAKE_LINGER_MS = 2000;

const pullToStrength = (p: number) =>
  Math.round(((p - PULL_MIN) / (PULL_MAX - PULL_MIN)) * 100);
const strengthToPull = (s: number) =>
  PULL_MIN + (s / 100) * (PULL_MAX - PULL_MIN);

/** Placeholder footage. TODO-real-footage: swap for a Latent demo clip. */
function makeFootage() {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 360;
  const g = c.getContext("2d")!;
  let raf = 0;
  const t0 = performance.now();
  const draw = () => {
    raf = requestAnimationFrame(draw);
    const t = (performance.now() - t0) / 1000;
    g.fillStyle = "#101216";
    g.fillRect(0, 0, 640, 360);
    g.fillStyle = "#161a20";
    g.fillRect(0, 230, 640, 130);
    for (let i = 0; i < 6; i++) {
      const x = ((i * 130 + t * 26) % 760) - 60;
      const y = 96 + 26 * Math.sin(i * 1.9);
      g.fillStyle = i % 3 ? "#ffb46b" : "#ffd9a0";
      g.beginPath();
      g.arc(x, y, 11 + 5 * Math.sin(i * 2.2), 0, 7);
      g.fill();
      g.fillStyle = "rgba(255,180,107,0.10)";
      g.fillRect(x - 12, 230, 24, 110);
    }
  };
  draw();
  const stream = c.captureStream(24);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  return {
    video,
    async ready() {
      await video.play();
      if (!video.videoWidth) {
        await new Promise<void>((res) =>
          video.addEventListener("loadedmetadata", () => res(), { once: true })
        );
      }
    },
    dispose() {
      cancelAnimationFrame(raf);
      video.pause();
      video.srcObject = null;
    },
  };
}

/** Sleep-state poster: one still frame of the same placeholder scene. */
function makePoster() {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 360;
  const g = c.getContext("2d")!;
  g.fillStyle = "#101216";
  g.fillRect(0, 0, 640, 360);
  g.fillStyle = "#161a20";
  g.fillRect(0, 230, 640, 130);
  for (let i = 0; i < 6; i++) {
    const x = i * 130 + 20;
    g.fillStyle = i % 3 ? "#ffb46b" : "#ffd9a0";
    g.beginPath();
    g.arc(x, 96 + 26 * Math.sin(i * 1.9), 12, 0, 7);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Sprocket-hole alpha texture: transparent punches on film base. */
function makeSprocketTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 32;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1c1c1f";
  g.fillRect(0, 0, 64, 32);
  g.clearRect(22, 8, 20, 16); // the punch
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(24, 1);
  return tex;
}

/** Inject the quadratic droop into a material's vertex stage. */
function injectDroop(
  mat: THREE.Material,
  uniforms: { uPull: { value: number }; uSag: { value: number } }
) {
  mat.onBeforeCompile = (s) => {
    s.uniforms.uPull = uniforms.uPull;
    s.uniforms.uSag = uniforms.uSag;
    s.vertexShader =
      "uniform float uPull;\nuniform float uSag;\n" +
      s.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        {
          // sag along the exposed run only (root stays at the mouth)
          float vis = clamp(uPull / ${PULL_MAX.toFixed(2)}, 0.05, 1.0);
          float t = clamp((uv.x - (1.0 - vis)) / vis, 0.0, 1.0);
          transformed.z -= uSag * t * t;
        }`
      );
  };
}

export default function FilmRoll({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate, gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const strip = useRef<THREE.Group>(null);
  const b1Strength = useBenchStore((s) => s.b1Strength);
  const setB1Strength = useBenchStore((s) => s.setB1Strength);

  const [awake, setAwake] = useState(false);
  const [value, setValue] = useState<{ v: number; at: number } | null>(null);

  const pull = useRef(strengthToPull(b1Strength));
  const pullTarget = useRef<number | null>(null); // set = rewinding
  const velocity = useRef(0);
  const dragging = useRef(false);
  const twitchT0 = useRef(-1);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const droopUniforms = useMemo(
    () => ({ uPull: { value: pull.current }, uSag: { value: 0 } }),
    []
  );
  const poster = useMemo(makePoster, []);
  const sprocketTex = useMemo(makeSprocketTexture, []);

  const emulsionMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: poster,
      roughness: 0.55,
      metalness: 0,
      side: THREE.DoubleSide,
      clippingPlanes: [
        new THREE.Plane(new THREE.Vector3(1, 0, 0), -(position[0] + 0.06)),
      ],
    });
    injectDroop(m, droopUniforms);
    return m;
  }, [poster, droopUniforms, position]);

  const sprocketMat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      map: sprocketTex,
      transparent: true,
      alphaTest: 0.4,
      side: THREE.DoubleSide,
      clippingPlanes: emulsionMat.clippingPlanes,
    });
    injectDroop(m, droopUniforms);
    return m;
  }, [sprocketTex, droopUniforms, emulsionMat]);

  // ---- wake/sleep: the engine exists only while awake ----
  const engine = useRef<{
    renderer: LatentRenderer;
    footage: ReturnType<typeof makeFootage>;
    texture: THREE.CanvasTexture;
  } | null>(null);

  useEffect(() => {
    if (!awake) return;
    let cancelled = false;
    (async () => {
      const footage = makeFootage();
      await footage.ready();
      if (cancelled) return footage.dispose();
      const off = document.createElement("canvas");
      const renderer = new LatentRenderer(off);
      renderer.setVideo(footage.video);
      renderer.params.engineStrength = pullToStrength(pull.current) / 100;
      renderer.start();
      const texture = new THREE.CanvasTexture(renderer.canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      emulsionMat.map = texture;
      emulsionMat.needsUpdate = true;
      engine.current = { renderer, footage, texture };
      invalidate();
    })();
    return () => {
      cancelled = true;
      if (engine.current) {
        engine.current.renderer.stop();
        engine.current.footage.dispose();
        engine.current.texture.dispose();
        engine.current = null;
      }
      emulsionMat.map = poster;
      emulsionMat.needsUpdate = true;
      invalidate();
    };
  }, [awake, emulsionMat, poster, invalidate]);

  const wake = () => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    if (!awake) {
      twitchT0.current = performance.now();
      setAwake(true);
    }
    invalidate();
  };
  const scheduleSleep = () => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    sleepTimer.current = setTimeout(() => {
      if (!dragging.current) setAwake(false);
    }, WAKE_LINGER_MS);
  };

  // external control (keyboard slider in the DOM nameplate)
  useEffect(() => {
    const p = strengthToPull(b1Strength);
    if (Math.abs(p - pull.current) > 0.001 && !dragging.current) {
      pull.current = p;
      if (engine.current)
        engine.current.renderer.params.engineStrength = b1Strength / 100;
      setValue({ v: b1Strength, at: performance.now() });
      invalidate();
    }
  }, [b1Strength, invalidate]);

  const applyPull = (p: number, announce = true) => {
    pull.current = Math.max(PULL_MIN, Math.min(PULL_MAX, p));
    const s = pullToStrength(pull.current);
    if (engine.current) engine.current.renderer.params.engineStrength = s / 100;
    setB1Strength(s);
    if (announce) setValue({ v: s, at: performance.now() });
    invalidate();
  };

  // ---- per-frame: strip placement, inertia, rewind, twitch, textures ----
  useFrame(() => {
    let busy = false;

    // inertia glide after release, hard stop at limits
    if (!dragging.current && pullTarget.current === null && velocity.current) {
      const next = pull.current + velocity.current;
      velocity.current *= 1 - INERTIA_DAMP;
      if (next <= PULL_MIN || next >= PULL_MAX) velocity.current = 0;
      applyPull(next, Math.abs(velocity.current) > 0.0005);
      if (Math.abs(velocity.current) < 0.0004) velocity.current = 0;
      else busy = true;
    }

    // rewind (double-click): damped return, 0.8s-ish
    if (pullTarget.current !== null) {
      const diff = pullTarget.current - pull.current;
      applyPull(pull.current + diff * 0.09, false);
      if (Math.abs(diff) < 0.004) {
        applyPull(pullTarget.current, false);
        pullTarget.current = null;
      } else busy = true;
    }

    // strip transform: translate so the leader tip = mouth + pull
    if (strip.current) {
      strip.current.position.x = pull.current - PULL_MAX;
      droopUniforms.uPull.value = pull.current;
      droopUniforms.uSag.value =
        0.09 * Math.pow((pull.current - PULL_MIN) / (PULL_MAX - PULL_MIN), 2);
    }

    // one-shot wake twitch (0.3s, ≤1px, touched-by-a-fingertip)
    if (group.current) {
      const base = awake ? 0.01 : 0;
      let twitch = 0;
      if (twitchT0.current > 0) {
        const t = (performance.now() - twitchT0.current) / 300;
        if (t < 1) {
          twitch = Math.sin(t * Math.PI * 4) * 0.003 * (1 - t);
          busy = true;
        } else twitchT0.current = -1;
      }
      group.current.position.y = position[1] + base + twitch;
    }

    if (engine.current) {
      engine.current.texture.needsUpdate = true;
      busy = true; // live footage keeps frames coming while awake
    }
    if (busy) invalidate();
  });

  // value readout fade (1.2s)
  useEffect(() => {
    if (!value) return;
    const id = setTimeout(() => setValue(null), 1200);
    return () => clearTimeout(id);
  }, [value]);

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  // film exits the shell's underside slit near the bench surface
  const mouthX = position[0] + 0.05;

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={wake}
      onPointerOut={scheduleSleep}
    >
      {/* roll shell: matte ink cylinder, axis along bench X, lying flat */}
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        position={[0, ROLL_R, 0]}
        onDoubleClick={() => {
          pullTarget.current = PULL_MIN;
          velocity.current = 0;
          wake();
        }}
      >
        <cylinderGeometry args={[ROLL_R, ROLL_R, ROLL_LEN, 40]} />
        <meshStandardMaterial color="#141416" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* soft contact shadow (cheap, no shadow maps on the bench yet) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
      </mesh>

      {/* film strip: full-length geometry, clipped at the mouth, translated
          by pull. Sprockets ride the same geometry, so they scroll with it. */}
      <group position={[mouthX, ROLL_R * 0.55, 0]}>
        <group ref={strip}>
          <group rotation={[-Math.PI / 2 + 0.35, 0, 0]}>
            <mesh
              position={[PULL_MAX / 2, 0, 0]}
              onPointerDown={(e) => {
                e.stopPropagation();
                dragging.current = true;
                velocity.current = 0;
                (e.target as Element).setPointerCapture?.(e.pointerId);
                wake();
              }}
              onPointerMove={(e) => {
                if (!dragging.current) return;
                const prev = pull.current;
                applyPull(pull.current + e.movementX * 0.006);
                velocity.current = pull.current - prev;
              }}
              onPointerUp={() => {
                dragging.current = false;
                scheduleSleep();
              }}
            >
              <planeGeometry args={[PULL_MAX, STRIP_W, 48, 1]} />
              <primitive object={emulsionMat} attach="material" />
            </mesh>
            {[1, -1].map((side) => (
              <mesh
                key={side}
                position={[PULL_MAX / 2, side * (STRIP_W / 2 + 0.045), 0.001]}
              >
                <planeGeometry args={[PULL_MAX, 0.08, 48, 1]} />
                <primitive object={sprocketMat} attach="material" />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* readout above the leader tip, mono, fades after 1.2s */}
      {value && (
        <Html
          position={[mouthX + pull.current - position[0], 0.55, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 12,
              letterSpacing: "0.1em",
              color: "#1a1714",
            }}
          >
            {String(value.v).padStart(3, "0")}
          </span>
        </Html>
      )}
    </group>
  );
}
