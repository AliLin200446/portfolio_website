/**
 * Per-stock parameter sets. Plain JSON-serializable data only, so stocks can
 * be exported from the calibration workbench, diffed, and pasted back here
 * verbatim — a FilmStock is the COMPLETE recipe (structure + strengths).
 *
 * Calibration guide:
 *   PHYSICS — structure/pivots derived from film physics or the Kodak
 *   Vision3 500T datasheet; refine against measurement, don't re-invent.
 *   TASTE — no ground truth in a datasheet; calibrate visually against
 *   real 800T scans.
 */
export interface FilmStock {
  name: string;
  // -- halation --
  halationThreshold: number;
  halationRadius: number;
  halationIntensity: number;
  /** halation glow spectrum: red-layer re-exposure through the base (PHYSICS) */
  halationTint: [number, number, number];
  // -- irradiation (research doc item 3 + 800T table item 9: missing remjet amplifies in-emulsion scatter) --
  /** PHYSICS: short-range scatter radius, ~1/5 of halation (same units as halationRadius) */
  irradiationRadius: number;
  /** PHYSICS: medium by default on 800T — the other half of why its highlights aren't sharp */
  irradiationIntensity: number;
  // -- dye-layer crosstalk --
  /**
   * Row-major; rows = (R, G, B) layer response to scene (R, G, B) light.
   * Each row sums to 1 so neutrals stay neutral — any color cast belongs to
   * the zonal tints, not here.
   */
  crosstalk: [
    number, number, number,
    number, number, number,
    number, number, number,
  ];
  crosstalkAmount: number;
  // -- characteristic curve --
  /** pivots are PHYSICS (from the Vision3 500T curve shape); strengths are
   *  the fit of our analytic form to it (calibration) */
  toeStrength: number;
  toePoint: number;
  shoulderStrength: number;
  shoulderPoint: number;
  // -- zonal tints (TASTE — the most calibration-sensitive numbers here) --
  shadowTint: [number, number, number];
  shadowTintAmount: number;
  highlightTint: [number, number, number];
  highlightTintAmount: number;
  /** three-band toning: independent midtone tint (look-family doc appendix —
   *  mixed-light contamination lives in the mids). Neutral [1,1,1] + amount 0
   *  is a mathematical identity, so stocks and exported JSONs from before
   *  this field load byte-identical via the factory-merge fallback. */
  midTint: [number, number, number];
  midTintAmount: number;
  /** perceptual-luma center/width of the shadow↔highlight blend */
  tintCenter: number;
  tintWidth: number;
  // -- grain (silver-halide crystal development, applied at chain tail) --
  /** TASTE: overall strength (multiplicative density perturbation) */
  grainIntensity: number;
  /** PHYSICS×TASTE: grain feature size in virtual-1080p pixels */
  grainSize: number;
  /** PHYSICS: midpoint of the density-visibility sigmoid (granularity rises
   *  monotonically with density, soft-saturating — the σD–D relation, research
   *  doc item 1) */
  grainExposureBias: number;
  /** PHYSICS: sigmoid transition width */
  grainExposureWidth: number;
  /** TASTE: shared base field vs per-layer independent fields;
   *  channel correlation = (1-c)²/((1-c)²+c²), 0.63 → ≈25% (spec window 20-30%) */
  grainChromaRatio: number;
  /** PHYSICS: coarse-field size multiplier for shadows (under-exposed areas develop chunkier clumps) */
  grainShadowSizeBoost: number;
  /** PHYSICS: per-dye-layer RMS amplitude, blue-sensitive layer coarsest (doc appendix: B×1.8 G×1.2 R×1.0) */
  grainChannelBalance: [number, number, number];
  /** TASTE: noise basis — false = cell white noise, true = narrow-band; pick by eye */
  grainNarrowband: boolean;
  // -- highlight desaturation (research doc item 6) --
  /** TASTE: perceptual luma where desaturation begins */
  desatStart: number;
  /** TASTE: desaturation strength at the white point */
  desatStrength: number;
  // -- base fog (research doc item 11; scan-chain, accounted separately from emulsion params) --
  /** TASTE: black-point lift (linear domain) */
  fogAmount: number;
  /** TASTE: black-point cast direction; 800T scans commonly lean cyan-green */
  fogTint: [number, number, number];
  // -- gate weave (research doc item 7; mechanical transport, applied at first sampling) --
  /** TASTE: displacement RMS as a fraction of frame height (default 0.1%, range 0-0.3%) */
  weaveAmount: number;
  /** PHYSICS: dominant random-walk frequency in Hz (0.5-3; white jitter is forbidden by spec) */
  weaveSpeed: number;
}

