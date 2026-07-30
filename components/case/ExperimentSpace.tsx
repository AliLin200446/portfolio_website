"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

/*
 * THE EXPERIMENT SPACE — 47 structured calls, placed where they were
 * taken. Four shapes inside the parameter volume, one outside it.
 *
 * Ported, not pasted. Same three edits as the pass stack: three comes
 * from the local dependency instead of cdnjs, the fonts are already
 * loaded once by next/font, and the palette stays in the existing
 * tokens rather than a second set of CSS variables. Geometry, numbers
 * and copy are the author's, unchanged.
 *
 * Every figure here is one the teardown page already states: 47 calls,
 * 19.52 ms per step at R squared 0.9978, 545.1 / 546.8 / 549.6 ms,
 * queue sd 277.0 against inference sd 9.9, zero of 262,144 pixels.
 */

const AXC = 0xc2bcb0;
const GX = -2, GX1 = 2, GY = -1.5, GY1 = 1.5, GZ = -1.5, GZ1 = 1.5;
const STEPS = [1, 2, 4, 8, 12, 16, 20, 28, 36, 45];
const sx = (v: number) => GX + (GX1 - GX) * (v / 45);
const sy = (v: number) => GY + (GY1 - GY) * (v / 20);
const FG = sy(3.5), FS = sx(28);

type Exp = {
  n: string;
  c: number;
  hex: string;
  cnt: number;
  read: string;
  sub: string;
  pts: [number, number, number][];
};

const E: Exp[] = [
  {
    n: "steps sweep", c: 0x1a1714, hex: "#1a1714", cnt: 10,
    read: "10 calls along steps.",
    sub: "19.52 ms per step, R squared 0.9978 across ten. The low rungs scatter and the global fit smooths that over.",
    pts: STEPS.map((v) => [sx(v), FG, GZ]),
  },
  {
    n: "guidance sweep", c: 0x866339, hex: "#866339", cnt: 8,
    read: "8 calls along guidance.",
    sub: "Second knob, same treatment. Per channel pixel diff against the neighbouring rung at two declared thresholds.",
    pts: Array.from({ length: 8 }, (_, i) => [FS, sy(1 + i * (19 / 7)), GZ]),
  },
  {
    n: "seed determinism", c: 0x9a3b22, hex: "#9A3B22", cnt: 3,
    read: "3 calls at one coordinate.",
    sub: "545.1, 546.8, 549.6 ms, so real recomputation. One sha256. Zero of 262,144 pixels differ.",
    pts: Array.from({ length: 3 }, (_, i) => [FS, FG, GZ + i * 0.4]),
  },
  {
    n: "latency series", c: 0x4e5b54, hex: "#4E5B54", cnt: 20,
    read: "20 calls at the same coordinate, different question.",
    sub: "Queue sd 277.0 ms against inference sd 9.9 ms. The variance lives in the segment the API does not return.",
    pts: Array.from({ length: 20 }, (_, i) => [FS - 0.3, FG, GZ + i * 0.148]),
  },
  {
    n: "friction log", c: 0x6b6459, hex: "#6b6459", cnt: 0,
    read: "No coordinate.",
    sub: "Every gap between what the documentation says and what the wire does. It measures the endpoint against its own description.",
    pts: [],
  },
];

const SWEPT_AXIS: Record<number, "x" | "y" | "z"> = { 0: "x", 1: "y", 2: "z", 3: "z" };

