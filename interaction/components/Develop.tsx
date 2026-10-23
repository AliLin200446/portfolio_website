'use client';
// 05 · Develop. First time an image is in view it goes from
// desaturated + grain to clean in 320ms. Once per image, never again.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { onceInView, prefersReducedMotion } from '../lib/motion';

const seen = new Set<string>();
export function Develop({ children, className = '', identity }: { children: ReactNode; className?: string; identity?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [developed, setDeveloped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || (identity && seen.has(identity))) {
      setDeveloped(true);
      return;
    }
    return onceInView(el, () => { setDeveloped(true); if(identity) seen.add(identity); }, 0.35);
  }, [identity]);

  return (
    <div ref={ref} className={`develop ${className}`} data-developed={developed}>
      {children}
    </div>
  );
}
