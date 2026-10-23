'use client';
// 09 + 11 · Inspect mode. Press G (or call toggle from the header button):
//   • 12-column grid overlay at 8% accent
//   • redlines on hover: element size + distance to its parent's edges
// Normal browsing stays clean; redlines only exist while inspecting.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isTypingTarget } from '../lib/motion';

type Ctx = { on: boolean; toggle: () => void };
const InspectCtx = createContext<Ctx>({ on: false, toggle: () => {} });
export const useInspect = () => useContext(InspectCtx);

type Box = {
  x: number; y: number; w: number; h: number;
  gapL: number; gapT: number; px: number; py: number;
};

export function InspectMode({
  children,
  maxWidth = 1344,
  columns = 12,
  gutter = 24,
  margin = 48,
}: {
  children: ReactNode;
  maxWidth?: number;
  columns?: number;
  gutter?: number;
  margin?: number;
}) {
  const [on, setOn] = useState(false);
  const [box, setBox] = useState<Box | null>(null);
  const toggle = useCallback(() => setOn((v) => !v), []);

  // G toggles; Esc exits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape') {
        setOn(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  // Redlines follow the hovered element.
  useEffect(() => {
    if (!on) {
      setBox(null);
      return;
    }
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const t = e.target as HTMLElement | null;
        const el = (t?.closest('[data-inspect]') as HTMLElement | null) ?? t;
        if (!el || el === document.body || el === document.documentElement) {
          setBox(null);
          return;
        }
        const r = el.getBoundingClientRect();
        const p = (el.parentElement ?? document.body).getBoundingClientRect();
        setBox({
          x: r.left, y: r.top, w: r.width, h: r.height,
          gapL: r.left - p.left, gapT: r.top - p.top, px: p.left, py: p.top,
        });
      });
    };
    const clear = () => setBox(null);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', clear, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', clear);
    };
  }, [on]);

  const n = (v: number) => Math.round(v);

  return (
    <InspectCtx.Provider value={{ on, toggle }}>
      {children}

      <div
        className="inspect-grid"
        data-on={on}
        aria-hidden="true"
        style={{
          maxWidth,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          columnGap: gutter,
          paddingInline: margin,
        }}
      >
        {Array.from({ length: columns }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      {on && box ? (
        <div aria-hidden="true">
          {/* element outline + size tag */}
          <div className="redline redline--box" style={{ left: box.x, top: box.y, width: box.w, height: box.h }} />
          <div className="redline redline--tag" style={{ left: box.x, top: Math.max(0, box.y - 18) }}>
            {n(box.w)} × {n(box.h)}
          </div>
          {/* gap to parent's left edge */}
          {box.gapL > 1 ? (
            <>
              <div className="redline redline--h" style={{ left: box.px, top: box.y + box.h / 2, width: box.gapL }} />
              <div className="redline redline--tag" style={{ left: box.px + box.gapL / 2 - 14, top: box.y + box.h / 2 + 4 }}>
                {n(box.gapL)}
              </div>
            </>
          ) : null}
          {/* gap to parent's top edge */}
          {box.gapT > 1 ? (
            <>
              <div className="redline redline--v" style={{ left: box.x + box.w / 2, top: box.py, height: box.gapT }} />
              <div className="redline redline--tag" style={{ left: box.x + box.w / 2 + 4, top: box.py + box.gapT / 2 - 8 }}>
                {n(box.gapT)}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </InspectCtx.Provider>
  );
}

/** Header button that mirrors the G key. */
export function InspectToggle({ className = '' }: { className?: string }) {
  const { on, toggle } = useInspect();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Exit inspect mode (G)' : 'Inspect grid and spacing (G)'}
      className={className}
    >
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    </button>
  );
}
