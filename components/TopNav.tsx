"use client";

import { BERTH_ORDER, STATIONS } from "@/lib/bench";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/*
 * NAV-IA — three-layer top nav: PROJECTS (the rail's instruments,
 * expandable) ·
 * EXPERIMENTS · PHOTOGRAPHY · ABOUT. The dropdown is 0.5px hairline on
 * paper, mono column, no shadow/radius, 0.15s fade; outside click and
 * Esc close it; current project highlighted in copper (顶栏永久无朱).
 * No-JS: PROJECTS renders as a plain home link — the instruments
 * ARE the catalogue. ACUBOT absent (archived).
 */

/* Derived from BERTH_ORDER, not listed again here.
 *
 * This was a hardcoded array of five, in a different order from the
 * rail, and it had already drifted: the comment above still said six.
 * A second copy of "which projects are the catalogue" is the same
 * shape as the bug that made indexOf throw when two slugs left the
 * rail, and it fails the same way, quietly, in whichever copy nobody
 * edited.
 *
 * BERTH_ORDER answers "which instruments does the site put forward",
 * which is exactly what this menu lists, so the menu reads it. The two
 * cannot disagree now. Material Memory and Vestige keep their case
 * pages and are reachable from /experiments; they are not in the
 * catalogue, and this menu is the catalogue. */
const PROJECTS = BERTH_ORDER.map((slug) => {
  const s = STATIONS.find((x) => x.id === slug)!;
  return { label: s.label, slug };
});

const navLink =
  "text-muted transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B] outline-none";

/** Where you are, marked the same way the rail marks the instrument you
 *  are looking at: a copper rule under it, never cinnabar. Colour alone
 *  was doing this for two of the four and doing nothing for ABOUT, so
 *  three of the site's five destinations gave no answer to "where am
 *  I". A rule survives being read at a glance in a way a shift from
 *  muted grey to ink does not. */
const here = (on: boolean) =>
  `${navLink} ${on ? "border-b border-bronze pb-0.5 text-ink" : ""}`;

export default function TopNav() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const path = usePathname();
  // a case page IS a project, and so is the home rail: the five
  // instruments are the catalogue, which is why the no-JS PROJECTS
  // link points at "/". Leaving home unmarked would mean the one page
  // most visitors land on answers "where am I" with nothing.
  const onWork = path === "/" || (path?.startsWith("/work") ?? false);
  const at = (href: string) => path === href || path?.startsWith(`${href}/`);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav
      aria-label="Site"
      className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono font-medium text-[length:var(--text-meta)]"
    >
      <div ref={wrap} className="relative">
        {mounted ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            onMouseEnter={() => setOpen(true)}
            aria-current={onWork ? "page" : undefined}
            className={here(onWork)}
          >
            PROJECTS
          </button>
        ) : (
          // no-JS degradation: Link still emits a plain SSR anchor —
          // the bench itself is the project catalogue
          <Link
            href="/"
            aria-current={onWork ? "page" : undefined}
            className={here(onWork)}
          >
            PROJECTS
          </Link>
        )}
        {open && (
          <div
            className="absolute left-0 top-full z-30 mt-2 flex min-w-[13rem] flex-col border border-line bg-paper py-2"
            style={{ borderWidth: "0.5px", animation: "plate-in 0.15s ease" }}
            onMouseLeave={() => setOpen(false)}
          >
            {PROJECTS.map((p) => {
              // `current`, not `here`: the module scope now has a
              // here() helper, and a shadow that typechecks either way
              // is the kind that gets found by a wrong render
              const current = path === `/work/${p.slug}`;
              return (
                <Link
                  key={p.slug}
                  href={`/work/${p.slug}`}
                  onClick={() => setOpen(false)}
                  aria-current={current ? "page" : undefined}
                  className={`px-4 py-1.5 transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFB46B] outline-none ${
                    current ? "text-bronze" : "text-muted"
                  }`}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Link
        href="/experiments"
        aria-current={at("/experiments") ? "page" : undefined}
        className={here(at("/experiments"))}
      >
        EXPERIMENTS
      </Link>
      <Link
        href="/photography"
        aria-current={at("/photography") ? "page" : undefined}
        className={here(at("/photography"))}
      >
        PHOTOGRAPHY
      </Link>
      <Link
        href="/about"
        aria-current={at("/about") ? "page" : undefined}
        className={here(at("/about"))}
      >
        ABOUT
      </Link>
    </nav>
  );
}
