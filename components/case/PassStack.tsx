"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

/*
 * THE PASS STACK — the five GL passes as six planes you can turn.
 *
 * Ported rather than pasted. Three things in the original could not
 * ship here:
 *
 *   - it pulled three r128 off a CDN. This repo already depends on
 *     three, and a page that fetches a second copy of it from another
 *     origin breaks the zero-network rule the rest of the site keeps.
 *   - it re-linked Spectral and Geist Mono from Google. Both are
 *     already loaded once by next/font in the layout; linking them
 *     again would download the same faces a second time.
 *   - it redeclared the palette as CSS variables. The tokens exist;
 *     duplicating them is how two sources of truth start drifting.
 *
 * The geometry, the interaction and every word of the copy are the
 * author's, unchanged.
 */

const OXBLOOD = "#9A3B22";

type Layer = { n: string; t: string; d: string; why: string; tone: number };

const LAYERS: Layer[] = [
  {
    n: "source",
    t: "Source frame",
    d: "Gate weave applied at the first sample",
    why: "The physical frame is what moves in a projector. Weaving here means every downstream pass reads the same displaced frame, so the glow never slides relative to its own light source.",
    tone: 0x2a2622,
  },
  {
    n: "pass 1",
    t: "Highlight threshold",
    d: "Cut below 0.55, downsample to quarter",
    why: "Light too weak to survive the round trip through the base cannot expose the emulsion a second time. The threshold is that physical floor. Quarter resolution costs nothing here because halation carries no high frequency detail.",
    tone: 0x6e5b48,
  },
  {
    n: "pass 2",
    t: "Separable gaussian",
    d: "Run N times, N = round(radius squared / 4)",
    why: "A single sigma 30 kernel is far too expensive in real time. Many small gaussians compose into one large one, sigma adding in quadrature. Radius 4.9 resolves to six iterations.",
    tone: 0x8a7358,
  },
  {
    n: "pass 3",
    t: "Halation composite",
    d: "Tint 1.2 / 0.03 / 0.03, screened in linear light",
    why: "This is a second exposure adding light energy, so it composites in linear space and lands before the characteristic curve. Green and blue near zero: real 800T halation is almost pure red, not warm orange.",
    tone: 0x9a3b22,
  },
  {
    n: "pass 4",
    t: "Colour response",
    d: "Crosstalk, curve, tints, desaturation, base fog",
    why: "This layer is development. Exposure becomes density. Five per pixel operations with no neighbourhood dependency, so they share one draw instead of five.",
    tone: 0x4e5b54,
  },
  {
    n: "pass 5",
    t: "Grain to canvas",
    d: "PCG3D hash, reseeded every rendered frame",
    why: "Grain is developed crystal structure, not an exposure effect. Placed before the curve, the shoulder and tints would re-model an exposure dependency already handled. A fresh field every frame means no fixed pattern, so a still source still boils.",
    tone: 0x3a3630,
  },
];

const BASE_YAW = 0.62;
const BASE_PITCH = -0.3;
const W = 3.5;
const H = 2.0;
const GAP = 0.92;
const zAt = (i: number) =>
  (LAYERS.length - 1 - i) * GAP - ((LAYERS.length - 1) * GAP) / 2;

