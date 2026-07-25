"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { experiments, type Tag } from "@/content/experiments";

/*
 * APOTHECARY 百子柜 — the /experiments 3D layer. One remedy per
 * drawer, labeled, kept ready.
 *
 * APOTHECARY-FIX root causes (measured, not guessed — the spec's
 * "hit plane misaligned with the face" hypothesis did not apply: the
 * hit target IS the drawer face; there was never a separate plane):
 *   (1) the carcass box (depth 0.6 @ z=0 → front face at z=+0.30) and
 *       the drawer faces (center z=0.28, depth 0.04 → z 0.26–0.30)
 *       occupied the SAME plane. That coplanar z-fight is what shredded
 *       rows 2–3 into thin strips, and the raycast reached the carcass
 *       before the faces, so hover fired on the wrong slot or not at
 *       all. Fix: the carcass ends at z=0 and every face protrudes in
 *       front of it — the two can no longer overlap.
 *   (2) hovering scaled the hit instance to 0.0001, so the pointer
 *       instantly "left" it, hover reset, the face returned — a
 *       self-oscillating flicker. Fix: the hovered face steps BACK
 *       behind the carcass front and the open drawer takes over as the
 *       hover/click target, so the pointer never falls through.
 *
 * View (§3): the cabinet carries the site's spatial language — yaw 20°,
 * pitch 9° — and drawers travel along their own rail axis (local +z),
 * which reads as a straight pull at any yaw. Camera fixed, no orbit.
 * Cost core: closed faces / handles / label plates are three
 * InstancedMeshes; the OPEN drawer is a single model that relocates to
 * the hovered slot. Draw calls: carcass 1 + faces 1 + handles 1 +
 * plates 1 + open drawer 1 + contact shadow 1 = 6, CONSTANT in entry
 * count. Grid sizes to content: slots = entries + 3, near-square.
 * Labels are English name + mono number (zero decorative hanzi);
 * drawers hold nothing (no herbs, no color, no cinnabar); featured =
 * deeper label + copper hairline. Filter shares ?tag= with the text
 * layer. Click = href in a new tab: no transition, no answer beat —
 * a drawer has no real mechanism, so it performs none.
 */

const FACE_W = 0.6;
const FACE_H = 0.3;
const GAP = 0.045; // 屉间缝: the dark recess line reads as one-per-cell
const CELL_X = FACE_W + GAP;
const CELL_Y = FACE_H + GAP;
const FACE_Z = 0.022; // faces protrude in front of the carcass (z=0)
const SLIDE = 0.36; // ~60% of drawer depth

/** Beveled rectangular panel, centered — the bevel catches the key
 *  light and stops the face reading as a flat sticker. */
function panel(w: number, h: number, depth: number, bevel: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -h / 2);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(w / 2, h / 2);
  s.lineTo(-w / 2, h / 2);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

function openDrawerGeometry() {
  const w = FACE_W - 0.02, h = FACE_H - 0.02, d = 0.6, t = 0.018;
  const parts = [
    new THREE.BoxGeometry(w, t, d).translate(0, -h / 2, -d / 2),
    new THREE.BoxGeometry(w, h, t).translate(0, 0, -d),
    new THREE.BoxGeometry(t, h, d).translate(-w / 2, 0, -d / 2),
    new THREE.BoxGeometry(t, h, d).translate(w / 2, 0, -d / 2),
  ];
  return mergeGeometries(parts.map((p) => p.toNonIndexed()), false)!;
}

/** Soft contact shadow: one canvas radial gradient. No shadow map —
 *  a shadow map would be a new render target, which is forbidden. */
