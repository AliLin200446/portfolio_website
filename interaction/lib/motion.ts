/** Shared helpers for the interaction system. */

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True when the user is typing — single-key shortcuts must not fire then. */
export const isTypingTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest('dialog[open]')) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
};

/** Run once when an element is mostly in view. Returns a cleanup. */
export const onceInView = (
  el: Element,
  cb: () => void,
  threshold = 0.6,
): (() => void) => {
  if (typeof IntersectionObserver === 'undefined') {
    cb();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        cb();
        io.disconnect();
      }
    },
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
};

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
