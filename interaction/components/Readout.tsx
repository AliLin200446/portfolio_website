'use client';
// 06 · Readouts. Mono + tabular-nums: numbers change, widths never jitter.

import { useEffect, useRef, useState, type ReactNode } from 'react';

const pad = (n: number, w = 3) => String(Math.max(0, Math.round(n))).padStart(w, '0');

/** Crosshair + live x/y inside a demo area only. */
export function CursorReadout({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      setPos({ x: clientX - r.left, y: clientY - r.top });
    });
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div
      ref={ref}
      className={`readout-area ${className}`}
      onPointerMove={onMove}
      onPointerLeave={() => setPos(null)}
    >
      {children}
      <span className="readout" aria-hidden="true">
        x {pos ? pad(pos.x) : '---'} · y {pos ? pad(pos.y) : '---'}
      </span>
    </div>
  );
}

/** Live New York clock, HH:MM, updates on the minute. */
export function NYClock({ seconds = false }: { seconds?: boolean }) {
  const [now, setNow] = useState<string>('--:--');

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: seconds ? '2-digit' : undefined,
      hour12: false,
      timeZone: 'America/New_York',
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, seconds ? 1000 : 15000);
    return () => window.clearInterval(id);
  }, [seconds]);

  return (
    <time className="tnum" suppressHydrationWarning>
      NYC {now}
    </time>
  );
}