function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, "rgba(26,23,20,0.30)");
  grad.addColorStop(1, "rgba(26,23,20,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const WOOD_FACE = new THREE.Color("#B98F5E"); // brighter, desaturated toward copper
const WOOD_DIM = new THREE.Color("#9C7C56"); // filter miss
const PLATE_ON = new THREE.Color("#EDE7DA");
const PLATE_OFF = new THREE.Color("#C9C1B2");

function Scene({ active }: { active: Tag | null }) {
  const { invalidate } = useThree();
  const faces = useRef<THREE.InstancedMesh>(null);
  const handles = useRef<THREE.InstancedMesh>(null);
  const plates = useRef<THREE.InstancedMesh>(null);
  const open = useRef<THREE.Group>(null);
  const [hover, setHover] = useState<number | null>(null);
  const slideT = useRef(0);
  const slideAt = useRef<number | null>(null);

  const items = useMemo(() => {
    const v = experiments.filter((e) => e.href || e.repo);
    return [...v.filter((e) => e.featured), ...v.filter((e) => !e.featured)];
  }, []);

  // §2 the grid sizes to content: entries + 3 spare, near-square
  const { cols, rows, N, W, H } = useMemo(() => {
    const n = Math.max(4, items.length + 3);
    const c = Math.ceil(Math.sqrt(n));
    const r = Math.ceil(n / c);
    return { cols: c, rows: r, N: c * r, W: c * CELL_X, H: r * CELL_Y };
  }, [items.length]);

  const slotPos = (i: number): [number, number] => [
    ((i % cols) - (cols - 1) / 2) * CELL_X,
    ((rows - 1) / 2 - Math.floor(i / cols)) * CELL_Y,
  ];

  const faceGeom = useMemo(() => panel(FACE_W, FACE_H, 0.05, 0.008), []);
  const plateGeom = useMemo(() => panel(0.3, 0.088, 0.012, 0.004), []);
  const openGeom = useMemo(openDrawerGeometry, []);
  const shadowTex = useMemo(shadowTexture, []);

  const hit = (i: number) =>
    i < items.length && (!active || items[i].tags.includes(active));

  /* One pass writes every matrix. The DRAWER FRONT IS the instanced
   * face: when a drawer is out, its face (plus handle and label plate)
   * travels forward with it. That keeps the hit target and the visible
   * front the same object — no second front to fight over the ray, and
   * the open drawer's walls stay out of raycasting entirely, so a
   * neighbour is always reachable even while a drawer is out. */
  const writeMatrices = (openIdx: number | null, off: number) => {
    const f = faces.current, hd = handles.current, pl = plates.current;
    if (!f || !hd || !pl) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      const [x, y] = slotPos(i);
      const z = FACE_Z + (i === openIdx ? off : 0);
      d.position.set(x, y, z);
      d.scale.setScalar(1); // §2: every face is the same size, always
      d.updateMatrix();
      f.setMatrixAt(i, d.matrix);
      f.setColorAt(i, i < items.length && !hit(i) ? WOOD_DIM : WOOD_FACE);

      d.position.set(x, y - 0.055, z + 0.045);
      d.updateMatrix();
      hd.setMatrixAt(i, d.matrix);

      d.position.set(x, y + 0.06, i < items.length ? z + 0.033 : -0.2);
      d.updateMatrix();
      pl.setMatrixAt(i, d.matrix);
      pl.setColorAt(i, hit(i) ? PLATE_ON : PLATE_OFF);
    }
    f.instanceMatrix.needsUpdate = true;
    hd.instanceMatrix.needsUpdate = true;
    pl.instanceMatrix.needsUpdate = true;
    if (f.instanceColor) f.instanceColor.needsUpdate = true;
    if (pl.instanceColor) pl.instanceColor.needsUpdate = true;
    // §1 THE hit-area bug: an InstancedMesh caches a bounding sphere
    // computed from whatever matrices existed at first render — which
    // is all-zero, i.e. a degenerate point at the origin. Raycasts test
    // that sphere first, so every drawer away from the origin missed.
    // Recompute it whenever the matrices change; the hit region then
    // IS the drawer face, exactly and always.
    f.computeBoundingSphere();
    hd.computeBoundingSphere();
    pl.computeBoundingSphere();
  };

  useEffect(() => {
    if (hover !== null && hit(hover)) slideAt.current = hover;
    writeMatrices(slideAt.current, slideT.current * SLIDE);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover, active, items, N, cols, rows]);

  // the one open drawer travels along its own rail (local +z)
  useFrame((_, delta) => {
    const want = hover !== null && hit(hover) ? 1 : 0;
    const diff = want - slideT.current;
    if (Math.abs(diff) < 0.004) slideT.current = want;
    else slideT.current += diff * Math.min(1, delta / (want ? 0.1 : 0.085));
    const g = open.current;
    const e = 1 - Math.pow(1 - slideT.current, 3); // ease-out, no overshoot
    if (g && slideAt.current !== null) {
      const [x, y] = slotPos(slideAt.current);
      g.visible = slideT.current > 0.01;
      g.position.set(x, y, FACE_Z + e * SLIDE);
      writeMatrices(slideAt.current, e * SLIDE); // the front travels too
    }
    if (Math.abs(want - slideT.current) > 0.003) invalidate(); // else still
  });

  const e = hover !== null && hover < items.length ? items[hover] : null;
  const go = (it: (typeof items)[number] | null | false) => {
    if (it) window.open(it.href ?? it.repo, "_blank", "noreferrer");
  };

  return (
    // §3 the site's spatial language: yaw 20°, pitch 9°
    <group rotation={[THREE.MathUtils.degToRad(9), THREE.MathUtils.degToRad(-20), 0]}>
      {/* key light upper-left + low ambient: the gaps and bevels need a
          direction to read as volume. No bloom. */}
      <directionalLight position={[-2.5, 2.6, 3]} intensity={1.5} color="#fff6e8" />
      <ambientLight intensity={0.55} />

      {/* carcass: front at z=0, narrow frame; its darker tone IS the
          recess line inside every gap (cheap AO, no shadow map) */}
      <mesh
        position={[0, 0, -0.25]}
        onPointerMove={(ev) => {
          ev.stopPropagation();
          setHover(null); // gaps and frame clear the hover cleanly
          document.body.style.cursor = "";
        }}
      >
        <boxGeometry args={[W + 0.07, H + 0.07, 0.5]} />
        <meshStandardMaterial color="#8A6A45" roughness={0.85} />
      </mesh>

      {/* closed drawer faces — the hit target, beveled, protruding */}
      <instancedMesh
        ref={faces}
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
        onClick={(ev) => {
          ev.stopPropagation();
          if (ev.instanceId !== undefined) go(items[ev.instanceId]);
        }}
      >
        <meshStandardMaterial roughness={0.72} />
      </instancedMesh>

      {/* handles: real geometry, instanced — highlight and shape */}
      <instancedMesh ref={handles} args={[undefined, undefined, N]}>
        <torusGeometry args={[0.028, 0.0075, 8, 20]} />
        <meshStandardMaterial color="#9C8A6A" metalness={0.7} roughness={0.35} />
      </instancedMesh>

      {/* label frames: the paper slip sits IN a plate, not on the wood */}
      <instancedMesh ref={plates} args={[plateGeom, undefined, N]}>
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>

      {/* THE open drawer — bare wood interior, holds nothing; while it
          is out it is also the hover/click target */}
      <group ref={open} visible={false}>
        {/* walls only — the front is the instanced face travelling with
            it; raycast disabled so an open drawer never steals a
            neighbour's pointer */}
        <mesh geometry={openGeom} raycast={() => null}>
          <meshStandardMaterial color="#C6A275" roughness={0.85} />
        </mesh>
      </group>

      {/* contact shadow: the cabinet rests, it does not float */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -H / 2 - 0.05, -0.12]}>
        <planeGeometry args={[W * 1.15, 0.6]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>

      {/* 纸签: English name + mono number, zero decorative hanzi */}
      {items.map((it, i) => {
        const [x, y] = slotPos(i);
        const on = hit(i);
        const isOpen = hover === i && on;
        return (
          <Html
            key={it.name}
            position={[
              x,
              y + 0.06,
              isOpen ? FACE_Z + slideT.current * SLIDE + 0.04 : FACE_Z + 0.045,
            ]}
            center
            style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: 8,
                letterSpacing: "0.1em",
                color: it.featured ? "#3d3428" : "#5a5044",
                borderBottom: it.featured ? "1px solid #8C6A3F" : undefined,
                opacity: on ? 1 : 0.35,
              }}
            >
              {String(i + 1).padStart(2, "0")} {it.name.toUpperCase()}
            </span>
          </Html>
        );
      })}

      {/* hover card: the hall's card grammar */}
      {e && (
        <Html
          position={[0, -H / 2 - 0.16, 0.3]}
          center
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "#1a1714",
              background: "rgba(245,242,236,0.92)",
              border: "0.5px solid #E3DED4",
              padding: "5px 10px",
            }}
          >
            {e.name} · {e.line} · {e.year} · {e.tags.join("/")}
            {e.credit ? ` · ${e.credit}` : ""}
          </span>
        </Html>
      )}
    </group>
  );
}

function Cabinet({ active }: { active: Tag | null }) {
  // R3F measures its container through a ResizeObserver; inside this
  // lazily-mounted subtree the observer can settle without ever firing,
  // leaving the renderer uninitialised (canvas stuck at its default
  // 300×150 backing store). One nudge after mount forces the measure.
  useEffect(() => {
    const ids = [0, 60, 200, 500].map((t) =>
      setTimeout(() => window.dispatchEvent(new Event("resize")), t)
    );
    return () => ids.forEach(clearTimeout);
  }, []);
  return (
    <div className="h-[360px]" aria-hidden>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ fov: 30, position: [0, 0.05, 3.4] }}
        gl={{ antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#F5F2EC");
          // read-only handle for the draw-call budget audit
          (window as unknown as Record<string, unknown>).__apothecaryInfo =
            gl.info;
        }}
      >
        <Scene active={active} />
      </Canvas>
    </div>
  );
}

const Lazy = dynamic(() => Promise.resolve(Cabinet), { ssr: false });

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
