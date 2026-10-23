import { cacu } from "@/content/projects/cacu";

export default function ClientWork() {
  return (
    <section aria-label="Client work">
      <h2 className="border-b border-line pb-3 font-mono font-medium text-[length:var(--text-meta)] tracking-wide text-muted">CLIENT WORK</h2>
      <div className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
        <div>
          <h3 className="font-serif text-[length:var(--text-lead)] leading-snug">{cacu.label}</h3>
          <p className="mt-2 font-mono text-[length:var(--text-meta)] text-muted">Web Design + Development · {cacu.year}</p>
        </div>
        <a href={cacu.liveHref} target="_blank" rel="noreferrer" className="w-fit font-mono text-[length:var(--text-meta)] text-muted transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">OPEN SITE ↗</a>
      </div>
    </section>
  );
}