/**
 * Live slider state. Strength values mirror FilmStock fields (see
 * paramsFromStock / stockFromParams); the enable flags are A/B workbench
 * state, not stock identity, and are never exported.
 */
export interface LatentParams {
  /** global "de-AI amount" master: 0 = byte-exact identity, 1 = calibrated
   *  stock, >1 exaggerated. Applied as a lerp on every strength field at the
   *  uniform level (renderer), never persisted into FilmStock exports. */
  engineStrength: number;
  threshold: number;
  radius: number;
  intensity: number;
  irradiationRadius: number;
  irradiationIntensity: number;
  crosstalk: number;
  toe: number;
  shoulder: number;
  shadowTintAmount: number;
  highlightTintAmount: number;
  midTintAmount: number;
  grainIntensity: number;
  grainSize: number;
  grainExposureBias: number;
  grainExposureWidth: number;
  grainChromaRatio: number;
  grainShadowSizeBoost: number;
  grainNarrowband: boolean;
  desatStart: number;
  desatStrength: number;
  fogAmount: number;
  weaveAmount: number;
  weaveSpeed: number;
  enableCrosstalk: boolean;
  enableCurve: boolean;
  enableTints: boolean;
  enableGrain: boolean;
  enableDesat: boolean;
  enableFog: boolean;
  enableWeave: boolean;
  enableIrradiation: boolean;
}

export function paramsFromStock(s: FilmStock): LatentParams {
  return {
    engineStrength: 1,
    threshold: s.halationThreshold,
    radius: s.halationRadius,
    intensity: s.halationIntensity,
    irradiationRadius: s.irradiationRadius,
    irradiationIntensity: s.irradiationIntensity,
    crosstalk: s.crosstalkAmount,
    toe: s.toeStrength,
    shoulder: s.shoulderStrength,
    shadowTintAmount: s.shadowTintAmount,
    highlightTintAmount: s.highlightTintAmount,
    midTintAmount: s.midTintAmount,
    grainIntensity: s.grainIntensity,
    grainSize: s.grainSize,
    grainExposureBias: s.grainExposureBias,
    grainExposureWidth: s.grainExposureWidth,
    grainChromaRatio: s.grainChromaRatio,
    grainShadowSizeBoost: s.grainShadowSizeBoost,
    grainNarrowband: s.grainNarrowband,
    desatStart: s.desatStart,
    desatStrength: s.desatStrength,
    fogAmount: s.fogAmount,
    weaveAmount: s.weaveAmount,
    weaveSpeed: s.weaveSpeed,
    enableCrosstalk: true,
    enableCurve: true,
    enableTints: true,
    enableGrain: true,
    enableDesat: true,
    enableFog: true,
    enableWeave: true,
    enableIrradiation: true,
  };
}

/** fold live slider values back into a stock — the export format */
export function stockFromParams(stock: FilmStock, p: LatentParams): FilmStock {
  return {
    ...stock,
    halationThreshold: p.threshold,
    halationRadius: p.radius,
    halationIntensity: p.intensity,
    irradiationRadius: p.irradiationRadius,
    irradiationIntensity: p.irradiationIntensity,
    crosstalkAmount: p.crosstalk,
    toeStrength: p.toe,
    shoulderStrength: p.shoulder,
    shadowTintAmount: p.shadowTintAmount,
    highlightTintAmount: p.highlightTintAmount,
    midTintAmount: p.midTintAmount,
    grainIntensity: p.grainIntensity,
    grainSize: p.grainSize,
    grainExposureBias: p.grainExposureBias,
    grainExposureWidth: p.grainExposureWidth,
    grainChromaRatio: p.grainChromaRatio,
    grainShadowSizeBoost: p.grainShadowSizeBoost,
    grainNarrowband: p.grainNarrowband,
    desatStart: p.desatStart,
    desatStrength: p.desatStrength,
    fogAmount: p.fogAmount,
    weaveAmount: p.weaveAmount,
    weaveSpeed: p.weaveSpeed,
  };
}

