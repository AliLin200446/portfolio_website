import Image from "next/image";
import latent from "@/content/cases/latent";
import {
  PageContainer, EditorialGrid, GridSpan, EditorialIntro, SectionHeader,
  MediaFrame, TextLink, Rule, editorialStyles as s,
} from "@/components/editorial/Editorial";
import HomeStations from "./HomeStations";

/** Server-rendered identity and proof; neither waits for the optional instruments. */
export default function HomeShell() {
  return (
    <PageContainer>
      <header className={`${s.stack} pb-[var(--space-l)]`}>
        <p className={s.label}>Ali Lin / Design Engineer</p>
        <Rule />
        <EditorialIntro split={6}
          primary={<h1 className={`${s.title} max-w-[28ch]`}>
            I build interfaces for things that are hard to see, measure, or control.
          </h1>}
          supporting={<div className={s.stack}>
            <p className={`${s.lead} max-w-[38ch]`}>
              Design Engineer working across visual computing, generative AI, and creative tools.
            </p>
            <div className="flex flex-wrap gap-x-[var(--space-l)] gap-y-[var(--space-s)]">
              <p className={s.meta}>New York / 2026</p>
              <div>
                <p className={s.label}>Currently</p>
                <p className={`${s.meta} mt-[var(--space-xs)]`}>AI Image Research @ Vision On</p>
              </div>
            </div>
          </div>}
        />
      </header>

      <section id="project-latent" aria-labelledby="latent-title" className={`${s.stack} scroll-mt-24`}>
        <SectionHeader title="Featured" index="01" aside={latent.meta.year} />
        <EditorialGrid>
          <GridSpan columns={6} tablet={3}>
            <h2 id="latent-title" className={s.title}>{latent.name}</h2>
            <p className={`${s.meta} mt-[var(--space-xs)]`}>Visual Computing / Graphics Engineering</p>
          </GridSpan>
          <GridSpan columns={6} tablet={3}>
            <p className={s.lead}>Real-time film physics for generative video.</p>
            <p className={`${s.meta} mt-[var(--space-xs)]`}>{latent.meta.stack}</p>
          </GridSpan>
        </EditorialGrid>
        {/* The existing recording awaits re-recording (content/heroes/latent.ts).
            Use the verified workbench still, uncropped, including its controls. */}
        <MediaFrame caption="LATENT / Calibration workbench. Reference film, engine output, and optical controls.">
          <Image
            src="/case-assets/latent/workbench.webp"
            alt="Latent's calibration workbench: a reference film scan with red halation around a subway light, the rendered video output, and controls for halation and export."
            width={1952} height={1066}
            sizes="(min-width: 1280px) 1184px, (min-width: 1024px) calc(100vw - 96px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 48px)"
            priority
            className="h-auto w-full"
          />
        </MediaFrame>
        <nav aria-label="Latent" className="flex flex-wrap gap-x-[var(--space-m)] gap-y-[var(--space-s)]">
          <TextLink href="/work/latent">CASE STUDY</TextLink>
          {latent.meta.live && <TextLink href={latent.meta.live}>OPEN LATENT</TextLink>}
        </nav>
      </section>

      <HomeStations />

      <nav aria-label="Contact" className="flex flex-wrap gap-x-[var(--space-m)] gap-y-[var(--space-s)] border-t border-line pt-[var(--space-m)]">
        <TextLink href="mailto:alilin406@outlook.com">alilin406@outlook.com</TextLink>
        <TextLink href="https://x.com/alilinlab" target="_blank">X</TextLink>
        <TextLink href="https://github.com/AliLin200446" target="_blank">GitHub</TextLink>
      </nav>
    </PageContainer>
  );
}
