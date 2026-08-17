import type { CaseData } from "./_schema";

/*
 * TEARDOWN No 1: copy transcribed verbatim from the previous page.
 * Not one number, sentence or clause was rewritten; the only edits are
 * structural, and they are these three
 * - seven sections collapse to five (CLAIM / WHAT / HOW / FINDINGS /
 *     CONTEXT) to match Latent's rhythm
 *   - each FINDING keeps its opening sentence but the all-caps run-in
 *     becomes a short caps label with the sentence in normal case, so
 *     it can be read as a sentence again
 *   - findings sit beside their figure instead of stacking
 *
 * All four figures carry values confirmed against the live evidence
 * files, each of which now resolves at the path the figure prints
 * FIG A and FIG B from e4-latency/stats.md, FIG C from
 * _tools/adjacent-diffs.txt, FIG D from e3-seed/report.txt.
 */
const teardown: CaseData = {
  slug: "teardown",
  name: "TEARDOWN № 1",
  oneLine: "an instrumented teardown of a generative image API",
  meta: {
    type: "measurement harness + interactive report",
    stack: "TypeScript / React / fal API",
    year: "2026",
    status: "shipped",
    live: "https://teardown.alilinlab.com",
  },
  claim:
    "An API's documentation tells you what it returns. Only measurement tells you what it withholds.",
  hero: {
    kind: "instrument",
    component: "latency",
    caption:
      "where the milliseconds go · queue, the segment the API doesn't return, holds the variance · FIG A · p50 across N=20 at S28, 512×512",
    sourceHref: "https://teardown.alilinlab.com/evidence/e4-latency/stats.md",
    sourceLabel: "e4-latency/stats.md:11-13",
  },
  sections: {
    what: "AI image APIs ship faster than anyone measures them.",
    why: "Latency claims are marketing and the documentation leaves out what each setting costs. A benchmark answers which is better; a teardown answers what the API withholds.",
    how: {
      summary: [
        "48 hours on one model, fal-ai/flux/dev: 47 calls across five experiments, every measurement logged and traceable to a file and line.",
      ],
      phases: [
        {
          title: "Phase 1 \u00b7 What the docs do not answer",
          body: [
            "Three questions an integrator cannot answer from the docs.",
          ],
          figure: {
            kind: "code",
            code: `QUESTION      WHAT THE DOCS SAY             WHAT MEASUREMENT SHOWED
time          one timing field, inference   queue, from request sent to model
                                            start, is derived client-side
steps         default 28, no range          past 28 a step buys almost nothing
determinism   assumed, never stated         one sha256, 0 of 262,144 pixels`,
            caption:
              "the three questions, and what the wire answered \u00b7 the rows map onto findings 1, 3 and 2",
          },
        },
        {
          title: "Phase 2 \u00b7 The harness",
          body: [
            "A browser harness makes live calls and logs every one to a structured record.",
            "Pixel diff runs at two thresholds, any \u0394 and \u0394>32 of 255, because how many pixels changed and how many changed visibly are different questions.",
          ],
        },
        {
          title: "Phase 3 \u00b7 The five experiments",
          body: [
            "The docs and the wire disagree: Timings is typed but never defined, and the steps ceiling of 50 is found only by sending 999.",
          ],
          /* Five rows. The expspace figure holds this phase's figure
             slot, so these are mono lines rather than an aligned block,
             following the Latent precedent. */
          data: [
            "experiment | what varied | N | observable",
            "steps sweep | steps 1 to 45 | 10 rungs | pixels changed per rung",
            "guidance sweep | guidance 1 to 20 | 8 rungs | pixels changed per rung",
            "seed determinism | nothing | 3 identical calls | byte comparison",
            "latency series | nothing | N=20 | queue, inference, network",
            "friction log | the documentation | every gap | docs against the wire",
          ],
          figure: {
            kind: "instrument",
            component: "expspace",
            caption:
              "the five experiments placed where they were taken \u00b7 drag to turn the volume, select one to isolate it \u00b7 the friction log has no coordinate, so it shows as the volume itself",
          },
        },
        {
          title: "Phase 4 \u00b7 The fit",
          body: [
            "Inference time against steps, ten rungs, with the residual given twice so the caption below can be checked rather than taken.",
          ],
          figure: {
            kind: "instrument",
            component: "stepfit",
            caption: [
              "FIG B \u00b7 ten measured points, 1 to 45 steps \u00b7 linear fit y = 19.52x \u2212 5.0, R\u00b2 0.9978",
              "\u0394 from fit given twice: absolute ms, and as a share of the measured value",
              "below S8 the fit misses by 17 to 55 percent of the measurement",
              "from S8 up it holds within 5 percent",
              "R\u00b2 is carried by the high rungs. The low rungs are not described by this line.",
            ],
            sourceHref: "https://teardown.alilinlab.com/evidence/e4-latency/stats.md",
            sourceLabel: "e4-latency/stats.md:20-35",
          },
        },
      ],
    },
  },
  proofLabel: "EVIDENCE",
  proofSplit: true,
  proof: {
    items: [
      {
        label: "THE HIDDEN SEGMENT",
        claim:
          "The variance lives in the segment the API does not return. inference_ms is linear from the mid rungs up: 19.52 ms/step, R² = 0.9978 across ten rungs, though the low rungs scatter and the global fit smooths that over. Std is 9.9 ms across N=20. Queue std is 277.0 ms, and queue is the one segment absent from the response body. A client measuring total time cannot attribute its own spread.",
        /* Widened. The old 11-13, 20-22 carried the two std figures,
           the slope and R2 but not: N=20 (line 3), the queue_ms
           derivation that makes "absent from the response body" true
           (line 6), or the measured-vs-fitted table the scatter caveat
           rests on (24-35). 18-35 is one line wider than FIG B's 20-35
           so the fit's own N and data source come with it. */
        source: "e4-latency/stats.md:3-13, 18-35",
        figure: {
          kind: "instrument",
          component: "latency",
          caption:
            "FIG A · inference 533 ms · queue 250.5 ms, drawn dashed because the API does not return it · network 0 ms",
          sourceHref: "https://teardown.alilinlab.com/evidence/e4-latency/stats.md",
          sourceLabel: "e4-latency/stats.md:11-13",
        },
      },
      {
        label: "IDENTICAL BYTES",
        claim:
          "Three identical calls, identical bytes. Same parameters, three runs, three distinct inference times (545 / 547 / 550 ms, real recomputation rather than a cache), one sha256. 0 of 262,144 pixels differ. Output is addressable by parameter tuple.",
        /* The timings array carries the three durations and nothing
           else. The sha256 and the 0/262,144 figure are both on line 4
           of the seed report, which figure.sourceHref already points
           at; the claim beneath now cites it too. */
        source:
          "raw-calls.json[18..20].fal_timings.inference \u00b7 e3-seed/report.txt:4 for the sha256 and the pixel diff",
        figure: {
          kind: "instrument",
          component: "seed",
          caption:
            "FIG D · three runs, one sha256 (8dadd968e921aca2…), 0 of 262,144 pixels differing · run at 512×512, as is the latency series, so 262,144 is simply 512 squared",
          sourceHref: "https://teardown.alilinlab.com/evidence/e3-seed/report.txt",
          sourceLabel: "e3-seed/report.txt",
        },
      },
      {
        label: "PAST 28",
        claim:
          "Past 28, eight steps buy what one step already delivered. S20\u2192S28 and S28\u2192S36 each span 8 steps; the fit puts both at 156 ms, but measured they are 151.4 and 191.4, so the spans are equal only on the line. The first moves 7.655% of pixels (\u0394>32); the second, 1.488%. A single step, S28\u2192S29, already moves 1.291% at the same threshold.",
        /* 156 ms is in no evidence file as a literal: it is 8 x the
           19.52 ms/step slope. The claim now states the measured spans
           and names the fitted one as the fit, so the citation points
           at both columns of the same three rows. */
        source:
          "_tools/adjacent-diffs.txt:8-9 \u00b7 _tools/steps-28-29-diff.txt:8 \u00b7 e4-latency/stats.md:32-34 measured, :20 fitted",
        figure: {
          kind: "instrument",
          component: "stepdelta",
          caption:
            "FIG C · all nine adjacent step pairs, pixels changed at Δ>32 · N=1 per pair · the heaviest work is early, at S4→S8",
          sourceHref: "https://teardown.alilinlab.com/evidence/_tools/adjacent-diffs.txt",
          sourceLabel: "_tools/adjacent-diffs.txt",
        },
      },
      {
        label: "NO RESTING POINT",
        claim:
          "Guidance has no resting point. Across G1→G20 no adjacent pair falls below 17.167% changed pixels (Δ>32); the last rung still moves 57.591%. The default of 3.5 is a choice, not a convergence point.",
        /* The claim is a universal quantifier over every adjacent
           guidance pair, so it needs every row, not the two it quotes.
           :14 and :18 give the minimum and the last rung but cannot
           establish that nothing is lower. 12-18 is the whole G range,
           and is what the FindingsFrame chart already cites. */
        source: "_tools/adjacent-diffs.txt:12-18",
      },
    ],
    limits: [
      "N=1 per rung, single region, single day, no residual-to-reference series, so no convergence claim is made.",
      "Each finding closes with a build note on the page: cache on the parameter tuple, budget steps before anything else, size timeouts from the segment you have to time yourself.",
    ],
  },
  coda: "TEARDOWN \u2116 1 is the first in a series. The method, sweep and diff and time and log and publish with sources, ports to any inference API. The findings do not: they are one model, measured.",
  byline: "Ali Lin",
  next: { label: "VESTIGE", href: "/work/vestige" },
};
export default teardown;
