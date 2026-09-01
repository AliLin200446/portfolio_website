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
  sections: {
    what: "Teardown is a measurement study of a hosted inference API (fal.ai's flux endpoint) instrumented from a browser the way an integrator would hit it.",
    who: [
      "Anyone who has waited for a generation and wondered what the wait was made of.",
      "Anyone building on one of these APIs, who has to pick a default and cannot pick it from the documentation.",
    ],
    why: "A benchmark answers which model is better. Nobody was measuring what happens inside the one you already chose.",
    /* METHODS rather than HOW. The old section was four folded phases
     * describing how the harness was built; this is the five things it
     * ran and the question each one answers, which is what a study's
     * method actually is. */
    methods: {
      label: "METHODS",
      lead: "5 experiments",
      items: [
        { name: "Step sweep", question: "what does another step cost, and what does it buy" },
        { name: "Guidance sweep", question: "is the second knob the same kind of knob" },
        { name: "Seed determinism", question: "do identical parameters return identical bytes" },
        { name: "Latency series", question: "where the waiting actually goes" },
        { name: "Friction log", question: "how far the documentation sits from the wire" },
      ],
    },
    findings: {
      label: "FINDINGS",
      items: [
        {
          name: "The hidden segment",
          body: "Queue sd 277 ms against inference sd 9.9. The segment carrying nearly all the variance is the one the response body never returns.",
        },
        {
          name: "Identical bytes",
          body: "Three runs, three different inference times, one sha256, zero of 262,144 pixels different. Determinism holds and the documentation never says so.",
        },
        {
          name: "Past 28",
          body: "S20 to S28 moves 7.655 percent of pixels. The next eight steps move 1.488.",
        },
        {
          name: "No resting point",
          body: "No adjacent guidance pair falls below 17.167 percent, and the last rung still moves 57.591. It never converges.",
        },
      ],
    },
  },
  coda: "TEARDOWN \u2116 1 is the first in a series. The method, sweep and diff and time and log and publish with sources, ports to any inference API. The findings do not: they are one model, measured.",
  byline: "Ali Lin",
  next: { label: "VESTIGE", href: "/work/vestige" },
};
export default teardown;
