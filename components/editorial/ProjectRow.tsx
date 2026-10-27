import type { ReactNode } from "react";

/** Shared editorial row geometry and hover/focus treatment. */
export default function ProjectRow({ id, className = "", children }: { id: string; className?: string; children: ReactNode }) {
  return <article className={`project-band${className ? ` ${className}` : ""}`} id={id} aria-labelledby={`${id}-title`} tabIndex={-1}>{children}</article>;
}
