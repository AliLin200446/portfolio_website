'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './loader.module.css';

// One clock for the complete sequence, including the last strip's exit.
// Preserve the original 2400 : 160 : (560 + 11 * 34) stage proportions.
export const LOADER_DURATION_MS = 3000;
const columns = Array.from({ length: 12 }, (_, i) => i);
const scale = LOADER_DURATION_MS / (2400 + 160 + 560 + 11 * 34);
const progressMs = 2400 * scale;
const fadeMs = 160 * scale;
const stripMs = 560 * scale;
const staggerMs = 34 * scale;

export default function Loader() {
  const cover = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState('loading');
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.loader === 'done') { setPhase('done'); return; }
    const element = cover.current;
    if (!element) return;
    const content = document.getElementById('portfolio-content');
    if (content) content.inert = true;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let completed = false;
    let frame = 0;
    let animations: Animation[] = [];
    const done = () => {
      if (disposed || completed) return;
      completed = true;
      cancelAnimationFrame(frame);
      root.dataset.loader = 'done';
      if (content) content.inert = false;
      try { sessionStorage.setItem('portfolio-loaded', '1'); } catch {}
      setPhase('done');
    };
    const shorten = () => {
      cancelAnimationFrame(frame);
      animations.forEach(animation => animation.cancel());
      setProgress(100);
      // A preference change also shortens an already-running entrance.
      const fade = element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
      animations = [fade];
      void fade.finished.then(done, () => {});
    };
    const onMotion = () => { if (motion.matches && !completed) shorten(); };
    motion.addEventListener('change', onMotion);
    if (motion.matches) shorten();
    else {
      const start = performance.now();
      const timelineStart = document.timeline.currentTime;
      const text = element.querySelector<HTMLElement>('[data-loader-content]')!;
      const textFade = text.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay: progressMs, duration: fadeMs, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.2,1)',
      });
      animations = [textFade, ...Array.from(element.querySelectorAll<HTMLElement>('[data-loader-strip]')).map((strip, i) =>
        strip.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], {
          delay: progressMs + fadeMs + i * staggerMs,
          duration: stripMs, fill: 'forwards', easing: 'cubic-bezier(.6,0,.2,1)',
        }))];
      // Synchronize every stage; chained timers would accumulate scheduling drift.
      animations.forEach(animation => { animation.startTime = timelineStart; });
      void animations[animations.length - 1].finished.then(done, () => {});
      const tick = (now: number) => {
        if (disposed || completed) return;
        // This counter represents entrance progress, not network download bytes.
        const fraction = Math.min(1, (now - start) / progressMs);
        setProgress(Math.floor(fraction * 100));
        if (fraction < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      animations.forEach(animation => animation.cancel());
      motion.removeEventListener('change', onMotion);
      if (content) content.inert = false;
    };
  }, []);
  if (phase === 'done') return null;
  return <div ref={cover} className={styles.stage} data-duration={LOADER_DURATION_MS} data-loader-cover data-phase={phase} role="status" aria-live="polite" aria-label={`Loading, ${progress} percent`}>
    <div className={styles.strips} aria-hidden="true">{columns.map(i => <span key={i} data-loader-strip />)}</div>
    <div className={styles.content} data-loader-content aria-hidden="true">
      <div className={styles.columns}>{columns.map(i => <span key={i} />)}</div>
      <p>Design Engineer: I turn creative intuition into systems that make generative AI more controllable.</p>
      {columns.map(i => <div className={styles.segment} key={i} style={{ gridColumn: i + 1 }}><i style={{ width: `${Math.max(0, Math.min(100, progress / 100 * 12 * 100 - i * 100))}%` }} /></div>)}
      <div className={styles.counter}>{progress}</div>
    </div>
  </div>;
}