// Calibrated 2026-07-10 against real 800T reference scans (values pasted
// verbatim from 800T_cal_0710 (4).json; the long decimals are Match solver
// output, kept to reproduce the calibration exactly)
export const CINESTILL_800T: FilmStock = {
  name: 'CineStill 800T',
  halationThreshold: 0.55,
  halationRadius: 4.9,
  halationIntensity: 1.01,
  // Calibrated: deep-red (G/B near zero, R above 1) — more extreme than the
  // engineering estimate's red-orange, true to the research doc's "dare to be
  // extreme" 800T philosophy
  halationTint: [1.2, 0.03, 0.03],
  irradiationRadius: 1.1,
  irradiationIntensity: 0.46,
  // PHYSICS (structure) + calibration (values); each off-diagonal term models —
  crosstalk: [
    //  R←    G←    B←   (scene light)
    0.92, 0.06, 0.02, // red layer: G→R is its sensitivity stretching into
    //                   yellow-green; kept smallest of the three rows so reds
    //                   (neon, skin) stay relatively punchy — the 800T look.
    //                   B→R: silver halide's native blue sensitivity leaking
    //                   past the yellow filter layer.
    0.06, 0.88, 0.06, // green layer: widest spectral overlap, bleeding toward
    //                   red at yellow wavelengths and blue at cyan — the main
    //                   source of film's midtone softness vs digital.
    0.02, 0.08, 0.90, // blue layer: G→B is the imperfect yellow filter plus
    //                   green-dye impurity; R→B is nearly nil physically.
  ],
  crosstalkAmount: 1,
  // Calibrated: toe eased way down (0.35→0.1) — restrained shadow lift
  toeStrength: 0.1,
  // PHYSICS: pivots map to the 500T characteristic curve's toe/shoulder regions (linear light)
  toePoint: 0.07,
  shoulderStrength: 0.6,
  shoulderPoint: 0.55,
  // Calibrated: warm-brown shadows (B at the lower bound) — opposite of the
  // doc's cyan-green expectation, but shadow hue is a property of the scan
  // inversion pipeline (doc item 11); the reference scans win
  shadowTint: [0.9312013160780996, 0.8277843414006593, 0.7],
  shadowTintAmount: 0.62,
  highlightTint: [1.0038969141166711, 0.9, 0.9456992376389031],
  highlightTintAmount: 0.49,
  midTint: [1, 1, 1], // neutral — three-band toning postdates this calibration
  midTintAmount: 0,
  tintCenter: 0.42,
  tintWidth: 0.3,
  grainIntensity: 0.18,
  grainSize: 1.6,
  grainExposureBias: 0.55, // sigmoid midpoint: granularity ramps up above the midtones
  grainExposureWidth: 0.21,
  grainChromaRatio: 0.63, // → channel correlation ≈25%
  grainShadowSizeBoost: 1.6,
  // Calibrated: R at the lower bound, G raised near B — far from the doc
  // appendix estimate (1/1.2/1.8); the reference scans win
  grainChannelBalance: [0.5, 1.9, 2.15],
  grainNarrowband: false, // calibration pick: cell white-noise basis
  desatStart: 0.75,
  desatStrength: 0.62,
  fogAmount: 0.015,
  fogTint: [0.75, 1, 0.92], // leans cyan-green
  weaveAmount: 0.0016,
  weaveSpeed: 1, // Hz
};

