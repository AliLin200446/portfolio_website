# ALILINLAB DESIGN SYSTEM

## Principle and identity

**System is rigid. Content is expressive.** Editorial publication × technical lab × visual instrument.
Keep paper warmth, Spectral, technical metadata, thin rules and archival precision. Photography, shaders, diagrams and tools supply variation. This is the canonical portfolio foundation for future work; older [design-system notes](design-system.md) retain case-specific rationale, not a migration checklist. The separate Skeletal Silk application has its own rules.

## Audit and migration boundary

The existing system already has a five-size type scale, three font families, a restrained palette, FolioChrome, Measure, data-driven CaseHero/CaseTemplate and accessible navigation with active routes, Escape and outside-click handling. It has no single layout contract: most page shells/navigation use 1024px, cases use 1268px with a sidebar, and the homepage uses an intentional full-viewport instrument layout. Photography has composed 12-column spreads; Experiments has three columns and a separate mobile list; About has a custom interactive diagram. Rules vary between 0.5px, 1px and tinted colors. Spacing follows Tailwind's 4px base but includes bespoke gaps and offsets. Case headings and diagrams have deliberate optical exceptions.

This foundation is opt-in. Only the Photography chapter-header pattern is migrated. Do not replace working page shells or interactive layouts in a foundation task. Existing animation, widths and legacy rules are not endorsements for new code. Migrate each page with its own visual review; when migrating global navigation/footer, align them to PageContainer in the same task. Do not put a new container inside an existing max-width shell.

Baseline verification at 390px found fixed 75px titles overflowing on Experiments and in the existing Teardown/Skeletal Silk case body. Those unchanged headings should adopt the responsive display role during their dedicated migrations. The new primitives fit down to 320px; do not conceal legacy overflow with a global overflow-x rule.

## Container and grid

Import primitives and `editorialStyles` from `@/components/editorial/Editorial`.

- `PageContainer`: centered, 100% width, **1280px maximum including padding**; gutters 24px mobile, 32px tablet, 48px desktop. At maximum width, media has 1184px available. No imposed vertical spacing or landmark.
- `EditorialGrid`: 2 logical columns below 640px, 6 from 640px, 12 from 1024px. Gaps 16px mobile / 24px larger; row gap 24px.
- `GridSpan`: desktop `columns={1…12}`, optional `tablet={1…6}`, `mobile={1|2}`. Defaults to full width at each breakpoint. Desktop spans never automatically become tiny mobile columns. Put GridSpan directly inside EditorialGrid.
- Prefer 4/8, 5/7, 6/6, 8/4 or four spans of 3. Tablet compositions must add to six. Use single-width mobile reading flow; paired mobile columns are for suitable small specimens, not prose.
- DOM order is reading order. Do not use CSS ordering to repair a desktop composition on mobile.

```tsx
<main>
  <PageContainer>
    <EditorialGrid>
      <GridSpan columns={4} tablet={2}>…</GridSpan>
      <GridSpan columns={8} tablet={4}>…</GridSpan>
    </EditorialGrid>
  </PageContainer>
</main>
```

## Typography

No new fonts. Spectral 400 is the editorial voice, Geist Sans is functional UI, Geist Mono 500 is metadata. Existing Spectral 500/600 remain available; the case instrument's 600-weight title is a deliberate exception.

| Role / exported CSS class | Size | Use |
| --- | --- | --- |
| `display` | fluid 34–75px | One page title; line height 1.05 |
| `title` | 34px | Major section opener |
| `lead` | 21px | Primary brief and important explanation |
| `body` | 15px | Supporting prose, line height 1.65 |
| `meta` | 11px | Mono facts and captions, line height 1.6 |
| `label` | 11px | Mono uppercase, 0.1em tracking, accessible bronze |

Label is a treatment of Meta, not a sixth size. Use existing `Measure` from FolioChrome for prose (68ch maximum); substantial case narratives may use Lead. Keep semantic h1/h2/h3 and p elements: CSS classes do not assign hierarchy. SVG labels belong to their coordinate system and require a separate legibility review. Do not blanket-resize diagrams.

## Spacing

| Token | Value | Meaning |
| --- | --- | --- |
| `--space-xs` | 8px | Label/value and caption relationships |
| `--space-s` | 16px | Related content; mobile column gap |
| `--space-m` | 24px | Component gap, desktop columns |
| `--space-l` | 48px | Section boundary |
| `--space-xl` | 64px | Major page transition |

Use `editorialStyles.stack` for a 24px stack. Page authors own section spacing; primitives avoid hidden outer margins. The 32px tablet gutter is a layout interpolation, not another general spacing step. Whitespace indicates hierarchy, never decorative emptiness.

## Colors and rules

Global semantic aliases preserve existing values:

| Token | Existing source | Use |
| --- | --- | --- |
| `--surface` | paper #f5f2ec | Background |
| `--text-primary` | ink #1a1714 | Text |
| `--text-muted` | muted #6b6459 | Secondary text |
| `--hairline` | line #e3ded4 | Quiet structural divisions |
| `--accent` | bronze-text #866339 | Small labels (4.87:1 on paper) |
| `--interactive` | oxblood #9a3b22 | Link hover |
| `--focus-ring` | bronze-text | Keyboard focus |

