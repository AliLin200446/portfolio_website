"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { BERTH_ORDER, STATIONS } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import Cocoon from "./Cocoon";
import FilmRoll from "./FilmRoll";
import Movement from "./Movement";

/*
 * THE WORK GRID. Every instrument on one scrollable page, description
 * pinned on the left, objects stacked on the right.
 *
 * This replaces the rail. The rail translated a camera along X and put
 * one instrument in front of you at a time, which meant a visitor who
 * did not drag saw one of three and was never told the other two
 * existed. Here the page scrolls, the cells stack, and the second cell
 * is already breaking the bottom of the first screen, so the scroll is
 * offered rather than discovered.
 *
 * ONE CANVAS, NOT THREE. Three cells could each own a <Canvas> and that
 * would be three WebGL contexts on the first paint. Instead one canvas
 * is fixed over the right column and the CAMERA moves down as the page
 * scrolls, past instruments standing at fixed world positions. Same
 * count of contexts as the rail had: one.
 *
 * SCROLL IS THE ONLY INPUT. No wheel handler, no drag, no snap, no
 * resistance. The browser scrolls the page and the camera follows,
 * which is why this file is a fraction of the rail's size: all of that
 * machinery existed to reimplement scrolling on a fixed viewport.
 *
 * Constitution unchanged: frameloop="demand", settled is zero rAF, DOM
 * above 3D, warm fog only, no shadows, no orbit.
 */

/* ── stage ─────────────────────────────────────────────────────────
 * One reading pose. The camera never rotates; it only descends. */
const FOV = 40;
const CAM_Y = 1.05;
const CAM_Z = 3.3;
const CAM_PITCH = THREE.MathUtils.degToRad(-7.6);

/** World distance between one instrument and the next, down. Paired
 *  with CELL_VH below: one cell of scroll moves the camera exactly one
 *  spacing, so an instrument sits in the same place in its cell as its
 *  neighbour does in theirs. */
const SPACING = 3.4;

/** Cell height as a fraction of the viewport. Under 1 on purpose: at
 *  0.78 the next cell's top edge is on the first screen, so the page
 *  says there is more without a scroll hint or an arrow. That was the
 *  rail's actual failure, not its interaction. */
const CELL_VH = 0.78;

/** How much of its cell an instrument fills. Lower than the rail's 0.86
 *  because the object no longer has the whole viewport: it has the
 *  right column, and it has to clear the cell's own top and bottom. */
const STAGE_W_FRAC = 0.72;
const STAGE_H_FRAC = 0.62;

/** Judged against the rendered frame, same as the rail: measured-equal
 *  is not reading-equal. The cocoon is mostly air and stays at full. */
const TRIM: Record<string, number> = {
  latent: 0.8,
  teardown: 0.8,
  "skeletal-silk": 1,
};

const READ_DEPTH = CAM_Z * Math.cos(CAM_PITCH) - CAM_Y * Math.sin(CAM_PITCH);
const frameAt = (depth: number, w: number, h: number) => {
  const fh = 2 * depth * Math.tan(THREE.MathUtils.degToRad(FOV) / 2);
  return { w: fh * (w / h), h: fh };
};

/** World Y of instrument i. Down the page is down the world. */
const slotY = (i: number) => -i * SPACING;

/** Measured off the placed object, never recomputed from the formula
 *  that placed it: a number derived from slotY(i) agrees with the
 *  placement code even when the placement code is wrong. Read back off
 *  the scene graph, the two can disagree. Same rule the rail's dive
 *  assertion was rebuilt around. */
const FITTED = new Map<string, { w: number; h: number; d: number; y: number }>();

/** The silhouette rule, shared by the fit and anything that measures
 *  after it. Geometry can lie about the silhouette: FilmRoll's leader
 *  is a full length ribbon the shader reveals along its curve, so at
 *  rest most of it is present and not drawn. userData.noFrame marks
 *  that at the source. */
function frameBox(o: THREE.Object3D, out: THREE.Box3, scratch: THREE.Box3) {
  out.makeEmpty();
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (!m.isMesh || m.userData.noFrame || !m.geometry) return;
    m.geometry.computeBoundingBox();
    if (!m.geometry.boundingBox) return;
    scratch.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
    out.union(scratch);
  });
  return out;
}

/** Stands one instrument in its cell at stage size.
 *
 *  Measured from the model at mount rather than written down as a
 *  scale per instrument, so editing a model re-fits it instead of
 *  quietly changing how big it looks. */
