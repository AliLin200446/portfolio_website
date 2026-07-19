"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import { makeJadeMaterial } from "@/lib/jade";

/*
 * B5 VESTIGE — the seal, per the full spec. One action: press → trace →
 * verifiable. The only instrument allowed to leave a PERMANENT visible
 * change on the worktop — every other interaction on this bench returns
 * to zero; the mark stays. Provenance, once stamped, does not fade
 * by itself.
 *
 * The bench's entire cinnabar budget (#9A3B22) lives in the stamp mark.
 * Mark implementation: path (a), pre-baked 512² alpha texture with
 * noise-eroded edges (README: path a — the mark is fixed, realtime
 * would buy nothing).
 * Stamp bay: spec says 0.15 in front; the 0.35-wide body would sit on
 * top of it, so STAMP_Z clears the body — the four-beat stroke carries
 * the seal to the bay and back (lift drifts forward, rise returns).
 */

const STAMP_Z = 0.42;
const LIFT = 0.07;
// four beats, seconds
const T_LIFT = 0.1;
const T_PRESS = 0.25;
const T_HOLD = 0.15;
const T_RISE = 0.25;
const HASHES = [
  "a3f9c2e1", "4c07b8d1", "e2519aaf", "7b3c40e9",
  "1d8f26c4", "a6e093b7", "5f71cd08", "c3b49a52",
];

/** The mark: meander border + circuit-seal maze, cinnabar, edges eroded
 *  by noise like cinnabar paste biting into paper fiber. Deterministic. */
function makeStampTexture() {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const ink = "#9A3B22";
  g.strokeStyle = ink;
  g.fillStyle = ink;

  // meander (回纹) border: alternating teeth along a double frame
  g.lineWidth = 14;
  g.strokeRect(30, 30, S - 60, S - 60);
  const step = 56;
  for (let i = 0; i < (S - 120) / step; i++) {
    const t = 60 + i * step;
    g.fillRect(t, 44, 26, 22);            // top teeth
    g.fillRect(t + 18, S - 66, 26, 22);   // bottom, offset
    g.fillRect(44, t + 18, 22, 26);       // left
    g.fillRect(S - 66, t, 22, 26);        // right
  }

  // interior: orthogonal maze, 篆书质感 without real characters
  let seed = 20260717;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  g.lineWidth = 13;
  g.lineCap = "square";
  const n = 6, cell = 56, off = (S - n * cell) / 2;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const r = rnd();
      if (r < 0.3) continue;
      const x = off + i * cell + 9, y = off + j * cell + 9, w = cell - 18;
      g.beginPath();
      if (r < 0.55) { g.moveTo(x, y + w / 2); g.lineTo(x + w, y + w / 2); }
      else if (r < 0.8) { g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + w); }
      else {
        g.moveTo(x, y + w / 2); g.lineTo(x + w / 2, y + w / 2); g.lineTo(x + w / 2, y + w);
      }
      g.stroke();
      if (rnd() < 0.22) g.fillRect(x + w / 2 - 9, y + w / 2 - 9, 18, 18);
    }

  // edge erosion: 2–3px noise bites over the whole figure
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * S, y = rnd() * S, r = 1 + rnd() * 2;
    g.beginPath();
    g.arc(x, y, r, 0, 7);
    g.fill();
  }
  g.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Seal-face normal map: meander ring + abstract circuit-seal relief.
 *  Face points down; it is only ever half-glimpsed in the press flash. */
function makeFaceNormalMap() {
  const S = 256;
  const h = new Float32Array(S * S);
  let seed = 977;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const border =
        (x > 16 && x < 40) || (x > S - 40 && x < S - 16) ||
        (y > 16 && y < 40) || (y > S - 40 && y < S - 16);
      const gridx = Math.floor(x / 24), gridy = Math.floor(y / 24);
      const lane = (gridx * 7 + gridy * 13) % 5 < 2;
      h[y * S + x] = (border ? 1 : 0) + (lane ? 0.7 : 0) + rnd() * 0.1;
    }
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const dx = h[y * S + Math.min(S - 1, x + 1)] - h[i];
      const dy = h[Math.min(S - 1, y + 1) * S + x] - h[i];
      img.data[i * 4] = 128 + dx * 70;
      img.data[i * 4 + 1] = 128 + dy * 70;
      img.data[i * 4 + 2] = 255;
      img.data[i * 4 + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

/** Bridge-knob profile: an organic holdable arc, no beast. */
function knobGeometry() {
  const pts: THREE.Vector2[] = [];
  const prof: [number, number][] = [
    [0.1, 0], [0.105, 0.02], [0.09, 0.06], [0.075, 0.11],
    [0.08, 0.15], [0.06, 0.19], [0.025, 0.215], [0.0, 0.22],
  ];
  prof.forEach(([r, y]) => pts.push(new THREE.Vector2(r, y)));
  return new THREE.LatheGeometry(pts, 24);
}

/** Vertical brushed roughness, B2 bronze convention. */
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
  return new THREE.CanvasTexture(c);
}

