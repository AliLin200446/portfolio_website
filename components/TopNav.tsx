"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/*
 * NAV-IA — three-layer top nav: PROJECTS (six, expandable) ·
 * EXPERIMENTS · PHOTOGRAPHY · ABOUT. The dropdown is 0.5px hairline on
 * paper, mono column, no shadow/radius, 0.15s fade; outside click and
 * Esc close it; current project highlighted in copper (顶栏永久无朱).
 * No-JS: PROJECTS renders as a plain home link — the six instruments
 * ARE the catalogue. ACUBOT absent (archived).
 */

const PROJECTS: { label: string; slug: string }[] = [
  { label: "LATENT", slug: "latent" },
  { label: "MATERIAL MEMORY", slug: "material-memory" },
  { label: "RESONANCE", slug: "resonance" },
  { label: "SKELETAL SILK", slug: "skeletal-silk" },
  { label: "TEARDOWN", slug: "teardown" },
  { label: "VESTIGE", slug: "vestige" },
];

const navLink =
  "text-muted transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B] outline-none";

export default function TopNav() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const path = usePathname();

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
      className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-xs"
    >
      <div ref={wrap} className="relative">
        {mounted ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            onMouseEnter={() => setOpen(true)}
            className={`${navLink} ${path?.startsWith("/work") ? "text-ink" : ""}`}
          >
            PROJECTS
          </button>
        ) : (
          // no-JS degradation: the bench itself is the project catalogue
          <a href="/" className={navLink}>
            PROJECTS
          </a>
        )}
        {open && (
          <div
            className="absolute left-0 top-full z-30 mt-2 flex min-w-[13rem] flex-col border border-line bg-paper py-2"
            style={{ borderWidth: "0.5px", animation: "plate-in 0.15s ease" }}
            onMouseLeave={() => setOpen(false)}
          >
            {PROJECTS.map((p) => {
              const here = path === `/work/${p.slug}`;
              return (
                <Link
                  key={p.slug}
                  href={`/work/${p.slug}`}
                  onClick={() => setOpen(false)}
                  aria-current={here ? "page" : undefined}
                  className={`px-4 py-1.5 transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFB46B] outline-none ${
                    here ? "text-bronze" : "text-muted"
                  }`}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Link href="/experiments" className={`${navLink} ${path === "/experiments" ? "text-ink" : ""}`}>
        EXPERIMENTS
      </Link>
      <Link href="/photography" className={`${navLink} ${path === "/photography" ? "text-ink" : ""}`}>
        PHOTOGRAPHY
      </Link>
      <Link href="/about" className={navLink}>
        ABOUT
      </Link>
    </nav>
  );
}