function Fit({
  id,
  index,
  onFit,
  children,
}: {
  id: string;
  index: number;
  onFit: () => void;
  children: React.ReactNode;
}) {
  const trim = TRIM[id] ?? 1;
  const g = useRef<THREE.Group>(null);
  const { invalidate, size } = useThree();
  useLayoutEffect(() => {
    const o = g.current;
    if (!o) return;
    const box = new THREE.Box3();
    const scratch = new THREE.Box3();

    const fit = () => {
      o.scale.setScalar(1);
      o.position.set(0, 0, 0);
      o.updateMatrixWorld(true);
      frameBox(o, box, scratch);
      if (box.isEmpty()) return;
      const d = box.getSize(new THREE.Vector3());
      if (d.x < 1e-4 || d.y < 1e-4) return;
      const f = frameAt(READ_DEPTH, size.width, size.height);
      const s =
        Math.min((f.w * STAGE_W_FRAC) / d.x, (f.h * STAGE_H_FRAC) / d.y) * trim;
      o.scale.setScalar(s);
      // centred in x, standing on its slot's floor, receding from z = 0
      o.position.set(
        -((box.min.x + box.max.x) / 2) * s,
        slotY(index) - box.min.y * s,
        -box.max.z * s
      );
      o.updateMatrixWorld(true);
      frameBox(o, box, scratch);
      if (box.isEmpty()) return;
      FITTED.set(id, {
        w: d.x * s,
        h: d.y * s,
        d: d.z * s,
        y: (box.min.y + box.max.y) / 2,
      });
      onFit();
      invalidate();
    };

    fit();
    // once more after the live ones settle; a static instrument
    // measures the same both times and this costs it one Box3
    const again = setTimeout(fit, 900);
    return () => {
      clearTimeout(again);
      if (FITTED.get(id)) FITTED.delete(id);
    };
  }, [id, index, trim, onFit, invalidate, size.width, size.height]);
  return <group ref={g}>{children}</group>;
}

/** All three carry geometry, always. There is no mount window because
 *  there is nothing to withhold: every cell is one scroll from the
 *  screen, and the window the rail used excluded index 2 at berth 0
 *  anyway. */
function Instruments({ onFit }: { onFit: () => void }) {
  return (
    <>
      <Fit id="latent" index={0} onFit={onFit}>
        <FilmRoll position={[0, 0, 0]} />
      </Fit>
      <Fit id="teardown" index={1} onFit={onFit}>
        <Movement position={[0, 0, 0]} />
      </Fit>
      <Fit id="skeletal-silk" index={2} onFit={onFit}>
        <Cocoon position={[0, 0, 0]} />
      </Fit>
    </>
  );
}

/** The camera descends with the page. It never rotates and never
 *  orbits; scroll is the only thing that moves it. */
function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { camera, invalidate } = useThree();
  const shown = useRef(0);

  useEffect(() => {
    camera.rotation.set(CAM_PITCH, 0, 0);
    camera.position.set(0, CAM_Y, CAM_Z);
    invalidate();
  }, [camera, invalidate]);

  useFrame(() => {
    const want = -(progress.current ?? 0) * SPACING;
    const d = want - shown.current;
    if (Math.abs(d) < 0.0004) {
      shown.current = want;
      return;
    }
    // eased follow rather than a hard bind, so a flung scroll does not
    // snap the objects; settles inside a few frames and then stops
    shown.current += d * 0.18;
    camera.position.y = CAM_Y + shown.current;
    invalidate();
  });
  return null;
}