// Kodak Portra 400 — initial values derived from physics, not yet run through
// the calibration workbench. Spectral opposite of the 800T in almost every
// axis; each field cites its derivation. TASTE fields await calibration
// against the author's own Portra scans.
export const PORTRA_400: FilmStock = {
  name: 'Kodak Portra 400',
  // PHYSICS: intact anti-halation backing — the single biggest visual split
  // from CineStill (research doc item 3: normal stocks suppress halation to
  // near-invisibility). Only extreme clipped sources leak a trace.
  halationThreshold: 0.75,
  halationRadius: 1.6,
  halationIntensity: 0.18,
  // PHYSICS/TASTE: what leaks past an AH layer is broader-spectrum warmth,
  // not the 800T's raw red-layer re-exposure — orange, not blood-red
  halationTint: [1.0, 0.45, 0.18],
  // PHYSICS: in-emulsion scatter exists in every stock; 800T's was AMPLIFIED
  // by the missing remjet (800T table item 9). Portra sits at the normal level.
  irradiationRadius: 0.6,
  irradiationIntensity: 0.3,
  // PHYSICS (structure) + TASTE (values): rows sum to 1. Derivation rule per
  // spec: soft-not-gray, skin first — the red row is the MOST diagonal of the
  // three (protected skin response), green stays the widest coupler.
  crosstalk: [
    0.94, 0.05, 0.01,
    0.06, 0.89, 0.05,
    0.02, 0.07, 0.91,
  ],
  crosstalkAmount: 1,
  // TASTE (pending Portra scan calibration): famously low contrast — a bit
  // more shadow lift than the calibrated 800T (0.1), still gentle
  toeStrength: 0.2,
  // PHYSICS: same C-41 emulsion-family scale as the 800T pivots
  toePoint: 0.07,
  // PHYSICS: the legendary latitude — roll-off starts LATE (high pivot) and
  // stays soft (low strength); +5 stops still holds separation
  shoulderStrength: 0.35,
  shoulderPoint: 0.6,
  // PHYSICS: daylight-balanced (5500K) — no tungsten hot/cold split. Shadows
  // near-neutral; highlights carry only the signature light cream warmth.
  // TASTE: exact vectors pending Portra scan calibration.
  shadowTint: [0.99, 1.0, 1.01],
  shadowTintAmount: 0.15,
  highlightTint: [1.05, 1.01, 0.94],
  highlightTintAmount: 0.3,
  midTint: [1, 1, 1], // neutral — daylight stock, no mixed-light story
  midTintAmount: 0,
  tintCenter: 0.5,
  tintWidth: 0.3,
  // PHYSICS: T-GRAIN emulsion — markedly finer than a classic-crystal 800
  // stock at the same speed. TASTE: absolute amounts pending calibration.
  grainIntensity: 0.12,
  grainSize: 1.2,
  // PHYSICS: σD–D relation is emulsion-universal (research doc item 1)
  grainExposureBias: 0.55,
  grainExposureWidth: 0.21,
  // TASTE: lower chroma ratio → higher inter-layer correlation → less color
  // noise, matching Portra's clean skin reputation
  grainChromaRatio: 0.5,
  grainShadowSizeBoost: 1.4,
  // PHYSICS: B>G>R layer order holds for all color negatives (doc appendix),
  // but T-GRAIN narrows the spread vs the 800T calibration
  grainChannelBalance: [0.9, 1.1, 1.4],
  grainNarrowband: false,
  // TASTE: latitude keeps hue intact further up — desat starts later, gentler
  desatStart: 0.8,
  desatStrength: 0.5,
  // TASTE: scan-chain kin of the calibrated 800T values, milder cast
  // (pending scan calibration)
  fogAmount: 0.012,
  fogTint: [0.85, 1.0, 0.95],
  // PHYSICS: same transport/scan chain as the user's calibrated 800T setup
  weaveAmount: 0.0016,
  weaveSpeed: 1,
};

/* ===================== Look priors ==========================================
 * Source: docs/look-family-decoder.md. PRIOR is a third annotation tier
 * alongside PHYSICS/TASTE: estimated from film stock + DP working method,
 * NOT calibrated against reference frames. These are cinema-look priors, not
 * film physics — every number is a sampling direction, not truth.
 *
 * Unit conversions (doc units → engine units), applied per field below:
 *
 * 1. Tints. Doc: ADDITIVE linear-space ΔRGB (±0.01–0.08). Engine:
 *    MULTIPLICATIVE tint vector t with amount a; at band core the effective
 *    multiplier is 1+(t−1)·a. Anchoring at mid-grey 0.18 linear, additive Δ
 *    ≈ ratio 1+Δ/0.18 (Δ=+0.05 → ×1.28). Look convention: amount = 1.0 —
 *    the look IS the full effect, scaling belongs to engineStrength — so
 *    t_c = 1 + Δ_c/0.18, clamped to the slider domain [0.7, 1.3] (only the
 *    Noir highlight R hits the clamp, 1.333→1.3, −3% error inside PRIOR
 *    tolerance).
 *
 * 2. Halation radius. Doc: fraction of frame height (0.02 ≈ 22 px @1080p).
 *    Engine: blur iterations N ≈ radius²/4 at fixed small steps → total
 *    σ ∝ √N ∝ radius, i.e. spread is LINEAR in engine radius. The 800T
 *    calibration (radius 4.9) IS the Noir/800T-prototype halo the doc calls
 *    ~0.02 ⇒ engineRadius = 4.9 · (r_doc / 0.02) = 245 · r_doc.
 *
 * 3. Halation intensity. Doc scale puts the 800T prototype at 0.4; the
 *    calibrated 800T sits at 1.01 ⇒ engineIntensity ≈ 2.5 × docIntensity.
 *    Doc thresholds are the same 0–1 luma domain (copied verbatim), but note
 *    the calibrated 800T triggers far lower (0.55) than its prior (0.72) —
 *    expect these prior thresholds to come DOWN under calibration.
 *
 * 4. Grain. Doc σ/255 with the 800T context σ≈0.045 ↔ calibrated
 *    grainIntensity 0.18 ⇒ intensity = 4·σ. Doc grain size is px @1080p and
 *    grainSize is virtual-1080p px ⇒ copied directly.
 *
 * 5. lift → fogAmount (both are linear black-point lift: copied directly).
 *    gain < 0 → earlier/stronger shoulder (approximation, noted in place).
 *    GLOBAL desaturation (doc families 3/5) has no engine equivalent —
 *    desatStrength only touches highlights. V2 parking lot: global
 *    saturation pass.
 *
 * Doc family 5 (Nordic cold — Östlund/Andersson) is deliberately NOT a
 * stock: the doc itself calls it anti-film (no grain, no halation, no
 * roll-off) and files it as the control group. In this engine that look IS
 * engineStrength ≈ 0.1 on any stock — a master-slider position, not a recipe.
 * ========================================================================= */