Keep bronze #8c6a3f for non-text details; its contrast on paper is below AA for small text. Wood remains restrained. Preserve the existing limit of one static cinnabar focal element per screen; don't introduce decorative colors.

`--rule-width: 1px` is the shared new-rule contract, matching the existing page and Photography boundaries. `Rule` renders a semantic hr, with no external margins. Use the same width/color tokens for component borders; don't insert an hr when a border is sufficient. Hairlines are grouping aids, never the sole indication of interactive controls.

## Components and recipes

All new primitives are server-compatible and require no client state.

- **Reuse** FolioBar/ColophonTail for archive navigation, Measure for prose, and CaseHero/CaseTemplate for existing instrument cases. Don't nest ProjectIntro above CaseHero or duplicate a page title. SectionNo remains available for legacy paragraph labels; SectionHeader is the semantic heading for new sections.
- **SectionHeader**: `title`, optional `index`, heading `id`, `level={2|3}`, `aside` for metadata/action and `rule="before"|"after"`. Default rule before; metadata wraps in DOM order. A containing section may use aria-labelledby pointing to id.
- **EditorialIntro**: `primary`, `supporting`, optional `split={4|5|6|8}` (default 5/7). Stacks in reading order on tablet/mobile; use the grid directly when a justified tablet composition needs explicit spans.
- **ProjectIntro**: compact future case introduction. `title`, optional `type`, `description` (what), `significance` (why), `role`, `stack`, `year`, `status`, and `media`. It reuses EditorialIntro and Measure; facts are a dl, omitted values disappear. Supply verified content only. Pass a MediaFrame as media. It owns the page h1; use once.
- **ExperimentGrid / ExperimentCell**: four equal cells desktop, two tablet, one mobile. Shared hairlines, padding and bottom-aligned captions; no card background, radius or shadow. Cell accepts `title`, optional `href` and `meta`, with media as children. Title is h3: place under an h2 section header. Only the title links, so embedded controls stay usable. Use a consistent MediaFrame ratio across an index for aligned visual slots; objects inside can differ.
- **TextLink**: Next Link props; internal →, external/scheme ↗. Arrows are hidden from assistive technology. External links stay in the same tab by default. If target is _blank, the component adds safe rel values and an accessible new-tab notice. Use meaningful link text. No filled CTA default.

```tsx
<EditorialIntro
  primary={<h1 className={editorialStyles.display}>Project title</h1>}
  supporting={<Measure><p className={editorialStyles.lead}>Project brief.</p></Measure>}
/>
<SectionHeader index="01" title="Experiments" aside="2026" />
<ExperimentGrid>
  <ExperimentCell title="Experiment name" href="/experiments/example" meta="WebGL / 2026">
    <MediaFrame aspectRatio="4 / 3">{/* dimensioned media */}</MediaFrame>
  </ExperimentCell>
</ExperimentGrid>
```

Examples describe composition, not new content or routes to publish.

## Media

`MediaFrame` renders figure, a media surface and optional figcaption. It adds no background, crop, radius, shadow or chrome. Direct img/video/canvas/svg children scale within available width. Natural dimensions are the default. Set `aspectRatio` to reserve space for live media or to contain an object inside a uniform specimen slot. Put it inside GridSpan for layout width.

Supply intrinsic image width/height (including Next Image), accurate sizes, descriptive alt, and video dimensions/poster. Use alt="" only for decorative media. Canvas/shader hosts own resizing, DPR, fallback content, keyboard controls and cleanup. Compound before/after tools own their internal layout and accessible controls. Do not crop project evidence or photography by default; explicit cropping requires a content reason. Supply video captions where speech carries information.

## Navigation and interaction

Current compact nav: Projects dropdown → existing case routes, Experiments, Photography, About. `/` is the projects index; there is no separate `/projects` route. Preserve active states, dropdown behavior, keyboard access, existing mobile wrapping and fixed-header clearance. A future Resume link should use TextLink's external convention only after a real destination exists. Do not invent that route now.

**Motion must explain the system or respond to user input.** Useful: parameter changes, scrubbers, measurements, interactive shaders. New foundation components have no animation. Future motion must honor prefers-reduced-motion with a stable usable state. Existing homepage reduced-motion/coarse-pointer fallback is intentional; retain it. Respect focus outlines, text contrast, heading order and native link semantics.

## Anti-patterns and future verification

No generic cards, SaaS pills, gratuitous rounded corners, random masonry, decorative gradients, arbitrary whitespace or entrance/parallax/page-transition animation. Don't use fine print for body copy or ship tiny mobile media to preserve desktop asymmetry.

For each future migration, inspect at desktop/tablet/mobile widths, long titles and metadata, keyboard focus, reduced motion and console errors. Check images reserve space. Run lint, TypeScript and build. Keep special instrument layouts unless their dedicated task authorizes a change.