function Scene({
  active,
  yaw,
  pitch,
  zoom,
  onHover,
  onPick,
}: {
  active: number;
  yaw: React.RefObject<number>;
  pitch: React.RefObject<number>;
  zoom: React.RefObject<number>;
  onHover: (i: number) => void;
  onPick: (i: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const cur = useRef({ y: 0.62, p: -0.28, z: 10.6 });
  const { camera, invalidate } = useThree();
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const dot = useMemo(() => new THREE.SphereGeometry(0.068, 14, 10), []);
  const flat = useMemo(() => new THREE.SphereGeometry(0.05, 10, 8), []);
  const boxGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(GX1 - GX, GY1 - GY, GZ1 - GZ)),
    []
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const k = reduced.current ? 1 : 0.14;
    const ny = cur.current.y + (yaw.current - cur.current.y) * k;
    const np = cur.current.p + (pitch.current - cur.current.p) * k;
    const nz = cur.current.z + (zoom.current - cur.current.z) * k;
    const moved =
      Math.abs(ny - cur.current.y) > 1e-5 ||
      Math.abs(np - cur.current.p) > 1e-5 ||
      Math.abs(nz - cur.current.z) > 1e-4;
    cur.current = { y: ny, p: np, z: nz };
    g.rotation.y = ny;
    g.rotation.x = np;
    camera.position.z = nz;
    if (moved) invalidate();
  });

  return (
    <group ref={group}>
      <Axis a={[GX, GY, GZ]} b={[GX1, GY, GZ]} k="x" active={active} />
      <Axis a={[GX, GY, GZ]} b={[GX, GY1, GZ]} k="y" active={active} />
      <Axis a={[GX, GY, GZ]} b={[GX, GY, GZ1]} k="z" active={active} />

      {/* floor grid: four lines each way, quiet enough to read past */}
      {[1, 2, 3, 4].map((i) => (
        <group key={i}>
          <Seg a={[GX + (GX1 - GX) * i / 5, GY, GZ]} b={[GX + (GX1 - GX) * i / 5, GY, GZ1]} />
          <Seg a={[GX, GY, GZ + (GZ1 - GZ) * i / 5]} b={[GX1, GY, GZ + (GZ1 - GZ) * i / 5]} />
        </group>
      ))}

      {/* the volume, shown only for the one experiment with no coordinate */}
      <lineSegments
        geometry={boxGeo}
        position={[(GX + GX1) / 2, (GY + GY1) / 2, (GZ + GZ1) / 2]}
        raycast={() => null}
      >
        <lineBasicMaterial color={0x6b6459} transparent opacity={active === 4 ? 0.55 : 0} />
      </lineSegments>

      {E.map((e, i) => {
        if (!e.pts.length) return null;
        const on = active === i;
        const off = active >= 0 && !on;
        return (
          <group key={e.n}>
            <Instanced
              geo={dot}
              pts={e.pts}
              color={e.c}
              opacity={off ? 0.1 : 0.95}
              onOver={() => onHover(i)}
              onOut={() => onHover(-1)}
              onClick={() => onPick(i)}
            />
            {/* the same points dropped to the floor: a shadow, so a
                cluster reads as a position and not as a free-floating
                smear */}
            <Instanced
              geo={flat}
              pts={e.pts.map((p) => [p[0], GY, p[2]] as [number, number, number])}
              color={e.c}
              opacity={off ? 0.03 : on ? 0.26 : 0.16}
            />
            <Path pts={e.pts} color={e.c} opacity={off ? 0.05 : on ? 0.7 : 0.4} />
          </group>
        );
      })}
    </group>
  );
}

/** One axis. It lights in the colour of whichever experiment sweeps
 *  it, so the reader can see which knob a run was actually turning. */
function Axis({
  a,
  b,
  k,
  active,
}: {
  a: [number, number, number];
  b: [number, number, number];
  k: "x" | "y" | "z";
  active: number;
}) {
  const g = useMemo(
    () => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]),
    [a, b]
  );
  const lit = SWEPT_AXIS[active] === k;
  const dim = active >= 0 && active < 4 && !lit;
  return (
    <lineSegments geometry={g} raycast={() => null}>
      <lineBasicMaterial
        color={lit ? E[active].c : AXC}
        transparent
        opacity={dim ? 0.35 : 1}
      />
    </lineSegments>
  );
}

function Seg({ a, b }: { a: [number, number, number]; b: [number, number, number] }) {
  const g = useMemo(
    () => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]),
    [a, b]
  );
  return (
    <lineSegments geometry={g} raycast={() => null}>
      <lineBasicMaterial color={AXC} transparent opacity={0.24} />
    </lineSegments>
  );
}

/** The run as a polyline. Built as an object and mounted through
 *  primitive because the JSX tag `line` resolves to the SVG element,
 *  not to THREE.Line. */
function Path({ pts, color, opacity }: { pts: [number, number, number][]; color: number; opacity: number }) {
  const obj = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
    const m = new THREE.LineBasicMaterial({ color, transparent: true });
    const l = new THREE.Line(g, m);
    l.raycast = () => null;
    return l;
  }, [pts, color]);
  (obj.material as THREE.LineBasicMaterial).opacity = opacity;
  return <primitive object={obj} />;
}