// Doc family 1a — Wong Kar-wai / Christopher Doyle & Mark Lee, tungsten
// practicals on Kodak negative. The "artificial warm" pole of the East-Asian
// poetic family.
export const LOOK_ITMFL: FilmStock = {
  name: 'Look: In the Mood for Love',
  // PRIOR: doc threshold 0.78 verbatim; radius 0.02 → 245·0.02 = 4.9;
  // intensity 0.25 → ×2.5 = 0.63. Tint (1.0, 0.4, 0.12) verbatim — glow
  // spectrum is already a relative-RGB vector in both systems.
  halationThreshold: 0.78,
  halationRadius: 4.9,
  halationIntensity: 0.63,
  halationTint: [1.0, 0.4, 0.12],
  // PRIOR: normal AH-backed negative — Portra-level scatter
  irradiationRadius: 0.7,
  irradiationIntensity: 0.3,
  // PRIOR: Kodak negative, moderate coupling; red row most diagonal so the
  // qipao reds and saturated skin (doc: ΔS +8%, hue toward RED not orange)
  // stay punchy. Skin ΔH is a sampling criterion, not a matrix parameter.
  crosstalk: [
    0.93, 0.05, 0.02,
    0.05, 0.90, 0.05,
    0.02, 0.06, 0.92,
  ],
  crosstalkAmount: 1,
  toeStrength: 0.2,
  toePoint: 0.07,
  // PRIOR: doc "roll-off 强" — tungsten cores must stop at warm yellow, never
  // clip white: early pivot, strong strength
  shoulderStrength: 0.7,
  shoulderPoint: 0.5,
  // PRIOR: doc shadow Δ(−0.02, +0.02, +0.005) → 1+Δ/0.18 = green-grey
  // (NOT cyan), amount 1.0 per look convention
  shadowTint: [0.889, 1.111, 1.028],
  shadowTintAmount: 1.0,
  // PRIOR: doc highlight Δ(+0.05, +0.015, −0.045) → strong amber
  highlightTint: [1.278, 1.083, 0.75],
  highlightTintAmount: 1.0,
  midTint: [1, 1, 1],
  midTintAmount: 0,
  tintCenter: 0.42,
  tintWidth: 0.3,
  // PRIOR: push-processed low light — σ 0.045 → 4σ = 0.18; 2–3 px → 2.5;
  // chromaRatio 0.3 verbatim (same definition); channel balance = doc
  // appendix generic B>G>R (no scan basis to override it)
  grainIntensity: 0.18,
  grainSize: 2.5,
  grainExposureBias: 0.55,
  grainExposureWidth: 0.21,
  grainChromaRatio: 0.3,
  grainShadowSizeBoost: 1.6,
  grainChannelBalance: [1.0, 1.2, 1.8],
  grainNarrowband: false,
  // PRIOR: weak desat ON PURPOSE — the doc's "cores stay warm yellow" is
  // shoulder+tint work; aggressive desat would bleach them back to white
  desatStart: 0.85,
  desatStrength: 0.3,
  // PRIOR: warm black #2B2320 → warm fog cast
  fogAmount: 0.015,
  fogTint: [1.15, 1.0, 0.8],
  weaveAmount: 0.0016,
  weaveSpeed: 1,
};

