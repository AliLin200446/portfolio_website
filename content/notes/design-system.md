# Design system notes

> **There is a second design system file.**
> `/Users/alilin/Applications/Skeletal_Silk/STYLE.md` sets house rules
> for the Skeletal Silk repo: palette, one-thing-shouts-per-screen, and
> a 9px readability floor. Neither file is authoritative over the
> other, and deciding which one is comes before any attempt to
> reconcile them. Until then, treat this file as governing the
> portfolio only. See Open.


Material moved off the case pages. It describes how a page or a report
is put together, which is a subject of its own and belongs on the
design system page when that exists. It is parked here rather than
deleted.

## TEARDOWN No 1, the layout

The report is laid out as an engineering desktop: a ruled notebook
ground, opaque paper surfaces, and the API itself rendered as a node
graph: inputs wired into the model, the model wired into its results.
The teardown convention is literal: every part pulled out, labelled,
and measured, with the latency anatomy drawn inside the model node
where the call actually happens.

## Type scale

Five sizes, three weights. Defined once in `app/globals.css` under
`@theme` and referenced as `text-[length:var(--text-*)]`, so a
component names a level rather than a number.

    level    px  weight  what it carries
    display  75  600     the page's own name, one per page
    title    34  400     section openers
    lead     21  400     the brief, and the Solution quadrant
    body     15  400     ordinary prose
    meta     11  500     labels, data, captions, everything mono

There were seventeen sizes and two weights before this. Seventeen steps
is a gradient, not a hierarchy, and a gradient has no levels: at a
quarter scale the four hero quadrants were four identical grey
rectangles, so the one holding the conclusion could not be told from
the one holding the problem.

The weights are measured, not chosen. Spectral ships static faces at
400, 500 and 600 only; asking for 300 renders the 400 face at identical
ink coverage, so a 300 here would have been a weight that changes
nothing. Geist Sans and Geist Mono are variable across 100-900. Nothing
is synthesised. Advance width proves nothing for a monospace, so this
was measured as canvas ink coverage rather than as text width.

The hero h1 sits at 600 while every other h1 sits at 400. That
divergence is deliberate and predates the scale. Do not reconcile them.

### SVG is exempt, deliberately

Chart labels live at 7 to 10px inside their own viewBox, hand-positioned
against bars and axis ticks. A chart is a self-contained coordinate
system, so the document type scale does not reach into it. Raising those
labels is a per-chart re-layout, not a resize: they would collide. If
you came here looking for why the figures do not follow the five sizes,
this is why.

### The Solution slot

SOLUTION says what was built. It is not the WHY: PROBLEM has already
carried half the why, and a reader does not need it twice on one
screen. That is also why no guard compares SOLUTION to the case page's
WHY, while `scripts/check-hero-drift.mjs` does compare PROBLEM to WHAT.

**Three lines is a hard cap, and the binding width is 1440**, where the
quadrant column measures 277px and the slot is set at lead, 21px. About
72 characters. 768 collapses the hero to one 643px column and fits
anything in two, so it never binds. Past three lines the extra size
reads as crowding rather than emphasis, which loses the only thing the
level was bought for.

Over the cap, rewrite the copy. Do not reduce the size: dropping
SOLUTION back to body is what made the quadrants indistinguishable in
the first place.

Measured at 1440, in the real column:

    latent           80 chars  3 lines
    teardown         59 chars  3 lines
    skeletal-silk    70 chars  3 lines
    material-memory  76 chars  3 lines
    vestige          66 chars  3 lines

Character count is a guide, not the rule. material-memory fits at 76
and an earlier draft did not fit at 95, but where a line breaks depends
on word lengths, so the only real test is to measure the rendered line
count in the 277px column. Treat 70 as "probably fine" and anything
past 80 as "measure it".

## Open

- **SVG chart labels: a correctness issue, not a consistency one.**
  Chart labels in teardown sit at 7px and 8px, below the 9px
  readability floor established by a typography audit in the Skeletal
  Silk repo's STYLE.md. This is a correctness issue, not a consistency
  one. 383 words across three figures, needing per-chart re-layout
  because labels are hand-positioned against bars and ticks. Not a
  scale change.

- **Two design system files, not aligned.** This file and
  `/Users/alilin/Applications/Skeletal_Silk/STYLE.md` both set house
  rules. Each now names the other, which is the whole of what has been
  done; they are NOT merged and should not be until the first decision
  is made, which is **which of the two is authoritative**. Everything
  else follows from that answer and nothing can be reconciled before
  it. That repo's STYLE.md carries the palette, the one-thing-shouts
  rule, and the 9px readability floor.

  It was already recorded on the other side: Skeletal Silk's STYLE.md
  has carried "Reconcile with the portfolio STYLE file ... decide which
  is canonical first" in its own Open section. What was missing was
  this half. A note living in one of the two repos is invisible from
  the other, which is the repo that needed it. That entry also points
  at a "portfolio STYLE file", and no file by that name exists here;
  the portfolio's rules live in this file.
