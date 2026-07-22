"use client";

import { useEffect, useState } from "react";

/*
 * CASE-NAV §2 — the in-page index. DATA-DRIVEN: the section list comes
 * from what the page actually renders (empty sections never appear).
 * Desktop ≥1024px: fixed vertical rail on the far right edge, mono ink,
 * the current section in copper (never cinnabar — the case-page 朱
 * budget belongs to the active exhibit number); it hugs the viewport
 * edge so the split-screen exhibit column is never covered. Below
 * 1024px: a static horizontal row at the top — no width stolen.
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

  const jump = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return; // no-JS falls through to the plain anchor
    e.preventDefault();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <nav
      aria-label="page sections"
      className="flex flex-wrap gap-x-4 gap-y-1 py-2 lg:fixed lg:right-2 lg:top-1/2 lg:z-10 lg:-translate-y-1/2 lg:flex-col lg:gap-2 lg:py-0"
    >
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          onClick={(e) => jump(e, it.id)}
          aria-current={active === it.id ? "true" : undefined}
          className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${
            active === it.id ? "text-bronze" : "text-muted hover:text-ink"
          }`}
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}
