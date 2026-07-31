/*
 * FIELD NOTES. The six working notes from TEARDOWN № 1, transcribed
 * verbatim from the author's own report at teardown.alilinlab.com/notes
 * (bodies and every metric: value · label · source file:line · N ·
 * threshold). Division of labour with the case page's FINDINGS: the
 * findings are the CONCLUSIONS, these are the working notes that carry
 * the evidence behind them. One card, one question, its sources.
 * Nothing here is written by the site; numbers are the author's.
 */

export type NoteMetric = { value: string; label?: string; source: string };
export type FieldNote = {
  id: string;
  title: string;
  headline: string;
  body: string;
  metrics: NoteMetric[];
};

export const fieldNotes: FieldNote[] = [
  {
    id: "n01",
    title: "steps: quality curve flattens where?",
    headline: "7.655% vs 1.488%",
    body:
      "The sweep uses uneven spacing: 1, 2, 4, 8, 12, 16, 20, 28, 36, 45. Only two adjacent pairs span the same 8 steps, S20→S28 and S28→S36, which at 19.52 ms/step cost 156 ms each; the first moves 7.655% of pixels above Δ>32, the second 1.488%. A single step, S28→S29, already moves 1.291% at the same threshold against the same S28 anchor. The series is not monotonic: S16→S20 (11.92%, Δ>32) exceeds S8→S12 (6.694%, Δ>32), and S36→S45 (3.98%, Δ>32) exceeds S28→S36. Steps are a budget dial, and past 28 the eight steps you pay for return what one step has already delivered.",
    metrics: [
      { value: "1 · 2 · 4 · 8 · 12 · 16 · 20 · 28 · 36 · 45", label: "step ladder, N=1 per rung", source: "e4-latency/stats.md:26-35" },
      { value: "19.52 ms/step", label: "slope, inference vs steps, N=10", source: "e4-latency/stats.md:20" },
      { value: "7.655%", label: "S20→S28 px changed (Δ>32), N=1", source: "_tools/adjacent-diffs.txt:8" },
      { value: "1.488%", label: "S28→S36 px changed (Δ>32), N=1", source: "_tools/adjacent-diffs.txt:9" },
      { value: "1.291%", label: "S28→S29 px changed (Δ>32), N=1", source: "_tools/steps-28-29-diff.txt:8" },
      { value: "11.92%", label: "S16→S20 px changed (Δ>32), N=1", source: "_tools/adjacent-diffs.txt:7" },
      { value: "6.694%", label: "S8→S12 px changed (Δ>32), N=1", source: "_tools/adjacent-diffs.txt:5" },
      { value: "3.98%", label: "S36→S45 px changed (Δ>32), N=1", source: "_tools/adjacent-diffs.txt:10" },
    ],
  },
  {
    id: "n02",
    title: "guidance: prompt adherence vs artifact tradeoff",
    headline: "17.167% floor",
    body:
      "Across G1→G20 no adjacent pair falls below 17.167% changed pixels at Δ>32, and the last rung, G15→G20, still moves 57.591% at the same threshold. Inference time over the same sweep stays between 529.0 and 557.0 ms with steps fixed at 28. This sweep ran on a different prompt from the steps sweep, so the two percentage series are not directly comparable. Guidance never enters a band where the image stops responding, which makes 3.5 a choice rather than a convergence point.",
    metrics: [
      { value: "17.167%", label: "G3.5→G5, sweep minimum (Δ>32), N=1", source: "_tools/adjacent-diffs.txt:14" },
      { value: "57.591%", label: "G15→G20 px changed (Δ>32), N=1", source: "_tools/adjacent-diffs.txt:18" },
      { value: "529.0–557.0 ms", label: "inference range G1–G20, S28, N=8", source: "raw-calls.json[10..17].derived.inference_ms" },
      { value: "red silk draped over white bone structure, hard light", label: "e2 prompt, differs from e1, N=8", source: "raw-calls.json[10..17].params.prompt" },
    ],
  },
  {
    id: "n03",
    title: "latency anatomy, where the milliseconds live",
    headline: "277.0 ms vs 9.9 ms",
    body:
      "inference_ms is linear in steps at 19.52 ms/step, R² = 0.9978 over N=10, though the intercept is −5.0 ms and the fit breaks at the low end: steps=1 measured 31.9 ms against 24.5 ms at steps=2. At steps=28 over N=20 the p50 breakdown is inference 533 ms, queue 250.5 ms, network 0 ms. Standard deviations across the same run are queue 277.0 ms, inference 9.9 ms, and network 0.5 ms, and the first call sat 1500 ms in queue against 180 to 454 ms for calls 2 through 20. Steps add time to the segment the response body reports; the variance sits in the segment it does not, so a client measuring total time cannot attribute its own spread.",
    metrics: [
      { value: "19.52 ms/step", label: "linear-fit slope, N=10", source: "e4-latency/stats.md:20" },
      { value: "−5.0 ms", label: "fit intercept, N=10", source: "e4-latency/stats.md:21" },
      { value: "R² 0.9978", label: "fit quality, N=10", source: "e4-latency/stats.md:22" },
      { value: "31.9 / 24.5 ms", label: "inference, steps 1 vs 2, N=1 each", source: "e4-latency/stats.md:26-27" },
      { value: "533 / 250.5 / 0 ms", label: "p50 inf/queue/network, N=20 @S28", source: "e4-latency/stats.md:11-13" },
      { value: "277.0 / 9.9 / 0.5 ms", label: "std queue/inference/network, N=20", source: "e4-latency/stats.md:11-13" },
      { value: "1500 → 180–454 ms", label: "first-call queue vs 2–20, N=1/19", source: "e4-latency/stats.md:16" },
    ],
  },
  {
    id: "n04",
    title: "seed determinism: what it enables for production",
    headline: "0 / 262144",
    body:
      "Three calls at identical parameters returned inference times of 0.5451, 0.5468, and 0.5496 seconds and produced byte-identical files, sha256 8dadd968e921aca2, 0 of 262144 pixels differing. The three distinct inference times are consistent with recomputation and show no sign of a cache. Moving one step, 28 to 29, changes 73.084% of pixels at any Δ but 1.291% at Δ>32, with a single-channel maximum of 205/255. Changing seed changes 99.967% and 99.994% at any Δ. Determinism is binary and visible difference is not, so cache keys and reproducibility live at the byte layer while what a client notices lives at the amplitude layer.",
    metrics: [
      { value: "0.5451 / 0.5468 / 0.5496 s", label: "inference ×3, same params, N=3", source: "raw-calls.json[18..20].fal_timings.inference" },
      { value: "sha256 8dadd968e921aca2", label: "three files byte-identical, N=3", source: "e3-seed/report.txt:4" },
      { value: "0 / 262144", label: "pixels differing, all pairs, N=3", source: "e3-seed/report.txt:4" },
      { value: "≈1.9 min", label: "same hash across experiments, N=1", source: "e3-seed/report.txt:4" },
      { value: "73.084%", label: "S28→S29 changed pixels (any Δ), N=1 pair", source: "e3-seed/report.txt:5" },
      { value: "1.291% (3384/262144)", label: "S28→S29 px changed (Δ>32), N=1", source: "_tools/steps-28-29-diff.txt:8" },
      { value: "205/255", label: "max channel delta, N=1 pair", source: "_tools/steps-28-29-diff.txt:9" },
      { value: "99.967% / 99.994%", label: "different seeds (any Δ), N=2 pairs", source: "e3-seed/report.txt:6" },
    ],
  },
  {
    id: "n05",
    title: "DX friction: what the docs don't tell you",
    headline: "1 key of N",
    body:
      "The response body documents timings as required and types it as Timings, a type that is not defined; across 26 successful calls the field carried one key, inference. Queue time is not returned and must be derived client-side, and that derived segment holds std 277.0 ms against inference std 9.9 ms. num_inference_steps documents a default of 28 and no range; the ceiling of 50 appeared only in the error body after sending 999. Validation errors arrive as a Pydantic array and gateway errors as {error: string}, so the client parses two shapes. The one segment the API does not return is the one carrying the variance.",
    metrics: [
      { value: "26", label: "scripted ok calls, timings inspected", source: "e5-dx/friction-log.md #6" },
      { value: "1 key", label: "timings carried 1 key, 26/26", source: "e5-dx/friction-log.md #6" },
      { value: "277.0 / 9.9 ms", label: "std derived queue vs inference, N=20", source: "e4-latency/stats.md:11-12" },
      { value: "28", label: "documented num_inference_steps default", source: "e5-dx/friction-log.md #9" },
      { value: "50", label: "ceiling, disclosed only via error", source: "e5-dx/friction-log.md #9" },
      { value: "999", label: "sent value that triggered it, N=1", source: "raw-calls.json e5-err record" },
    ],
  },
  {
    id: "n06",
    title: "what I'd change: three concrete API design notes",
    headline: "3 changes",
    body:
      "01. Return the segments already measured. timings ships one key across 26 calls, and the segment it omits carries std 277.0 ms against inference std 9.9 ms. I would define Timings as queue, inference, total and populate all three. 02. Publish bounds in the schema. The steps ceiling of 50 is discoverable only by sending 999 and reading the error body. I would put min and max in the model schema. 03. Declare the image URL lifetime. The response ships a URL rather than bytes, archiving requires a second request, and no TTL is stated. I would add an expiry field.",
    metrics: [
      { value: "26", label: "calls where timings shipped 1 key", source: "e5-dx/friction-log.md #6" },
      { value: "277.0 / 9.9 ms", label: "std omitted vs reported segment, N=20", source: "e4-latency/stats.md:11-12" },
      { value: "50", label: "ceiling, discoverable only via error", source: "e5-dx/friction-log.md #9" },
      { value: "999", label: "the probe that disclosed it, N=1", source: "raw-calls.json e5-err record" },
    ],
  },
];