// Doc family 1b — Hou Hsiao-hsien / Mark Lee Ping-bing, 35mm, natural light +
// candle flame, heavy fog scenes. Same bloodline as ITMFL ("natural warm +
// cold fog" pole), split into its own card per the doc's two-pole reading.
export const LOOK_ASSASSIN: FilmStock = {
  name: 'Look: The Assassin',
  // PRIOR: candle flame, not tungsten bulbs — higher trigger, gentler glow,
  // slightly broader/golder spectrum than ITMFL
  halationThreshold: 0.8,
  halationRadius: 4.9,
  halationIntensity: 0.5,
  halationTint: [1.0, 0.45, 0.15],
  irradiationRadius: 0.7,
  irradiationIntensity: 0.3,
  // PRIOR: shared family matrix (same negative lineage as ITMFL)
  crosstalk: [
    0.93, 0.05, 0.02,
    0.05, 0.90, 0.05,
    0.02, 0.06, 0.92,
  ],
  crosstalkAmount: 1,
  // PRIOR: fog scenes read as lifted, low-contrast shadows
  toeStrength: 0.3,
  toePoint: 0.07,
  shoulderStrength: 0.6,
  shoulderPoint: 0.55,
  // PRIOR: doc fog-scene shadow Δ(−0.01, +0.005, +0.02) → cold cyan-grey —
  // the axis that splits this card from ITMFL's green-grey
  shadowTint: [0.944, 1.028, 1.111],
  shadowTintAmount: 1.0,
  // PRIOR: same amber highlight vector as ITMFL (shared bloodline), lighter
  // hand — candlelight warmth, not bulb-orange saturation
  highlightTint: [1.278, 1.083, 0.75],
  highlightTintAmount: 0.8,
  midTint: [1, 1, 1],
  midTintAmount: 0,
  tintCenter: 0.42,
  tintWidth: 0.3,
  // PRIOR: family grain slightly under ITMFL (less push in daylight/fog)
  grainIntensity: 0.16,
  grainSize: 2.5,
  grainExposureBias: 0.55,
  grainExposureWidth: 0.21,
  grainChromaRatio: 0.3,
  grainShadowSizeBoost: 1.6,
  grainChannelBalance: [1.0, 1.2, 1.8],
  grainNarrowband: false,
  desatStart: 0.8,
  desatStrength: 0.4,
  // PRIOR: fog-cyan blacks (doc 雾青灰 #7C8B82 direction)
  fogAmount: 0.02,
  fogTint: [0.9, 1.0, 1.05],
  weaveAmount: 0.0016,
  weaveSpeed: 1,
};

// Doc family 2 — Rohmer/Truffaut, Almendros available-light doctrine.
// The signature is NOT a color cast: it is the lifted black point
// ("faded honesty"). Skin ΔS −5% is global desaturation — INEXPRESSIBLE
// in the current engine (V2 parking lot: global saturation pass).
export const LOOK_ROHMER: FilmStock = {
  name: 'Look: Éric Rohmer',
  // PRIOR: doc "≈ off" — intensity 0.08 → ×2.5 = 0.2, high threshold,
  // small radius; daylight has almost nothing to bloom
  halationThreshold: 0.85,
  halationRadius: 2.0,
  halationIntensity: 0.2,
  halationTint: [1.0, 0.45, 0.2],
  irradiationRadius: 0.6,
  irradiationIntensity: 0.3,
  // PRIOR: "non-intervention" color philosophy → near-identity matrix,
  // scene objects carry the palette, not the stock
  crosstalk: [
    0.96, 0.03, 0.01,
    0.03, 0.94, 0.03,
    0.01, 0.04, 0.95,
  ],
  crosstalkAmount: 1,
  toeStrength: 0.15,
  toePoint: 0.07,
  // PRIOR: "medium, skies softly overexposed"
  shoulderStrength: 0.5,
  shoulderPoint: 0.6,
  // PRIOR: doc shadow Δ(0, 0, +0.008) → barely-blue neutral
  shadowTint: [1.0, 1.0, 1.044],
  shadowTintAmount: 1.0,
  // PRIOR: doc highlight Δ(+0.01, +0.005, −0.01) → near-neutral faint warm
  highlightTint: [1.056, 1.028, 0.944],
  highlightTintAmount: 1.0,
  midTint: [1, 1, 1],
  midTintAmount: 0,
  tintCenter: 0.5,
  tintWidth: 0.3,
  // PRIOR: old Eastmancolor — coarser (σ 0.035 → 0.14, 2.5–3.5 px → 3.0),
  // visibly COLORED grain (chromaRatio 0.4, old dye clouds)
  grainIntensity: 0.14,
  grainSize: 3.0,
  grainExposureBias: 0.55,
  grainExposureWidth: 0.21,
  grainChromaRatio: 0.4,
  grainShadowSizeBoost: 1.5,
  grainChannelBalance: [1.0, 1.2, 1.8],
  grainNarrowband: false,
  desatStart: 0.8,
  desatStrength: 0.4,
  // PRIOR: THE family signature — doc lift +0.03 copied straight into
  // fogAmount, dead-neutral cast: shadows are grey, not black, not tinted
  fogAmount: 0.03,
  fogTint: [1.0, 1.0, 1.0],
  weaveAmount: 0.002,
  weaveSpeed: 1.2,
};

