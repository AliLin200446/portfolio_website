'use client';
// 12 · Tick-up. A real number counts up once when it enters view (600ms),
// then never moves again. Width is reserved for the final value.
// Only use on real measurements — never on placeholders.

import { useEffect, useRef, useState } from 'react';
import { easeOutCubic, onceInView, prefersReducedMotion } from '../lib/motion';

export function TickUp({
  value,
  decimals = 0,
  suffix = '',
  duration = 600,
  className = '',
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number>(value); // SSR / no-JS shows the real value
  const fmt = (v: number) =>
    v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const finalText = fmt(value) + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    setShown(0);
    let raf = 0;
    const stop = onceInView(el, () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setShown(value * easeOutCubic(t));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span
      ref={ref}
      className={`tnum ${className}`}
      style={{ display: 'inline-block', minWidth: `${finalText.length}ch` }}
      aria-label={finalText}
    >
      <span aria-hidden="true">
        {fmt(shown)}
        {suffix}
      </span>
    </span>
  );
}
