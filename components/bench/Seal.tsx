"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B5 VESTIGE — the seal. Press it, leave a cinnabar mark on the bench,
 * an 8-char demo hash types itself out. Provenance means leaving a trace.
 * The bench's entire cinnabar budget (#9A3B22) lives in the stamp mark;
 * nothing else on the table may use it.
 * Jade knob: MeshPhysicalMaterial transmission approximation (APPROX-Aura —
 * the Aura SSS source is not in this repo; swap in when it lands).
 */

const PRESS_S = 0.3; // ease-in downstroke
const SPRING_S = 0.15; // return
const DROP = 0.13;
const HASHES = [
  "9F3A61E2",
  "4C07B8D1",
  "E2519AAF",
  "7B3C40E9",
  "1D8F26C4",
  "A6E093B7",
  "5F71CD08",
  "C3B49A52",
];

/** Cinnabar zk-pattern stamp, canvas-baked, bleeding edges. Deterministic. */
function makeStampTexture() {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const ink = "#9A3B22";
  g.strokeStyle = ink;
  g.fillStyle = ink;
  g.shadowColor = ink;
  g.shadowBlur = 9; // the slight bleed into the paper
  g.lineWidth = 26;
  g.strokeRect(36, 36, S - 72, S - 72);

  // zk circuit maze: orthogonal traces + via squares, seeded
  let seed = 20260717;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const n = 8;
  const cell = 52;
  const off = (S - n * cell) / 2;
  g.lineWidth = 11;
  g.lineCap = "square";
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const r = rnd();
      if (r < 0.34) continue;
      const x = off + i * cell + 8;
      const y = off + j * cell + 8;
      const w = cell - 16;
      g.beginPath();
      if (r < 0.56) {
        g.moveTo(x, y + w / 2);
        g.lineTo(x + w, y + w / 2);
      } else if (r < 0.78) {
        g.moveTo(x + w / 2, y);
        g.lineTo(x + w / 2, y + w);
      } else {
        g.moveTo(x, y + w / 2);
        g.lineTo(x + w / 2, y + w / 2);
        g.lineTo(x + w / 2, y + w);
      }
      g.stroke();
      if (rnd() < 0.2) g.fillRect(x + w / 2 - 8, y + w / 2 - 8, 16, 16);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
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

  const berth = useBenchStore((s) => s.berth);
  const stampNonce = useBenchStore((s) => s.b5StampNonce);

  const [hover, setHover] = useState(false);
  const awake = hover || berth === 4;

  const press = useRef<{ t0: number; placed: boolean } | null>(null);
  const hashIdx = useRef(0);
  const [curHash, setCurHash] = useState<string | null>(null);
  const [prevHash, setPrevHash] = useState<string | null>(null);
  const [chars, setChars] = useState(0);
  const typer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stampTex = useMemo(makeStampTexture, []);
  const markPos: [number, number, number] = [0, 0.002, 0.55];

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover]);

  const stamp = () => {
    if (press.current) return;
    press.current = { t0: performance.now(), placed: false };
    invalidate();
  };

  // nameplate keyboard path (Enter)
  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    if (stampNonce > 0) stamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stampNonce]);

  const placeMark = () => {
    // the previous mark starts fading; only ever one solid mark on screen
    setPrevHash(curHash);
    if (prevMat.current && curMat.current)
      prevMat.current.opacity = curMat.current.opacity;
    if (curMat.current) curMat.current.opacity = 0;
    const h = HASHES[hashIdx.current++ % HASHES.length];
    setCurHash(h);
    setChars(0);
    if (typer.current) clearInterval(typer.current);
    let n = 0;
    typer.current = setInterval(() => {
      n += 1;
      setChars(n);
      if (n >= h.length && typer.current) clearInterval(typer.current);
    }, 75); // 8 chars ≈ 0.6s
  };

  useEffect(() => () => {
    if (typer.current) clearInterval(typer.current);
  }, []);

  useFrame((_, delta) => {
    let busy = false;

    // press: ease-in down, contact places the mark, springy return
    if (press.current && group.current) {
      const t = (performance.now() - press.current.t0) / 1000;
      let y = 0;
      if (t < PRESS_S) {
        const k = t / PRESS_S;
        y = -DROP * k * k;
      } else if (t < PRESS_S + SPRING_S) {
        if (!press.current.placed) {
          press.current.placed = true;
          placeMark();
        }
        const k = (t - PRESS_S) / SPRING_S;
        y = -DROP * (1 - k) * (1 - k * 0.3); // quick, slightly damped return
      } else {
        press.current = null;
      }
      group.current.position.y = position[1] + (awake ? 0.01 : 0) + y;
      busy = true;
    } else if (group.current) {
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    }

    // mark opacities: new mark settles in, old mark leaves in ~0.3s
    if (curMat.current && curHash) {
      const target = 0.92;
      if (Math.abs(curMat.current.opacity - target) > 0.01) {
        curMat.current.opacity += (target - curMat.current.opacity) * 0.2;
        busy = true;
      }
    }
    if (prevMat.current && prevHash) {
      if (prevMat.current.opacity > 0.01) {
        prevMat.current.opacity -= delta / 0.3;
        busy = true;
      } else if (prevHash) {
        setPrevHash(null);
      }
    }

    // base glow line follows wake
    if (glowMat.current) {
      const target = awake && !press.current ? 0.85 : 0;
      if (Math.abs(glowMat.current.opacity - target) > 0.02) {
        glowMat.current.opacity += (target - glowMat.current.opacity) * 0.15;
        busy = true;
      }
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
        {/* bronze body */}
        <mesh position={[0, 0.16 + 0.02, 0]}>
          <boxGeometry args={[0.35, 0.32, 0.35]} />
          <meshStandardMaterial color="#8C6A3F" roughness={0.35} metalness={0.75} />
        </mesh>
        {/* jade knob — APPROX-Aura (transmission stand-in for the SSS) */}
        <mesh position={[0, 0.42, 0]}>
          <capsuleGeometry args={[0.085, 0.1, 6, 20]} />
          <meshPhysicalMaterial
            color="#F2F0E6"
            roughness={0.32}
            transmission={0.55}
            thickness={0.35}
            attenuationColor="#DCE2D2"
            attenuationDistance={0.6}
          />
        </mesh>
        {/* warm light line at the base edge (wake) */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.37, 0.008, 0.37]} />
          <meshBasicMaterial
            ref={glowMat}
            color="#FFB46B"
            transparent
            opacity={0}
          />
        </mesh>
        {/* soft contact shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <circleGeometry args={[0.32, 24]} />
          <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
        </mesh>
      </group>

      {/* the marks: current + one fading predecessor, same spot */}
      {prevHash && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={markPos}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshBasicMaterial
            ref={prevMat}
            map={stampTex}
            transparent
            opacity={0}
          />
        </mesh>
      )}
      {curHash && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={markPos}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshBasicMaterial
            ref={curMat}
            map={stampTex}
            transparent
            opacity={0}
          />
        </mesh>
      )}
      {curHash && (
        <Html
          position={[markPos[0], 0.02, markPos[2] + 0.28]}
          center
          style={{ pointerEvents: "auto", whiteSpace: "nowrap" }}
        >
          <Link
            href="/work/vestige"
            title="demo hash"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "#1a1714",
              textDecoration: "none",
            }}
          >
            {curHash.slice(0, chars)}
          </Link>
        </Html>
      )}
    </group>
  );
}
