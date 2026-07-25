"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { experiments, type Tag } from "@/content/experiments";

/*
 * APOTHECARY 百子柜 — the /experiments 3D layer (supersedes the
 * retired SPECIMEN-DRAWER). One cabinet, one drawer per experiment:
 * the most disciplined junk drawer there is — one remedy per drawer,
 * labeled, kept ready. 4×3 = 12 drawers; entries fill from the top
 * (featured first), the rest stay EMPTY (bare wood, no label) — room
 * to grow, not unfinished space.
 * 纸签纪律 (决策A): labels are ENGLISH name + mono number ("01 CYBER I
 * CHING") — zero decorative hanzi; Chinese belongs only where the
 * author speaks. Labels ride DOM (Html, data-generated, zero draws,
 * zero image assets) — the canvas-texture variant was traded for this
 * cheaper equal-discipline path, noted.
 * 决策C: drawers hold nothing — bare wood interior. No herbs, no
 * color (red berries brush against the one-cinnabar rule; a colored
 * cabinet overturns the paper order). featured = deeper label tone +
 * copper hairline, never cinnabar.
 * Cost core (决策B): closed faces = ONE InstancedMesh (face+handle
 * merged); the OPEN drawer is a single 5-wall model that MOVES to the
 * hovered slot and slides ~60% out (0.3s ease-out, none of it idle —
 * demand loop, rAF only while sliding). Only one drawer can be open,
 * so only one open-drawer geometry exists. Draw calls: cabinet 1 +
 * faces 1 + open drawer 1 + glint 1 = 4, CONSTANT in entry count
 * (instanced) — a new entry is a data row.
 * Click = href in a new tab. No transition, no answer beat: a drawer
 * has no real mechanism, so it performs none. Filter shares ?tag=
 * with the text layer: miss labels dim, faces darken — the cabinet
 * lights only the remedies you asked for. Gate ≥1024 + fine pointer +
 * no-reduced + JS; the text index below stays the complete base.
 */

const COLS = 4;
const ROWS = 3;
const FACE: [number, number, number] = [0.6, 0.34, 0.04];
const GAP_X = 0.66;
const GAP_Y = 0.4;
const SLIDE = 0.34; // ~60% of drawer depth

const slotPos = (i: number): [number, number] => [
  ((i % COLS) - (COLS - 1) / 2) * GAP_X,
  ((ROWS - 1) / 2 - Math.floor(i / COLS)) * GAP_Y,
];

function faceGeometry() {
  const face = new THREE.BoxGeometry(...FACE);
  const ring = new THREE.TorusGeometry(0.035, 0.008, 8, 18);
  ring.translate(0, -0.02, FACE[2] / 2 + 0.01);
  return mergeGeometries([face.toNonIndexed(), ring.toNonIndexed()], false)!;
}

function openDrawerGeometry() {
  const w = 0.56, h = 0.3, d = 0.55, t = 0.02;
  const parts = [
    new THREE.BoxGeometry(w, t, d).translate(0, -h / 2, 0), // floor
    new THREE.BoxGeometry(w, h, t).translate(0, 0, -d / 2), // back
    new THREE.BoxGeometry(t, h, d).translate(-w / 2, 0, 0),
    new THREE.BoxGeometry(t, h, d).translate(w / 2, 0, 0),
    new THREE.BoxGeometry(w, h, t).translate(0, 0, d / 2), // front
  ];
  return mergeGeometries(parts.map((p) => p.toNonIndexed()), false)!;
}