export default function Seal({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const curMat = useRef<THREE.MeshBasicMaterial>(null);
  const prevMat = useRef<THREE.MeshBasicMaterial>(null);
  const flash = useRef(0); // face-flash impulse at touchdown

  const berth = useBenchStore((s) => s.berth);
  const stampNonce = useBenchStore((s) => s.b5StampNonce);

  const [hover, setHover] = useState(false);
  const awake = hover || berth === berthOf("vestige");

  const stroke = useRef<{ t0: number; placed: boolean } | null>(null);
  const hashIdx = useRef(0);
  const [curHash, setCurHash] = useState<string | null>(null);
  const curMark = useRef<THREE.Mesh>(null);
  const spread = useRef(1);
  const [prevOn, setPrevOn] = useState(false);
  const [chars, setChars] = useState(0);
  const [markHover, setMarkHover] = useState(false);
  const typer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stampTex = useMemo(makeStampTexture, []);
  const faceNormal = useMemo(makeFaceNormalMap, []);
  const knobGeom = useMemo(knobGeometry, []);
  const brushTex = useMemo(makeBrushTexture, []);
  const jade = useMemo(() => makeJadeMaterial({ thickness: 0.3 }), []);

  useEffect(() => {
    document.body.style.cursor = hover || markHover ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover, markHover]);

  const stamp = () => {
    if (stroke.current) return; // input locked for the whole stroke
    stroke.current = { t0: performance.now(), placed: false };
    invalidate();
  };

  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    stamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stampNonce]);

  // leaving the berth: the MARK STAYS (this instrument's privilege);
  // any in-flight stroke snaps home and the lock releases
  useEffect(() => {
    if (berth !== berthOf("vestige") && !hover && stroke.current) {
      stroke.current = null;
      if (group.current) group.current.position.set(0, 0, 0);
      invalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [berth, hover]);

  const placeMark = () => {
    if (curHash) {
      setPrevOn(true);
      if (prevMat.current && curMat.current)
        prevMat.current.opacity = curMat.current.opacity;
    }
    if (curMat.current) curMat.current.opacity = 0;
    spread.current = 0; // §3 secondary: ink breathes out one beat
    const h = HASHES[hashIdx.current++ % HASHES.length];
    setCurHash(h);
    setChars(0);
    return h;
  };

  const startTyper = (h: string) => {
    if (typer.current) clearInterval(typer.current);
    let n = 0;
    typer.current = setInterval(() => {
      n += 1;
      setChars(n);
      if (n >= h.length && typer.current) clearInterval(typer.current);
    }, 75);
  };

  useEffect(() => () => {
    if (typer.current) clearInterval(typer.current);
  }, []);

  useFrame((_, delta) => {
    // sleep early-exit
    const idle =
      !stroke.current && !prevOn &&
      (glowMat.current?.opacity ?? 0) < 0.02 &&
      flash.current < 0.02 &&
      (!curHash || (curMat.current?.opacity ?? 0) > 0.9);
    if (!awake && idle) return;

    let busy = false;
    // local space: the outer group already carries `position`
    const baseY = awake ? 0.01 : 0;

    // ---- the four-beat stroke: 提 → 落(+震定+面光一闪) → 顿 → 起 ----
    if (stroke.current && group.current) {
      const t = (performance.now() - stroke.current.t0) / 1000;
      let y = 0;
      let z = 0;
      if (t < T_LIFT) {
        // 提: the pre-stamp breath, drifting toward the bay
        const k = t / T_LIFT;
        y = 0.002 + LIFT * k;
        z = STAMP_Z * k * 0.35;
      } else if (t < T_LIFT + T_PRESS) {
        // 落: ease-in, acceleration you can feel
        const k = (t - T_LIFT) / T_PRESS;
        y = LIFT * (1 - k * k);
        z = STAMP_Z * (0.35 + 0.65 * k);
        if (k > 0.96 && flash.current < 0.5) flash.current = 1; // face flash
      } else if (t < T_LIFT + T_PRESS + T_HOLD) {
        // 顿: pressed, drinking the ink — the mark forms UNDER the seal
        const k = (t - T_LIFT - T_PRESS) / T_HOLD;
        y = -0.004 * (1 - k * 0.5); // single settle, no rebound
        z = STAMP_Z;
        if (!stroke.current.placed) {
          stroke.current.placed = true;
          placeMark();
        }
        if (curMat.current && curHash)
          curMat.current.opacity = Math.min(0.92, k * 1.1 * 0.92);
      } else if (t < T_LIFT + T_PRESS + T_HOLD + T_RISE) {
        // 起: ease-out home; the hash starts speaking
        const k = (t - T_LIFT - T_PRESS - T_HOLD) / T_RISE;
        const e = 1 - (1 - k) * (1 - k);
        y = LIFT * 0.35 * (k < 0.5 ? k * 2 : (1 - k) * 2) * 0.4;
        z = STAMP_Z * (1 - e);
        if (chars === 0 && curHash && k > 0.05) startTyper(curHash);
      } else {
        // frame-skip safety: a stalled frame may jump the hold window —
        // the mark must never be lost to a hitch
        let h = curHash;
        if (!stroke.current.placed) {
          stroke.current.placed = true;
          h = placeMark();
        }
        if (curMat.current && h) curMat.current.opacity = 0.92;
        if (h && chars === 0) startTyper(h);
        stroke.current = null;
        y = 0;
        z = 0;
      }
      group.current.position.set(0, baseY + y, z);
      busy = true;
    }
    // ink spread: the fresh mark expands 0.94→1.0 over ~0.12s — the
    // existing mark quad, one scale write, no new geometry
    if (spread.current < 1 && curMark.current) {
      spread.current = Math.min(1, spread.current + delta / 0.12);
      const sc = 0.94 + 0.06 * spread.current;
      curMark.current.scale.set(sc, sc, 1);
      busy = true;
    } else if (group.current) {
      group.current.position.set(0, baseY, 0);
    }

    // mark opacities: replacement conservation — one mark, ever
    if (prevOn && prevMat.current) {
      prevMat.current.opacity -= delta / 0.3;
      if (prevMat.current.opacity <= 0.01) setPrevOn(false);
      busy = true;
    }

    // base warm line (wake) + touchdown face flash
    if (glowMat.current) {
      flash.current = Math.max(0, flash.current - delta / 0.1);
      const target = (awake && !stroke.current ? 0.2 : 0) + flash.current;
      if (Math.abs(glowMat.current.opacity - target) > 0.02) {
        glowMat.current.opacity += (target - glowMat.current.opacity) * 0.3;
        busy = true;
      }
      if (flash.current > 0) busy = true;
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
        onClick={stamp}
      >
        {/* 身: square bronze body, vertical brush */}
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[0.35, 0.22, 0.35]} />
          <meshStandardMaterial
            color="#8C6A3F"
            metalness={0.9}
            roughness={0.4}
            roughnessMap={brushTex}
          />
        </mesh>
        {/* 束腰: 15% waist ring */}
        <mesh position={[0, 0.27, 0]}>
          <cylinderGeometry args={[0.149, 0.16, 0.06, 20]} />
          <meshStandardMaterial color="#7a5c36" metalness={0.85} roughness={0.5} />
        </mesh>
        {/* 钮: jade bridge-knob (lib/jade, thickness 0.3 — second use) */}
        <mesh position={[0, 0.3, 0]} geometry={knobGeom}>
          <primitive object={jade} attach="material" />
        </mesh>
        {/* 印面: faces down, half-glimpsed only in the touchdown flash */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.019, 0]}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshStandardMaterial
            color="#8C6A3F"
            metalness={0.7}
            roughness={0.55}
            normalMap={faceNormal}
          />
        </mesh>
        {/* base warm line: 蓄势 + the 0.1s face flash at touchdown */}
        <mesh position={[0, 0.022, 0]}>
          <boxGeometry args={[0.365, 0.008, 0.365]} />
          <meshBasicMaterial ref={glowMat} color="#FFB46B" transparent opacity={0} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <circleGeometry args={[0.3, 24]} />
          <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
        </mesh>
      </group>

      {/* the marks: current + one fading predecessor, same bay */}
      {prevOn && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, STAMP_Z]}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshBasicMaterial ref={prevMat} map={stampTex} transparent opacity={0} />
        </mesh>
      )}
      {curHash && (
        <mesh
          ref={curMark}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.003, STAMP_Z]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setMarkHover(true);
            invalidate();
          }}
          onPointerOut={() => {
            setMarkHover(false);
            invalidate();
          }}
        >
          <planeGeometry args={[0.32, 0.32]} />
          <meshBasicMaterial
            ref={curMat}
            map={stampTex}
            transparent
            opacity={0}
            color={markHover ? "#B04A2E" : "#ffffff"}
          />
        </mesh>
      )}
      {/* 印文: 8-char demo hash types out under the mark; the mark is a
          link. FIX ③: gated on awake — sleep (and the carousel overhead/
          rear arc) shows the physical mark only, no floating DOM */}
      {curHash && awake && (
        <Html
          position={[0, 0.02, STAMP_Z + 0.26]}
          center
          style={{ pointerEvents: "auto", whiteSpace: "nowrap" }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "#1a1714",
            }}
          >
            <Link
              href="/work/vestige"
              title="view provenance system →"
              style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={() => setMarkHover(true)}
              onMouseLeave={() => setMarkHover(false)}
            >
              {curHash.slice(0, chars)}
            </Link>
            {chars >= curHash.length && (
              <span
                title="in Vestige, this is a ZK-verifiable proof bound to the physical object"
                style={{ fontSize: 7, color: "#6b6459", marginLeft: 8, letterSpacing: "0.2em" }}
              >
                demo hash
              </span>
            )}
          </span>
        </Html>
      )}
    </group>
  );
}