function Instanced({
  geo,
  pts,
  color,
  opacity,
  onOver,
  onOut,
  onClick,
}: {
  geo: THREE.BufferGeometry;
  pts: [number, number, number][];
  color: number;
  opacity: number;
  onOver?: () => void;
  onOut?: () => void;
  onClick?: () => void;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  return (
    <instancedMesh
      ref={(el) => {
        if (!el) return;
        ref.current = el;
        pts.forEach((p, i) => {
          m4.makeTranslation(p[0], p[1], p[2]);
          el.setMatrixAt(i, m4);
        });
        el.instanceMatrix.needsUpdate = true;
        // the bounding sphere is built from the matrices, so it has to
        // be recomputed after writing them or picking misses entirely
        el.computeBoundingSphere();
      }}
      args={[geo, undefined, pts.length]}
      onPointerOver={onOver ? (e) => { e.stopPropagation(); onOver(); } : undefined}
      onPointerOut={onOut}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
      raycast={onOver ? undefined : () => null}
    >
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </instancedMesh>
  );
}

export default function ExperimentSpace() {
  const [sel, setSel] = useState(-1);
  const [hover, setHover] = useState(-1);
  const yaw = useRef(0.62);
  const pitch = useRef(-0.28);
  const zoom = useRef(10.6);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const active = sel >= 0 ? sel : hover;

  return (
    <div>
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
        Five experiments, 47 structured calls
      </p>
      <div
        className="relative aspect-[3/2] w-full cursor-grab overflow-hidden border border-line active:cursor-grabbing"
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
          yaw.current += dx * 0.007;
          pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current - dy * 0.006));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          drag.current = null;
          setHover(-1);
        }}
      >
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ fov: 32, position: [0, 0, 10.6] }}>
          <Scene
            active={active}
            yaw={yaw}
            pitch={pitch}
            zoom={zoom}
            onHover={(i) => {
              if (!drag.current) setHover(i);
            }}
            onPick={(i) => {
              if ((drag.current?.moved ?? 0) < 6) setSel((s) => (s === i ? -1 : i));
            }}
          />
        </Canvas>

        {/* legend, in the DOM rather than projected: it is a control,
            and controls belong where a keyboard can reach them */}
        <div className="absolute left-3 top-3 flex flex-col gap-px">
          {E.map((e, i) => {
            const on = active === i;
            const off = active >= 0 && !on;
            return (
              <button
                key={e.n}
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(-1)}
                onClick={() => setSel((s) => (s === i ? -1 : i))}
                className={`flex items-center gap-2 whitespace-nowrap py-1 pl-1 pr-2 font-mono text-[10.5px] tracking-wide transition-opacity ${
                  off ? "opacity-40" : ""
                } ${on ? "text-ink" : "text-muted"}`}
                style={{ background: "rgba(245,242,236,.72)" }}
              >
                <i aria-hidden className="block h-[9px] w-[9px] shrink-0" style={{ background: e.hex }} />
                <b className="font-medium text-ink">{e.n}</b>
                <span className="opacity-65">{e.cnt ? `${e.cnt} calls` : "no coordinate"}</span>
              </button>
            );
          })}
        </div>

        <span className="pointer-events-none absolute bottom-3 left-3 font-mono text-[9.5px] uppercase tracking-wider text-muted opacity-75">
          drag to turn
        </span>
        <button
          type="button"
          onClick={() => {
            yaw.current = 0.62;
            pitch.current = -0.28;
            zoom.current = 10.6;
          }}
          className="absolute bottom-3 right-3 font-mono text-[9.5px] uppercase tracking-wider text-muted opacity-75 transition-opacity hover:text-ink hover:opacity-100"
        >
          reset
        </button>
      </div>

      <p className="mt-3 min-h-[40px] font-mono text-xs leading-relaxed">
        {active >= 0 ? (
          <>
            {E[active].read} <span className="text-muted">{E[active].sub}</span>
          </>
        ) : (
          <>
            47 structured calls, 48 hours.{" "}
            <span className="text-muted">
              Four shapes in the space, one outside it. Everything not being
              swept is held: 512 by 512, seed 1024, one model, one synchronous
              endpoint.
            </span>
          </>
        )}
      </p>
    </div>
  );
}
