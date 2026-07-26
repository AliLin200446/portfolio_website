import type { CaseData } from "./_schema";

/*
 * LATENT — copy supplied by the author, verbatim.
 *
 * DISCLOSURE BOUNDARY (binding): the halation numbers and the spectral
 * FINDINGS are cleared for publication. The b₂ FIT DOMAIN and the exact
 * rmsK2 values are NOT cleared — pending Vestige claim review — so they
 * render as PENDING-IP chips and appear nowhere in this file. No number
 * below comes from anywhere but the author's copy.
 */
const latent: CaseData = {
  slug: "latent",
  name: "LATENT",
  oneLine:
    "a film-emulation engine that puts measured film physics onto frames that never passed through a camera",
  meta: {
    type: "film physics engine",
    stack: "WebGL2 / GLSL",
    year: "2026",
    status: "shipped",
    live: "https://latentfilm.com",
  },
  claim: "“Filmic” can be measured.",
  hero: {
    kind: "instrument",
    component: "halation",
    caption:
      "CineStill 800T emulation · WebGL2, 30fps · calibrated against my own scans · halation radius, live — drag to compare",
  },
  what: [
    "A WebGL2 engine that renders film physics onto AI-generated frames — for footage that was never shot on film, and shows it. Each frame runs a GLSL pipeline: spectral response, then halation, then grain. Every stage is calibrated against CineStill 800T I shot, developed, and scanned myself.",
    "Film emulation usually means a LUT and a grain overlay — a look, applied. Latent treats the look as physics: light scattering in an emulsion, dye-layer crosstalk, grain that clumps by luminance. The difference is that every parameter traces to a negative I can hold up, not to a preset I liked.",
  ],
  whatFigure: {
    kind: "code",
    code: "input → spectral response → halation → grain → output",
    caption: "GLSL pipeline · three physical stages · calibrated per stage",
  },
  build: [
    {
      heading: "HALATION, READ OFF THE NEGATIVE",
      body: "Halation is the red-orange bloom around clipped highlights — light scattering back through the emulsion. I didn't tune it by eye. I sampled the bloom along every clipped edge on my own 800T scans, tracking how much slower the red channel falls off than green and blue. The distance where the red-blue difference decays below threshold is the radius.",
      data: "radius 4.9px ≈ 0.02 normalized · threshold 0.78 · tint (1.0, 0.4, 0.12) · intensity 0.25 — every number pulled off film, none fit to a curve",
      figure: {
        kind: "image",
        src: "/case-assets/latent/exhibit-01-halation.png",
        width: 1379,
        height: 844,
        selfCaptioned: true,
        caption:
          "EXHIBIT 01 · CineStill 800T · halation radius measured off negatives",
        attribution: "EXHIBIT 01 · measured off my own CineStill 800T negatives",
      },
    },
    {
      heading: "THE DETECTOR, RUN BACKWARDS",
      body: "Forensics researchers flag AI images by the slope of their radial power spectrum: natural images sit near a k⁻² falloff, generated frames fall steeper. I built the same analyzer — not to detect, but to aim. It reads where a frame's spectrum sits and pushes it toward where real film lives.",
      body2:
        "Then measuring my own scans complicated the target, in a way worth keeping. Real 800T doesn't rest on the k⁻² line either — and its reading swings with content and framing. Across crops of the same negative the spectral energy ranges nearly fourfold. Film refuses to be one number. So the engine's target was never “hit −2.” It moves footage from where it sits toward a region real film occupies — a region, not a line.",
      // CHIPS LIFTED: exhibit-02 publishes these values in the figure
      // itself, so holding them back in the text would contradict the
      // image on the same page. Both values are read off the plot —
      // the domain from its x-axis, the spread from its footnote.
      data: "three hand-scanned 800T frames · spectral slope fit over k = 2–128 cycles across a 256 px native patch · b₂ = −3.19 / −0.95 / −3.25 · reading swings ~4× across crops of one negative",
      note: "scans delivered as JPEG; DCT quantization thins the mid-frequency tail, so any absolute reading reflects film through this delivery chain, not the emulsion itself",
      figure: {
        kind: "image",
        src: "/case-assets/latent/exhibit-02-spectral.png",
        width: 1600,
        height: 1080,
        selfCaptioned: true,
        caption:
          "EXHIBIT 02 · radial power spectrum · real film vs engine output",
        attribution:
          "EXHIBIT 02 · measured 2026-07-26 on the shipping implementation",
      },
    },
  ],
  proofLabel: "FINDINGS",
  proof: {
    items: [
      {
        claim:
          "HALATION RADIUS measured off my own 800T negatives: 4.9px, ≈0.02 normalized to frame width. Threshold and red-bias tuned to match the scans, not fitted to a curve. Spatial physics, read off film.",
      },
      {
        claim:
          "REAL FILM REFUSES TO BE ONE NUMBER. Across crops of my own hand-scanned 800T, not one lands on the k⁻² line forensics researchers call “natural,” and the readings swing with content and framing. So the engine never chased −2. It moves AI footage from where it sits toward where real film actually lives: a region, not a line.",
        source:
          "36 crops across the same three negatives span b₂ −0.49 … −3.40 (exhibit 02)",
      },
      {
        claim:
          "EMULATION AS PHYSICS, NOT PRESET. Halation, grain, dye crosstalk, highlight roll-off — each is simulated from a measured cause, not applied as a filter. The look is the output of the physics, not a layer on top.",
      },
    ],
    limits: [],
  },
  context:
    "Latent is one instrument in a larger practice: I build tools that measure what generative models actually do, rather than decorate their output. The spectral analyzer here is the same idea as Teardown № 1 — take the math built to detect machines, and turn it into something that measures or repairs. The crop-sensitivity finding above is its own open thread: what I took for film's spectral fingerprint turned out to be my framing's.",
  byline: "Ali Lin — design engineer",
  next: { label: "TEARDOWN № 1", href: "/work/teardown" },
};
export default latent;
