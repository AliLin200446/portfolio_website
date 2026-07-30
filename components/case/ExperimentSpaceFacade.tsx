"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/* Same contract as the pass stack: three arrives when the figure
 * scrolls into view, never in the page's initial JS, and never for a
 * reader who does not get this far. */
const ExperimentSpace = dynamic(() => import("./ExperimentSpace"), {
  ssr: false,
  loading: () => <Slot label="loading the space" />,
});

function Slot({ label }: { label: string }) {
  return (
    <div className="flex aspect-[3/2] w-full items-center justify-center border border-line bg-[#EDE9E0]">
      <span className="px-6 text-center font-mono text-[10px] tracking-wide text-muted">
        {label}
      </span>
    </div>
  );
}

export default function ExperimentSpaceFacade() {
  const wrap = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el || live) return;
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
      {live ? <ExperimentSpace /> : <Slot label="five experiments, 47 structured calls" />}
    </div>
  );
}