function Scene({ active }: { active: Tag | null }) {
  const { invalidate } = useThree();
  const inst = useRef<THREE.InstancedMesh>(null);
  const open = useRef<THREE.Group>(null);
  const glint = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState<number | null>(null);
  const slideT = useRef(0); // 0 closed → 1 out
  const slideAt = useRef<number | null>(null); // which slot the open model owns

  const items = useMemo(() => {
    const v = experiments.filter((e) => e.href || e.repo);
    return [...v.filter((e) => e.featured), ...v.filter((e) => !e.featured)];
  }, []);
  const faceGeom = useMemo(faceGeometry, []);
  const openGeom = useMemo(openDrawerGeometry, []);
  const N = COLS * ROWS;

  const hit = (i: number) =>
    i < items.length && (!active || items[i].tags.includes(active));

  useEffect(() => {
    const m = inst.current;
    if (!m) return;
    const d = new THREE.Object3D();
    const base = new THREE.Color("#A9834F");
    const dim = new THREE.Color("#7A6644");
    for (let i = 0; i < N; i++) {
      const [x, y] = slotPos(i);
      d.position.set(x, y, 0.28);
      // the hovered slot's closed face hides while the open model owns it
      d.scale.setScalar(hover === i && hit(i) ? 0.0001 : 1);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, i < items.length && !hit(i) ? dim : base);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    if (hover !== null && hit(hover)) slideAt.current = hover;
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover, active, items]);

  // the single open drawer slides toward/away — rAF only while moving
  useFrame((_, delta) => {
    const want = hover !== null && hit(hover) ? 1 : 0;
    const diff = want - slideT.current;
    if (Math.abs(diff) < 0.005 && slideT.current !== want) slideT.current = want;
    else if (diff !== 0)
      slideT.current += diff * Math.min(1, delta / (want ? 0.11 : 0.09));
    const g = open.current;
    if (g && slideAt.current !== null) {
      const [x, y] = slotPos(slideAt.current);
      g.visible = slideT.current > 0.01;
      g.position.set(x, y, 0.28 + slideT.current * SLIDE);
    }
    if (glint.current) {
      glint.current.visible = hover !== null && hit(hover);
      if (hover !== null) {
        const [x, y] = slotPos(hover);
        glint.current.position.set(x, y + 0.09, 0.31 + slideT.current * SLIDE);
      }
    }
    if (Math.abs(want - slideT.current) > 0.004) invalidate(); // else: still
  });

  const e = hover !== null && hover < items.length ? items[hover] : null;

  return (
    <>
      <directionalLight position={[-2, 3, 4]} intensity={1.25} color="#fff6e8" />
      <ambientLight intensity={0.75} />
      {/* the cabinet: plain warm wood, no carving */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[COLS * GAP_X + 0.2, ROWS * GAP_Y + 0.2, 0.6]} />
        <meshStandardMaterial color="#8B6B42" roughness={0.85} />
      </mesh>
      {/* closed drawer faces + handles: one InstancedMesh */}
      <instancedMesh
        ref={inst}
        args={[faceGeom, undefined, N]}
        onPointerMove={(ev) => {
          ev.stopPropagation();
          if (ev.instanceId !== undefined && ev.instanceId !== hover)
            setHover(ev.instanceId);
          document.body.style.cursor =
            ev.instanceId !== undefined && ev.instanceId < items.length
              ? "pointer"
              : "";
        }}
        onPointerOut={() => {
          setHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(ev) => {
          ev.stopPropagation();
          const it = ev.instanceId !== undefined && items[ev.instanceId];
          if (it) window.open(it.href ?? it.repo, "_blank", "noreferrer");
        }}
      >
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      {/* THE open drawer — the only one in the house, empty bare wood */}
      <group ref={open} visible={false}>
        <mesh
          geometry={openGeom}
          onClick={(ev) => {
            ev.stopPropagation();
            const it = slideAt.current !== null && items[slideAt.current];
            if (it) window.open(it.href ?? it.repo, "_blank", "noreferrer");
          }}
        >
          <meshStandardMaterial color="#B08B58" roughness={0.9} />
        </mesh>
      </group>
      {/* label-edge glint: the focus color, one hairline */}
      <mesh ref={glint} visible={false}>
        <planeGeometry args={[0.44, 0.012]} />
        <meshBasicMaterial color="#FFB46B" transparent opacity={0.9} />
      </mesh>
      {/* 纸签: DOM, English name + mono number; empty drawers bare */}
      {items.slice(0, N).map((it, i) => {
        const [x, y] = slotPos(i);
        const on = hit(i);
        return (
          <Html key={it.name} position={[x, y + 0.07, 0.31]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
            <span
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: 8.5,
                letterSpacing: "0.12em",
                background: "#F5F2EC",
                color: it.featured ? "#3d3428" : "#5a5044",
                borderBottom: it.featured ? "1px solid #8C6A3F" : undefined,
                padding: "1.5px 4px",
                opacity: on ? 1 : 0.3,
              }}
            >
              {String(i + 1).padStart(2, "0")} {it.name.toUpperCase()}
            </span>
          </Html>
        );
      })}
      {/* hover card: the hall's card grammar */}
      {e && (
        <Html position={[0, -(ROWS * GAP_Y) / 2 - 0.22, 0.4]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 11, letterSpacing: "0.08em", color: "#1a1714", background: "rgba(245,242,236,0.92)", border: "0.5px solid #E3DED4", padding: "5px 10px" }}>
            {e.name} · {e.line} · {e.year} · {e.tags.join("/")}
            {e.credit ? ` · ${e.credit}` : ""}
          </span>
        </Html>
      )}
    </>
  );
}

function Drawer({ active }: { active: Tag | null }) {
  return (
    <div className="h-[340px]" aria-hidden>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ fov: 32, position: [0, 0.15, 2.9] }}
        gl={{ antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor("#F5F2EC")}
      >
        <Scene active={active} />
      </Canvas>
    </div>
  );
}

const Lazy = dynamic(() => Promise.resolve(Drawer), { ssr: false });

export default function SpecimenDrawer({ active }: { active: Tag | null }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    setOk(
      window.matchMedia(
        "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
      ).matches
    );
  }, []);
  if (!ok) return null;
  return <Lazy active={active} />;
}
