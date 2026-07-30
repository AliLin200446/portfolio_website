"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

/* Same contract as every other 3D on this site: three arrives on a
 * click, never in the page's initial JS. */
const PassStack = dynamic(() => import("./PassStack"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[4/3] w-full items-center justify-center border border-line bg-[#EDE9E0]">
      <span className="font-mono text-[11px] text-muted">loading the stack …</span>
    </div>
  ),
});

export default function PassStackFacade() {
  const [live, setLive] = useState(false);
  if (live) return <PassStack />;
  return (
    <button
      type="button"
      onClick={() => setLive(true)}
      className="group relative flex aspect-[4/3] w-full items-center justify-center border border-line bg-[#EDE9E0] transition-colors hover:border-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
    >
      <span className="px-6 text-center font-mono text-[10px] leading-relaxed tracking-wide text-muted">
        five GL passes, stacked · click to turn it
      </span>
      <span className="absolute bottom-3 right-3 border border-ink bg-paper px-3 py-1.5 font-mono text-[11px] transition-colors group-hover:text-bronze-text">
        ▶ open the stack
      </span>
    </button>
  );
}