export default function WorkGrid() {
  const router = useRouter();
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const [entering, setEntering] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const onFit = useRef(() => {}).current;

  const stations = BERTH_ORDER.map((id) => STATIONS.find((s) => s.id === id)!);

  /* Scroll drives everything: the camera's descent and which
     description is showing. Read from one scroll listener rather than
     an IntersectionObserver per cell, because the camera needs a
     continuous value and the description needs a rounded one, and
     deriving both from the same number is what keeps them agreeing. */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const read = () => {
      const cell = window.innerHeight * CELL_VH;
      const p = Math.max(0, Math.min(BERTH_ORDER.length - 1, el.scrollTop / cell));
      progress.current = p;
      const i = Math.round(p);
      setActive((prev) => (prev === i ? prev : i));
    };
    // The browser restores a scroll position on reload, and this
    // scroller is not the document, so it restores silently: the page
    // came back showing instrument 3 with the description to match,
    // which reads as a bug rather than as a memory. The grid always
    // opens on the first work.
    el.scrollTop = 0;
    read();
    el.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      el.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  useEffect(() => {
    useBenchStore.getState().setBoot(35, "three runtime");
  }, []);

  /* Make the canvas measure itself, and keep asking until it has.
   *
   * Without this the FIRST visit deadlocks and the page never leaves
   * the loading screen. R3F sizes its canvas from a ResizeObserver on
   * the container; on this mount path that first observation does not
   * arrive, so the canvas stays at its default 300x150, the renderer is
   * never created, onCreated never runs, and boot stops at 35. The
   * loader is waiting on boot to reach 100, so it never unmounts, so
   * the layout never changes, so nothing triggers the observer again.
   * Each half waits for the other.
   *
   * It was invisible in testing because every local check set
   * bench-ready first to skip the loader, and removing the loader from
   * the DOM is itself the layout change that breaks the deadlock. The
   * one path never exercised was the one every visitor takes.
   *
   * A single rAF was tried first and was too early: the observer is not
   * listening yet that frame. So this polls instead of guessing, and
   * stops the moment the canvas reports a real backing size. Bounded,
   * so a browser that never sizes it does not spin forever; it gives up
   * and leaves the loader honest rather than looping. */
  useEffect(() => {
    let tries = 0;
    const t = setInterval(() => {
      const c = document.querySelector("canvas");
      // 300x150 is the HTML default, i.e. "never measured"
      if (c && (c.width > 300 || c.height > 150)) {
        clearInterval(t);
        return;
      }
      window.dispatchEvent(new Event("resize"));
      if (++tries > 40) clearInterval(t);
    }, 100);
    return () => clearInterval(t);
  }, []);

  /* Entering a case page. The rail dove the camera into the surface
     first; that pose was defined against a camera parked in front of
     one object, and the camera here is wherever the scroll left it,
     which may be between two. The surface handover is kept, the dive
     is not: BenchArrival still dresses the case page in the same
     colour, so the route change stays invisible. Restoring a dive
     means defining a pose relative to the scroll position, which is a
     different piece of work from this layout. */
  const enter = (id: string) => {
    const st = STATIONS.find((s) => s.id === id);
    if (!st?.href || entering) return;
    setEntering(id);
    sessionStorage.setItem("bench-cut", id);
    setTimeout(() => router.push(st.href!), 220);
  };

  return (
    <div className="fixed inset-0 z-0 flex">
      {/* LEFT: pinned. It does not scroll, so the description is always
          the one belonging to whatever is on screen. */}
      <div className="hidden w-[34%] shrink-0 flex-col justify-center border-r border-line px-10 lg:flex">
        <p className="font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-[0.18em] text-bronze">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(BERTH_ORDER.length).padStart(2, "0")}
          <span className="ml-3 text-muted">{stations[active]?.label}</span>
        </p>
        <p className="mt-4 max-w-[42ch] font-serif text-[length:var(--text-lead)] leading-snug text-ink">
          {stations[active]?.blurb}
        </p>
        <a
          href={stations[active]?.href}
          className="mt-6 inline-flex w-fit items-center gap-2 border border-bronze px-3 py-1.5 font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-widest text-bronze-text transition-colors hover:bg-bronze hover:text-paper"
        >
          open case ↗
        </a>
      </div>

      {/* RIGHT: two stacked layers in one column.
          The canvas is absolutely positioned inside this column, so it
          takes the column's width rather than the viewport's; it was
          briefly `fixed` with a 100% width, which made it 1425px wide
          and painted straight over the description.
          The scroller sits on top of it, transparent, and owns every
          pointer event: scrolling, clicking a cell, and hovering one.
          Nothing is raycast into the canvas, which is also why there
          are no invisible hit boxes here. */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-0">
          <Canvas
            dpr={[1, 1.75]}
            frameloop="demand"
            camera={{ fov: FOV, position: [0, CAM_Y, CAM_Z] }}
            style={{ pointerEvents: "none" }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl, scene, camera }) => {
              const s = useBenchStore.getState();
              s.setBoot(60, "webgl context");
              let meshes = 0;
              scene.traverse((o) => {
                if ((o as THREE.Mesh).isMesh) meshes += 1;
              });
              s.setBoot(70, `shader compile · ${meshes} meshes`);
              const done = () => {
                s.setBoot(100, "ready");
                sessionStorage.setItem("bench-ready", "1");
              };
              gl.compileAsync(scene, camera).then(done).catch(done);
            }}
          >
            <fog attach="fog" args={["#E9E3D6", 7, 20]} />
            <directionalLight position={[-3, 6, 4]} intensity={1.4} color="#fff6e8" />
            <ambientLight intensity={0.75} />
            <Instruments onFit={onFit} />
            <Rig progress={progress} />
          </Canvas>
        </div>

        {/* The scroll layer. One transparent cell per instrument, each
            a real link: that is what makes the object clickable, gives
            the keyboard a stop, and gives a screen reader something to
            read. The cell is the target rather than the mesh, so there
            is one hit path instead of two and it works the same on
            touch. */}
        <div ref={scroller} className="absolute inset-0 overflow-y-auto">
          {stations.map((s, i) => (
            <a
              key={s.id}
              href={s.href}
              aria-label={s.label}
              onClick={(e) => {
                e.preventDefault();
                enter(s.id);
              }}
              onMouseEnter={() => useBenchStore.getState().setHovered(s.id)}
              onMouseLeave={() => useBenchStore.getState().setHovered(null)}
              style={{ height: `${CELL_VH * 100}svh` }}
              className="group relative flex items-end justify-start p-8 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#FFB46B]"
            >
              <span className="font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-[0.18em] text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {String(i + 1).padStart(2, "0")} · {s.label} ↗
              </span>
            </a>
          ))}
          <div style={{ height: `${(1 - CELL_VH) * 100}svh` }} />
        </div>
      </div>

      {/* The cut surface, same handover the rail used so the case page
          arrives already wearing it. */}
      {entering && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[40]"
          style={{
            background:
              entering === "latent"
                ? "#14100d"
                : entering === "teardown"
                  ? "#241C15"
                  : "#FBF5E8",
            animation: "bench-cut 0.22s ease-out both",
          }}
        />
      )}
    </div>
  );
}
