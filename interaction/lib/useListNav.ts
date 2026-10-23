'use client';
// 13a · J / K list navigation. Moves focus between [data-nav-item]
// elements (the Projects rows). Enter opens the focused link natively.
// Reuses the global focus ring, so it looks exactly like hover.

import { useEffect } from 'react';
import { isTypingTarget, prefersReducedMotion } from './motion';

export function useListNav(selector = '[data-nav-item]') {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      if (key !== 'j' && key !== 'k') return;

      const items = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(el => el.getClientRects().length > 0 && !el.hasAttribute('disabled'));
      if (!items.length) return;
      e.preventDefault();

      const current = items.findIndex((el) => el === document.activeElement || el.contains(document.activeElement));
      const next =
        current === -1
          ? key === 'j' ? 0 : items.length - 1
          : Math.min(items.length - 1, Math.max(0, current + (key === 'j' ? 1 : -1)));

      const target = items[next];
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selector]);
}