// Doc family 3 — Coppola / A24: desaturate, lift blacks, milk-soft highlights.
// The doc's Sat −18% is global desaturation — INEXPRESSIBLE here (V2 parking
// lot: global saturation pass); the milkiness below is carried by fog +
// shoulder + highlight desat instead.
export const LOOK_COPPOLA: FilmStock = {
  name: 'Look: Sofia Coppola',
  // PRIOR: doc threshold 0.85, radius 0.015 → 3.7, intensity 0.12 → 0.3;
  // broader/paler tint — this is digital-era bloom, not remjet halation
  halationThreshold: 0.85,
  halationRadius: 3.7,
  halationIntensity: 0.3,
  halationTint: [1.0, 0.5, 0.25],
  // PRIOR: largely digital acquisition — scatter kept minimal
  irradiationRadius: 0.4,
  irradiationIntensity: 0.2,
  crosstalk: [
    0.95, 0.04, 0.01,
    0.04, 0.92, 0.04,
    0.01, 0.05, 0.94,
  ],
  crosstalkAmount: 1,
  toeStrength: 0.25,
  toePoint: 0.07,
  // PRIOR: "roll-off 非常强,是家族身份" + doc gain −0.05 → the strongest
  // shoulder in the registry, pivot pulled EARLY so highlights never leave
  // the milk zone
  shoulderStrength: 0.9,
  shoulderPoint: 0.45,
  // PRIOR: doc shadow Δ(−0.01, +0.005, +0.015) → restrained cool
  shadowTint: [0.944, 1.028, 1.083],
  shadowTintAmount: 1.0,
  // PRIOR: doc highlight Δ(+0.015, +0.01, 0) → milk-white, not gold
  highlightTint: [1.083, 1.056, 1.0],
  highlightTintAmount: 1.0,
  midTint: [1, 1, 1],
  midTintAmount: 0,
  tintCenter: 0.5,
  tintWidth: 0.35,
  // PRIOR: fine even digital-added grain — σ 0.02 → 0.08, 1–1.5 px → 1.2,
  // nearly monochrome (chromaRatio 0.15), no shadow chunking story
  grainIntensity: 0.08,
  grainSize: 1.2,
  grainExposureBias: 0.55,
  grainExposureWidth: 0.21,
  grainChromaRatio: 0.15,
  grainShadowSizeBoost: 1.2,
  grainChannelBalance: [1.0, 1.1, 1.3],
  grainNarrowband: false,
  // PRIOR: strong highlight desat is half of the "milk" (whites go pale
  // before they go bright)
  desatStart: 0.7,
  desatStrength: 0.7,
  // PRIOR: doc lift +0.04 → fogAmount, faintly warm milk cast
  fogAmount: 0.04,
  fogTint: [1.05, 1.0, 0.95],
  weaveAmount: 0.0008, // digital-era steadiness
  weaveSpeed: 1,
};

// Doc family 4 — early Wong Kar-wai / Doyle (Chungking Express, Fallen
// Angels): pushed tungsten stock under fluorescent + neon. THE CineStill
// 800T prototype and the core demo family — so this card is built ON the
// calibrated 800T values and pushed, not re-estimated from scratch. The
// doc's warning stands: do NOT protect skin here, light pollution is the
// aesthetic.
export const LOOK_FALLEN_ANGELS: FilmStock = {
  name: 'Look: Fallen Angels',
  // 800T calibrated base: threshold stays at the CALIBRATED 0.55 (the prior
  // 0.72 is known-conservative, see conversion note 3); radius pushed to the
  // doc's 0.03 → 7.4; intensity pushed past the calibrated 1.01
  halationThreshold: 0.55,
  halationRadius: 7.4,
  halationIntensity: 1.2,
  halationTint: [1.2, 0.03, 0.03], // calibrated 800T bloodline — deep red
  irradiationRadius: 1.1, // calibrated 800T (missing remjet amplification)
  irradiationIntensity: 0.46,
  // PRIOR: strongest coupling in the registry — push + mixed sources; doc
  // names G→R and B→G at the 0.08–0.10 ceiling
  crosstalk: [
    0.88, 0.10, 0.02,
    0.05, 0.85, 0.10,
    0.02, 0.08, 0.90,
  ],
  crosstalkAmount: 1,
  toeStrength: 0.1, // calibrated 800T curve
  toePoint: 0.07,
  shoulderStrength: 0.6,
  shoulderPoint: 0.55,
  // PRIOR: doc shadow Δ(−0.03, +0.025, +0.03) → cyan-green fluorescent
  // contamination, the family signature. NOTE this deliberately CONTRADICTS
  // the calibrated 800T warm-brown shadows: that was a scan-pipeline trait,
  // this is an aesthetic direction — PRIOR follows the doc.
  shadowTint: [0.833, 1.139, 1.167],
  shadowTintAmount: 1.0,
  // PRIOR: doc highlight Δ(+0.06, +0.02, −0.05) → neon blast; R clamps at
  // the 1.3 slider ceiling (1.333 exact, −3%)
  highlightTint: [1.3, 1.111, 0.722],
  highlightTintAmount: 1.0,
  // PRIOR: doc mids Δ(−0.01, +0.02, 0) → the fluorescent-green midtone that
  // motivated three-band toning in the first place
  midTint: [0.944, 1.111, 1.0],
  midTintAmount: 1.0,
  tintCenter: 0.42,
  tintWidth: 0.3,
  // PRIOR on 800T base: push-two-stops grain — σ 0.055–0.07 → 0.24 (from the
  // calibrated 0.18), 3–4 px → 3.5; "shadows especially dirty" → bias down,
  // shadow boost up; channel balance keeps the calibrated scan bloodline
  grainIntensity: 0.24,
  grainSize: 3.5,
  grainExposureBias: 0.5,
  grainExposureWidth: 0.21,
  grainChromaRatio: 0.35,
  grainShadowSizeBoost: 2.0,
  grainChannelBalance: [0.5, 1.9, 2.15],
  grainNarrowband: false,
  desatStart: 0.75, // calibrated 800T
  desatStrength: 0.62,
  // PRIOR: green-black (#1A1E1C) — fluorescent seeps into the blacks too
  fogAmount: 0.015,
  fogTint: [0.85, 1.05, 0.95],
  weaveAmount: 0.0016,
  weaveSpeed: 1,
};

