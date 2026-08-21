"use client";

import { useEffect, useState } from "react";

/*
 * CASE-NAV §2 — the in-page index. DATA-DRIVEN: the section list comes
 * from what the page actually renders (empty sections never appear).
 * Desktop ≥1280px: a sticky vertical rail occupying the 20% column of
 * the case page's 20/80 grid, mono ink, the current section in copper
 * (never cinnabar — the case-page 朱 budget belongs to the active
 * exhibit number). It used to be fixed to the viewport edge and take no
 * layout width at all; it is a real column now. Below 1280px: a static
 * horizontal row at the top — no width stolen.
 * Behavior: click = smooth scroll (reduced-motion: instant jump);
 * highlight = IntersectionObserver on scroll, still the moment the
 * scroll stops. No JS: plain anchor links, fully usable, zero loss.
 */

export type IndexItem = { id: string; label: string };

export default function CaseIndex({ items }: { items: IndexItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActive((e.target as HTMLElement).id);
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  // FISH-POLISH §2: controlled ease-out scroll (~600ms) instead of the
  // browser's smooth default; the reader's wheel/touch takes over
  // instantly (no lock). reduced-motion: instant jump, zero animation.
  const jump = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return; // no-JS falls through to the plain anchor
    e.preventDefault();
    const target = el.getBoundingClientRect().top + window.scrollY - 32;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, target);
      return;
    }
    const start = window.scrollY;
    const t0 = performance.now();
    let raf = 0;
    const stop = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 600);
      const ease = 1 - Math.pow(1 - p, 3);
      window.scrollTo(0, start + (target - start) * ease);
      if (p < 1) raf = requestAnimationFrame(step);
      else stop();
    };
    raf = requestAnimationFrame(step);
  };

  return (
    <nav
      aria-label="page sections"
      // FISH-POLISH §1: left edge (folio 右侧让位给分屏右栏与旁注);
      // 竖排阈值 1280px —— 以下收起为顶部横排(既有降级,仅改触发)
      // It was xl:fixed against the viewport's left edge, pinned to the
      // vertical centre. That took no layout width, so the rail floated
      // beside the prose rather than sharing a grid with it. It is the
      // 20% column now: sticky inside its own column, so it holds its
      // place while the 80% column scrolls past. Below xl it is still
      // the horizontal row at the top, unchanged.
      className="flex flex-wrap gap-x-4 gap-y-1 py-2 xl:sticky xl:top-28 xl:z-10 xl:flex-col xl:items-start xl:gap-2 xl:self-start xl:py-0"
    >
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          onClick={(e) => jump(e, it.id)}
          aria-current={active === it.id ? "true" : undefined}
          className={`font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-widest transition-colors ${
            active === it.id ? "text-bronze-text" : "text-muted hover:text-ink"
          }`}
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}
