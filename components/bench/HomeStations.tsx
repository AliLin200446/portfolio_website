"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BERTH_ORDER, STATIONS } from "@/lib/bench";
import { editorialStyles as s } from "@/components/editorial/Editorial";

const MobileBench = dynamic(() => import("./MobileBench"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full border border-line" role="status">Loading instrument…</div>,
});

/** Existing station list and models, kept secondary to the featured work. */
export default function HomeStations() {
  const [shown, setShown] = useState<string>(BERTH_ORDER[1]);
  const [inspect, setInspect] = useState(false);
  const ordered = BERTH_ORDER.filter((id) => id !== "latent").map(
    (id) => STATIONS.find((station) => station.id === id)!
  );

  useEffect(() => {
    // Preserve existing case-page return links without mounting the fixed rail.
    const raw = new URLSearchParams(window.location.search).get("berth");
    const berth = raw === null ? NaN : Number(raw);
    if (Number.isInteger(berth) && berth >= 0 && berth < BERTH_ORDER.length) {
      document.getElementById(`project-${BERTH_ORDER[berth]}`)?.scrollIntoView();
    }
  }, []);

  return (
    <section aria-labelledby="stations-title" className="py-[var(--space-l)]">
      <h2 id="stations-title" className={`${s.label} mb-[var(--space-m)]`}>Stations</h2>
      <ol start={2} className="border-t border-line">
        {ordered.map((station, i) => (
          <li key={station.id} id={`project-${station.id}`} className="scroll-mt-24 border-b border-line"
            onPointerEnter={() => setShown(station.id)} onFocusCapture={() => setShown(station.id)}>
            <Link href={station.href!} className="group grid gap-1 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-text">
              <span className={s.label}>{String(i + 2).padStart(2, "0")}</span>
              <span className="font-serif text-[length:var(--text-lead)] decoration-bronze decoration-1 underline-offset-4 group-hover:underline">{station.label}</span>
              {station.blurb && <span className="text-[length:var(--text-body)] leading-snug text-muted">{station.blurb}</span>}
            </Link>
          </li>
        ))}
      </ol>
      <button type="button" aria-expanded={inspect} aria-controls="station-instrument"
        onClick={() => setInspect(!inspect)}
        className={`${s.label} mt-[var(--space-m)] cursor-pointer underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-text`}>
        {inspect ? "Close instruments" : "Inspect instruments"}
      </button>
      <div id="station-instrument">
        {inspect && <div className="mt-[var(--space-m)] max-w-lg">
          <MobileBench slug={shown} />
          <p className={`${s.meta} mt-[var(--space-xs)]`}>Focus or hover a station to inspect its instrument.</p>
        </div>}
      </div>
    </section>
  );
}