function Stack({
  active,
  yaw,
  pitch,
  onHover,
  onPick,
}: {
  active: number;
  yaw: React.RefObject<number>;
  pitch: React.RefObject<number>;
  onHover: (i: number) => void;
  onPick: (i: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const cur = useRef({ y: BASE_YAW, p: BASE_PITCH });
  const { invalidate } = useThree();
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(W, H), []);
  const edge = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const k = reduced.current ? 1 : 0.12;
    const ny = cur.current.y + (yaw.current - cur.current.y) * k;
    const np = cur.current.p + (pitch.current - cur.current.p) * k;
    const moved =
      Math.abs(ny - cur.current.y) > 1e-5 || Math.abs(np - cur.current.p) > 1e-5;
    cur.current.y = ny;
    cur.current.p = np;
    g.rotation.y = ny;
    g.rotation.x = np;
    if (!reduced.current) {
      // the weave, on the source plane only: this is the one motion in
      // the figure that is a physical claim rather than an affordance
      const w = Math.sin(clock.elapsedTime * Math.PI * 2) * 0.012;
      const src = g.children[0];
      const srcEdge = g.children[1];
      if (src) src.position.x = w;
      if (srcEdge) srcEdge.position.x = w;
      invalidate();
    } else if (moved) invalidate();
  });

  return (
    <group ref={group}>
      {LAYERS.map((L, i) => {
        const on = active === i;
        const off = active >= 0 && !on;
        return (
          <group key={L.n}>
            <mesh
              geometry={geo}
              position={[0, 0, zAt(i)]}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHover(i);
              }}
              onPointerOut={() => onHover(-1)}
              onClick={(e) => {
                e.stopPropagation();
                onPick(i);
              }}
            >
              <meshBasicMaterial
                color={L.tone}
                transparent
                opacity={off ? 0.04 : on ? 0.3 : 0.16}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            <lineSegments geometry={edge} position={[0, 0, zAt(i)]} raycast={() => null}>
              <lineBasicMaterial
                color={on ? OXBLOOD : L.tone}
                transparent
                opacity={off ? 0.14 : on ? 1 : 0.85}
              />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}

export default function PassStack() {
  const [sel, setSel] = useState(-1);
  const [hover, setHover] = useState(-1);
  const yaw = useRef(BASE_YAW);
  const pitch = useRef(BASE_PITCH);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const active = sel >= 0 ? sel : hover;

  return (
    /* minmax(0,1fr), not 1fr. A bare 1fr is minmax(auto,1fr), and the
       auto floor is the track's min-content width. A canvas has an
       intrinsic width, so that floor was the canvas itself: the track
       refused to shrink, the two columns totalled 1375px inside a
       976px measure, and the pass list ran off the right of the page.
       min-w-0 on the cell says the same thing a second time, because
       a grid item's own min-width: auto would put the floor back. */
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div
        className="relative aspect-[4/3] min-w-0 cursor-grab border border-line active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          d.moved += Math.abs(dx) + Math.abs(dy);
          d.x = e.clientX;
          d.y = e.clientY;
          yaw.current = Math.max(
            BASE_YAW - 0.61,
            Math.min(BASE_YAW + 0.61, yaw.current + dx * 0.006)
          );
          pitch.current = Math.max(
            BASE_PITCH - 0.35,
            Math.min(BASE_PITCH + 0.35, pitch.current - dy * 0.005)
          );
        }}
        onPointerUp={() => {
          drag.current = null;
          yaw.current = BASE_YAW;
          pitch.current = BASE_PITCH;
        }}
        onPointerLeave={() => {
          drag.current = null;
          setHover(-1);
        }}
      >
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ fov: 34, position: [0, 0, 11.4] }}
        >
          <Stack
            active={active}
            yaw={yaw}
            pitch={pitch}
            onHover={(i) => {
              if (!drag.current) setHover(i);
            }}
            onPick={(i) => {
              if ((drag.current?.moved ?? 0) < 6) setSel((s) => (s === i ? -1 : i));
            }}
          />
        </Canvas>
        <span className="pointer-events-none absolute bottom-2 left-3 font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-wider text-muted">
          drag to orbit
        </span>
      </div>

      <div>
        <ol className="list-none p-0">
          {LAYERS.map((L, i) => {
            const on = active === i;
            const off = active >= 0 && !on;
            return (
              <li
                key={L.n}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(-1)}
                onClick={() => setSel((s) => (s === i ? -1 : i))}
                className={`cursor-pointer border-t border-line py-3 transition-opacity last:border-b ${
                  off ? "opacity-40" : ""
                }`}
                style={on ? { borderTopColor: OXBLOOD } : undefined}
              >
                <span className="block font-mono font-medium text-[length:var(--text-meta)] tracking-widest text-bronze-text">
                  {L.n}
                </span>
                <span
                  className="block font-mono text-[12.5px] font-medium"
                  style={on ? { color: OXBLOOD } : undefined}
                >
                  {L.t}
                </span>
                <span className="mt-0.5 block text-[length:var(--text-lead)] leading-snug text-muted">
                  {L.d}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 min-h-[76px] border-t border-line pt-3">
          <span className="mb-1.5 block font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-widest text-bronze-text">
            {active >= 0 ? "why here" : "order"}
          </span>
          <p className="max-w-[62ch] font-serif text-[length:var(--text-lead)] leading-relaxed">
            {active >= 0
              ? LAYERS[active].why
              : "Weave, then exposure, then development, then the crystal structure you are left looking at. Each position is where that step happens on real film."}
          </p>
        </div>
      </div>
    </div>
  );
}
