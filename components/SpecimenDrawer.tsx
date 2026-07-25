"use client";

import { Html } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { experiments, type Tag } from "@/content/experiments";

/*
 * SPECIMEN-DRAWER — the /experiments 3D enhancement layer, built ahead
 * of its own preconditions (site not live, index at three entries) at
 * the author's explicit instruction — noted. Stance: the main hall's
 * six instruments each carry a REAL mechanism; the study's specimens
 * are SAME-SPEC samples — the form itself declares the hierarchy.
 * One flat slide geometry, ONE InstancedMesh for every entry (a new
 * entry is a data row, zero new geometry); differences ride the mono
 * number + tag abbreviation labels (DOM, zero draws) and a two-level
 * tone (featured slightly deeper/front) — NO per-tag palette (six
 * distinguishable warm hues don't exist inside 禁蓝纸墨铜土).
 * Budget: instanced 1 + tray 1 + hover glint 1 = 3 draw calls.
 * Interaction: hover lifts 2-3px + #FFB46B glint + info card; click
 * opens href in a new tab — no transition, no case page, no answer
 * beat (a specimen has no real mechanism, so it performs none).
 * Filter shares the SAME ?tag= state as the text layer: misses dim
 * and step back, hits hold the front. frameloop=demand with instant
 * state writes — idle is structurally still, zero rAF.
 * Gate: ≥1024px + fine pointer + no-reduced-motion + JS; the text
 * index below is always the complete base layer. Lazy-mounted, so
 * LCP belongs to the text.
 */

const COLS = 5;
const SLIDE: [number, number, number] = [0.5, 0.03, 0.32];
const TONE_BASE = new THREE.Color("#E2DACB");
const TONE_FEATURED = new THREE.Color("#C6B89D");
const DIM = 0.45;

function Scene({ active }: { active: Tag | null }) {
  const { invalidate } = useThree();
  const inst = useRef<THREE.InstancedMesh>(null);
  const glint = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState<number | null>(null);

  const items = useMemo(() => {
    const v = experiments.filter((e) => e.href || e.repo);
    return [...v.filter((e) => e.featured), ...v.filter((e) => !e.featured)];
  }, []);
  const posOf = (i: number): [number, number, number] => [
    ((i % COLS) - (Math.min(items.length, COLS) - 1) / 2) * 0.62,
    0.06,
    Math.floor(i / COLS) * 0.44 - 0.1,
  ];

  // one pass writes matrices + two-level tone + filter dim; called on
  // every state change, then the frame goes still (demand loop)
  useEffect(() => {
    const m = inst.current;
    if (!m) return;
    const d = new THREE.Object3D();
    items.forEach((e, i) => {
      const hit = !active || e.tags.includes(active);
      const [x, y, z] = posOf(i);
      d.position.set(x, y + (hover === i && hit ? 0.028 : 0), z + (hit ? 0 : -0.12));
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      const c = (e.featured ? TONE_FEATURED : TONE_BASE).clone();
      if (!hit) c.multiplyScalar(DIM);
      m.setColorAt(i, c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    if (glint.current) {
      const on = hover !== null && (!active || items[hover].tags.includes(active));
      glint.current.visible = on;
      if (on) {
        const [x, , z] = posOf(hover!);
        glint.current.position.set(x, 0.085, z);
      }
    }
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, hover, items, invalidate]);

  const e = hover !== null ? items[hover] : null;
  return (
    <>
      <directionalLight position={[-2, 4, 3]} intensity={1.3} color="#fff6e8" />
      <ambientLight intensity={0.8} />
      {/* the tray: plainly humbler than the hall's table */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[3.6, 0.06, 1.6]} />
        <meshStandardMaterial color="#DDD5C4" roughness={1} />
      </mesh>
      <instancedMesh
        ref={inst}
        args={[undefined, undefined, items.length]}
        onPointerMove={(ev) => {
          ev.stopPropagation();
          if (ev.instanceId !== undefined && ev.instanceId !== hover)
            setHover(ev.instanceId);
          document.body.style.cursor = "pointer";
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
        <boxGeometry args={SLIDE} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      {/* hover glint: the focus color, one hairline frame */}
      <mesh ref={glint} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.3, 0.312, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color="#FFB46B" transparent opacity={0.9} />
      </mesh>
      {/* mono number + tag abbreviation: DOM labels, zero draw calls */}
      {items.map((it, i) => (
        <Html
          key={it.name}
          position={posOf(i)}
          center
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 9, letterSpacing: "0.15em", color: "#1a1714", opacity: !active || it.tags.includes(active) ? 0.8 : 0.25 }}>
            {String(i + 1).padStart(2, "0")} · {it.tags.map((t) => t.slice(0, 3).toUpperCase()).join("/")}
          </span>
        </Html>
      ))}
      {/* hover card: the hall's card grammar, specimen contents */}
      {e && (
        <Html position={[0, 0.5, 0.6]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
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
    <div className="h-[300px]" aria-hidden>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ fov: 35, position: [0, 1.5, 2.2], rotation: [-0.55, 0, 0] }}
        gl={{ antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor("#F5F2EC")}
      >
        <Scene active={active} />
      </Canvas>
    </div>
  );
}

const LazyDrawer = dynamic(() => Promise.resolve(Drawer), { ssr: false });

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
  return <LazyDrawer active={active} />;
}
