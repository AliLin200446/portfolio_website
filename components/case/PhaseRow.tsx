"use client";

import { useState } from "react";

/*
 * One foldable phase row.
 *
 * This exists only because React 19 will not leave a server-rendered
 * `open` attribute alone. The markup ships with open="" on the first
 * row, which is what a reader with no JS gets and what a crawler
 * reads, and hydration then strips it. suppressHydrationWarning does
 * not stop it. So the open state is owned here instead.
 *
 * The children are server-rendered and passed through, so none of the
 * phase copy or its figures enter the client bundle: this component
 * carries the summary row and a boolean, nothing else.
 *
 * It stays a real <details>. Tab reaches the summary, Enter and Space
 * toggle it, the focus ring is the site's amber, and the body is in
 * the DOM whether the row is open or shut, which is what find-in-page,
 * crawlers and check-claims all depend on. onToggle only mirrors what
 * the browser already did, so the element is never fought with.
 */
export default function PhaseRow({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group border-t border-line last:border-b"
      style={{ borderTopWidth: "0.5px" }}
    >
      <summary className="flex cursor-pointer list-none items-baseline gap-3 py-5 font-mono text-sm uppercase tracking-widest text-ink outline-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]">
        <span aria-hidden className="text-bronze-text">
          {open ? String.fromCharCode(8211) : "+"}
        </span>
        {title}
      </summary>
      <div className="pb-10">{children}</div>
    </details>
  );
}
