import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  return {
    title: project?.title,
    description: project?.thesis,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6">
      <header className="flex items-baseline justify-between py-6 font-mono text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-oxblood">
          ← Index
        </Link>
        <span>Ali Lin</span>
      </header>

      {/* 1. Title and thesis */}
      <section className="py-10">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 max-w-[32ch] font-serif text-2xl italic leading-snug sm:text-3xl">
          {project.thesis}
        </p>
      </section>

      {/* 2. Media slot and demo link. Media height is capped so the demo
          link stays above the fold on common screens. */}
      <section>
        {/* video slot: replace this container's contents with a 30s screen
            recording, muted, loop, playsInline, plus a real poster image. */}
        <div
          className="flex aspect-video items-center justify-center border border-line bg-[#EDE9E0]"
          style={{ width: "min(100%, calc(52svh * 16 / 9))" }}
        >
          <span className="font-mono text-xs text-muted">
            {["video slot · 16:9 · 30s screen recording", project.mediaNote]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-4">
          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-oxblood px-5 py-3 font-mono text-sm text-paper transition-opacity hover:opacity-85"
            >
              Open live demo →
            </a>
          ) : (
            <span className="inline-block border border-line px-5 py-3 font-mono text-sm text-muted">
              {project.demoNote}
            </span>
          )}
        </div>
      </section>

      {/* 3. Metadata row */}
      <section className="mt-12 border-y border-line py-4">
        <dl className="flex flex-wrap gap-x-10 gap-y-2 font-mono text-xs">
          <Meta label="Role" value={project.role} />
          <Meta label="Type" value={project.type} />
          <Meta label="Stack" value={project.stack} />
          <Meta label="Year" value={project.year} />
        </dl>
      </section>

      {/* 4. Interaction */}
      <Section title="Interaction">
        {project.interaction.map((paragraph) => (
          <p key={paragraph} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ))}
        {project.interactionList && (
          <ul className="mt-6 space-y-2 font-mono text-sm text-muted">
            {project.interactionList.map((item) => (
              <li key={item} className="border-l border-oxblood pl-4">
                {item}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 5. Technical architecture */}
      <Section title="Technical architecture">
        {project.architecture.intro && (
          <p className="mb-6 leading-relaxed">{project.architecture.intro}</p>
        )}
        {project.architecture.points.length > 0 && (
          <ul className="space-y-2 font-mono text-sm text-muted">
            {project.architecture.points.map((point) => (
              <li key={point} className="border-l border-oxblood pl-4">
                {point}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 6. Forward-looking */}
      <Section title={`How I'd extend this at ${project.extend.company}`}>
        <p className="leading-relaxed">{project.extend.body}</p>
      </Section>

      <div className="pb-24" />
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-b border-line py-14 sm:grid-cols-[14rem_1fr]">
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
        {title}
      </h2>
      <div className="max-w-[68ch] text-[15px]">{children}</div>
    </section>
  );
}