// Doc family 6 — Kore-eda / Ozu: Fuji lineage + natural window light. The key
// is FUJI GREEN — greens toward emerald/mint, split from Kodak's yellow-green
// — which the doc explicitly routes through the crosstalk matrix.
export const LOOK_KOREEDA: FilmStock = {
  name: 'Look: Kore-eda',
  // PRIOR: doc threshold 0.82, radius 0.012 → 2.9, intensity 0.1 → 0.25
  halationThreshold: 0.82,
  halationRadius: 2.9,
  halationIntensity: 0.25,
  halationTint: [1.0, 0.45, 0.2],
  irradiationRadius: 0.6,
  irradiationIntensity: 0.25,
  // PRIOR, per doc instruction "green hue −8° toward cyan, do it in the
  // matrix": R row's G-column kept LOW (greens must not yellow) while the
  // B row receives strongly from G (0.10) — green content gains blue,
  // rotating grass/plants toward emerald. Rows still sum to 1 (neutrals safe).
  crosstalk: [
    0.94, 0.03, 0.03,
    0.04, 0.92, 0.04,
    0.01, 0.10, 0.89,
  ],
  crosstalkAmount: 1,
  toeStrength: 0.2,
  toePoint: 0.07,
  // PRIOR: "中强" roll-off — the shoji-screen soft white
  shoulderStrength: 0.55,
  shoulderPoint: 0.55,
  // PRIOR: doc shadow Δ(+0.005, +0.005, −0.005) → warm-brown NEUTRAL shadows;
  // shadows-never-cyan is the doc's stated boundary against family 3
  shadowTint: [1.028, 1.028, 0.972],
  shadowTintAmount: 1.0,
  // PRIOR: doc highlight Δ(+0.03, +0.012, −0.02) → soft warm, one step
  // lighter than Wong Kar-wai
  highlightTint: [1.167, 1.067, 0.889],
  highlightTintAmount: 1.0,
  midTint: [1, 1, 1],
  midTintAmount: 0,
  tintCenter: 0.5,
  tintWidth: 0.3,
  // PRIOR: fine — σ 0.025 → 0.10, 1.5–2 px → 1.8, chromaRatio 0.2
  grainIntensity: 0.1,
  grainSize: 1.8,
  grainExposureBias: 0.55,
  grainExposureWidth: 0.21,
  grainChromaRatio: 0.2,
  grainShadowSizeBoost: 1.3,
  grainChannelBalance: [1.0, 1.15, 1.5],
  grainNarrowband: false,
  desatStart: 0.8,
  desatStrength: 0.5,
  // PRIOR: tatami-warm base
  fogAmount: 0.012,
  fogTint: [1.05, 1.0, 0.9],
  weaveAmount: 0.0016,
  weaveSpeed: 1,
};

/** every shippable stock — the workbench switcher reads this registry.
 *  Order: calibrated film stocks first, then cinema-look priors. */
export const STOCKS: FilmStock[] = [
  CINESTILL_800T,
  PORTRA_400,
  LOOK_ITMFL,
  LOOK_ASSASSIN,
  LOOK_ROHMER,
  LOOK_COPPOLA,
  LOOK_FALLEN_ANGELS,
  LOOK_KOREEDA,
];
