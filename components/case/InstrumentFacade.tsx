"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

/*
 * INSTRUMENT FACADE — the same contract LiveFacade uses for live sites,
 * applied to 3D: nothing of Three exists in the page until a click.
 * The import below is dynamic and ssr:false, so the whole inspector and
 * its dependency tree stay out of the route's initial JS.
 *
 * Unmounting is what keeps the WebGL context from leaking: leaving the
 * route unmounts this component, which unmounts the Canvas, which
 * disposes the context. There is no module-level renderer to outlive it.
 */

const MovementInspector = dynamic(() => import("./MovementInspector"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[46svh] w-full items-center justify-center border border-line bg-[#EDE9E0]">
      <span className="font-mono font-medium text-[length:var(--text-meta)] text-muted">loading the movement …</span>
    </div>
  ),
});

export default function InstrumentFacade({
  poster,
  label,
}: {
  poster?: string;
  label: string;
}) {
  const [live, setLive] = useState(false);

  if (live) return <MovementInspector />;

  return (
    <button
      type="button"
      onClick={() => setLive(true)}
      className="group relative flex h-[46svh] w-full items-center justify-center border border-line bg-[#EDE9E0] transition-colors hover:border-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <span className="px-6 text-center font-mono font-medium text-[length:var(--text-meta)] leading-relaxed tracking-wide text-muted">
          {label}
        </span>
      )}
      <span className="absolute bottom-3 right-3 border border-ink bg-paper px-3 py-1.5 font-mono font-medium text-[length:var(--text-meta)] transition-colors group-hover:text-bronze-text">
        ▶ inspect the movement
      </span>
    </button>
  );
}
