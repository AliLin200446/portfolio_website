# alilinlab.com — interaction system

Drop-in CSS + React (Next.js App Router, TypeScript). No dependencies beyond `next` / `react`.

```
styles/tokens.css          tokens, focus ring, reduced-motion
styles/interactions.css    every pattern below (opt-in by class)
lib/motion.ts              shared helpers
lib/useListNav.ts          13a  J / K
components/Tabs.tsx        01   sliding ink tabs
components/CropFrame.tsx   04   crop marks
components/Develop.tsx     05   film "develop" on first view
components/Readout.tsx     06   cursor readout + NYC clock
components/CopyEmail.tsx   07   copy feedback
components/ViewTransitions.tsx  08  row title → case-study title
components/InspectMode.tsx 09+11  G: grid + redlines
components/TickUp.tsx      12   one-time count-up
components/CommandMenu.tsx 13b  ⌘K
```

Patterns 02 (sibling dim) and 03 (arrow nudge) are CSS only.

## Wire it up — `app/layout.tsx`

```tsx
import '@/interaction/styles/tokens.css';
import '@/interaction/styles/interactions.css';
import { InspectMode } from '@/interaction/components/InspectMode';
import { ViewTransitionResolver } from '@/interaction/components/ViewTransitions';
import { CommandMenu, defaultCommands } from '@/interaction/components/CommandMenu';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <InspectMode maxWidth={1344} columns={12} gutter={24} margin={48}>
          {children}
        </InspectMode>
        <ViewTransitionResolver />
        <CommandMenu commands={defaultCommands} />
      </body>
    </html>
  );
}
```

## Header

```tsx
import { Tabs } from '@/interaction/components/Tabs';
import { InspectToggle } from '@/interaction/components/InspectMode';

<header>
  <Tabs items={[
    { href: '/', label: 'PROJECTS' },
    { href: '/experiments', label: 'EXPERIMENTS' },
    { href: '/generative', label: 'GENERATIVE' },
    { href: '/photography', label: 'PHOTOGRAPHY' },
    { href: '/about', label: 'ABOUT' },
  ]} />
  <InspectToggle />
</header>
```
If PROJECTS lives at `/`, pass `href: '/work'` for matching and link the logo to `/`,
or adjust the `findIndex` match in `Tabs.tsx`.

## Projects list (02 dim · 03 nudge · 01 ink row · 08 morph · 13a J/K)

```tsx
'use client';
import { TransitionLink, vtName } from '@/interaction/components/ViewTransitions';
import { useListNav } from '@/interaction/lib/useListNav';

export function ProjectList({ projects }) {
  useListNav();                                   // J / K
  return (
    <div className="dim-group">
      {projects.map((p) => (
        <TransitionLink key={p.slug} href={`/work/${p.slug}`}
          className="ink-row dim-item" data-nav-item>
          <h2 style={{ viewTransitionName: vtName(p.slug) }}>{p.title}</h2>
          <span>Open case <span className="nudge nudge--r">→</span></span>
        </TransitionLink>
      ))}
    </div>
  );
}
```
On `/work/[slug]/page.tsx`, give the big title the same name:
`<h1 style={{ viewTransitionName: vtName(slug) }}>Latent</h1>`.
Each name must be unique on a page.

## Images (04 crop · 05 develop)

```tsx
<CropFrame label="Pl. 03 · 3:2 · 35mm">
  <Develop>
    <Image src={src} alt="…" width={1500} height={1000} />
  </Develop>
</CropFrame>
```

## Numbers (06 · 12)

```tsx
<NYClock />                                    // header
<CursorReadout><LatentCanvas /></CursorReadout> // demos only
<TickUp value={60} suffix=" fps" />             // real measurements only
<TickUp value={4.2} decimals={1} suffix=" ms" />
```

## Rules

- Max travel 6px. One moving thing at a time.
- Motion answers the visitor; only page-entry reveals play unasked, once.
- Hover and `:focus-visible` look the same.
- `prefers-reduced-motion`: color + opacity only (handled in `tokens.css`).
- Never: parallax, magnetic cursor, cursor trails, scroll hijack, text scramble, 3D page flips.

## Notes

- View Transitions: Chromium and Safari 18+. Elsewhere `TransitionLink` is a normal link.
- `:has()` (keyboard dim) needs Safari 15.4+ / Chrome 105+; hover dim works everywhere.
- Single-key shortcuts (G, J, K) are ignored while typing in inputs.
