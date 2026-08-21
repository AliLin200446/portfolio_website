"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/*
 * The stack mounts itself when it scrolls into view. No click.
 *
 * The click-to-run contract on this site exists to stop a page paying
 * for a second WebGL context before anyone has asked for one. That
 * reasoning is about WHEN the cost lands, not about demanding a
 * gesture, and an IntersectionObserver answers it just as well: three
 * stays out of the initial JS, stays unloaded for a reader who never
 * scrolls this far, and the figure is simply there for anyone who does.
 *
 * Deliberately NOT eager. Mounting on load would put a GL context and
 * about 107 kB in front of every visitor, including the ones who came
 * for the calibration numbers and will never look at a diagram.
 *
 * rootMargin starts the import slightly before the element arrives, so
 * the swap has usually happened by the time it is on screen. The frame
 * below is what shows until then, and what a no-JS reader keeps: a
 * labelled slot, never a broken box.
 */

const PassStack = dynamic(() => import("./PassStack"), {
  ssr: false,
  loading: () => <Slot label="loading the stack" />,
});

function Slot({ label }: { label: string }) {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center border border-line bg-[#EDE9E0]">
      <span className="px-6 text-center font-mono font-medium text-[length:var(--text-meta)] leading-relaxed tracking-wide text-muted">
        {label}
      </span>
    </div>
  );
}

export default function PassStackFacade() {
  const wrap = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el || live) return;
    // no observer support: show it rather than withhold it
    if (typeof IntersectionObserver === "undefined") {
      setLive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  return (
    <div ref={wrap}>
      {live ? <PassStack /> : <Slot label="five GL passes, stacked" />}
    </div>
  );
}
