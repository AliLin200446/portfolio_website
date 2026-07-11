import Link from "next/link";
import ShaderBackground from "@/components/ShaderBackground";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <main>
      {/* Hero: fullscreen shader with identity overlaid. */}
      <section className="relative flex h-svh flex-col justify-between overflow-hidden">
        <ShaderBackground />

        <header className="relative z-10 flex items-baseline justify-between px-6 py-6 font-mono text-xs text-muted">
          <span>Ali Lin</span>
          <Link href="/about" className="transition-colors hover:text-oxblood">
            About
          </Link>
        </header>

        <div className="relative z-10 px-6 pb-16">
          <h1 className="font-serif text-5xl leading-tight tracking-tight sm:text-7xl">
            Ali Lin
          </h1>
          <p className="mt-4 max-w-[40ch] font-serif text-xl italic text-ink sm:text-2xl">
            Design Engineer and Creative Technologist building digital
            experience and AI-driven visual systems.
          </p>
          <p className="mt-3 max-w-[52ch] text-sm text-muted">
            @NYU Interactive Media Arts
          </p>
        </div>
      </section>

      {/* Project index. */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-8 font-mono text-xs uppercase tracking-widest text-muted">
          Selected work
        </h2>
        <ol className="border-t border-line">
          {projects.map((project, i) => (
            <li key={project.slug} className="border-b border-line">
              <Link
                href={`/work/${project.slug}`}
                className="group grid grid-cols-[3ch_1fr] gap-x-6 gap-y-1 py-6 sm:grid-cols-[3ch_14rem_1fr_auto] sm:items-baseline"
              >
                <span className="font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-2xl decoration-oxblood decoration-1 underline-offset-4 group-hover:underline">
                  {project.title}
                </h3>
                <p className="col-start-2 text-sm text-muted sm:col-start-3">
                  {project.thesis}
                </p>
                <p className="col-start-2 font-mono text-xs text-muted sm:col-start-4 sm:text-right">
                  {[project.tags, project.status].filter(Boolean).join(" — ")}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
