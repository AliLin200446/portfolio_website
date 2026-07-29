import type { CaseData } from "./_schema";

/*
 * VESTIGE — copy supplied by the author, verbatim.
 *
 * DISCLOSURE BOUNDARY: the provisional is FILED, so priority is secured
 * and the ARCHITECTURE can be described. The cryptographic CONSTRUCTION
 * — hash formulas, circuit leaf structure, nullifier derivation — stays
 * in the filed spec and appears nowhere in this file or its figures.
 * The two diagrams are concept-level redraws, not reproductions.
 * Wording held exactly: "presented to leads at" (not validated /
 * partnered / piloted), and "a filed provisional" (singular, one merged
 * spec — never "two patents"). The EU requirement is described as
 * coming, with the textile rollout dated 2027+ and never 2026.
 */
const vestige: CaseData = {
  slug: "vestige",
  name: "VESTIGE",
  oneLine:
    "a digital product passport that proves what a luxury item is — without exposing what the brand can't afford to reveal",
  meta: {
    type: "cryptographic product-lifecycle system",
    stack: "ZK proofs / NFC / smart contract",
    year: "2026",
    status: "filed provisional · live mock-up",
    live: "https://vestige.alilinlab.com",
  },
  claim:
    "One commitment. Three audiences. Each sees only what it's allowed to — and can't reconstruct the rest.",
  hero: {
    kind: "live",
    url: "https://vestige.alilinlab.com",
    caption:
      "a live mock-up of the consumer passport — the renderer that ages with the object · click to run the real thing",
  },
  what: [
    "Coming EU regulation will require luxury and textile brands to publish a digital product passport — verifiable provenance, materials, sustainability. But a passport forces a bad trade: disclose enough raw supply-chain data to satisfy regulators, or withhold it to protect suppliers, recipes, and cost. For luxury, the very facts that prove compliance are the ones a brand can't reveal.",
    "Vestige removes the trade. From a single cryptographic commitment, it generates role-differentiated zero-knowledge proofs: the same hidden field is proven to a regulator as a compliance verdict, shown to a brand partner as a category, and withheld from the consumer entirely — with an inference firewall that stops multiple proofs from being combined to reconstruct what no single role may see.",
  ],
  build: [
    {
      heading: "ONE COMMITMENT, THREE READINGS",
      body: "A product is one canonical commitment root, partitioned into static identity, compliance state, dynamic ownership, and bio-material lineage. From that one root, separate proof circuits answer to separate policies — regulator, brand, consumer — each disclosing a field as an exact value, a bucket, a predicate-only check, or nothing. A verifier can confirm a proof follows an authorized policy, not an ad-hoc selection by the prover.",
      figure: {
        // concept-level redraw: partitions and audiences only. No hash
        // formula, no leaf structure, no nullifier derivation — those
        // live in the filed spec and stay there.
        kind: "code",
        code: `one commitment root
  ├── static identity
  ├── compliance state
  ├── dynamic ownership
  └── bio-material lineage
        │
        ├── policy circuit → regulator   compliance verdict
        ├── policy circuit → brand       approved-source category
        └── policy circuit → consumer    withheld
                                          ↑ inference firewall:
                                            proofs cannot be combined`,
        caption:
          "role-differentiated proof architecture · concept redraw — the construction stays in the filed provisional",
      },
    },
    {
      heading: "THE TAP THAT CHANGES STATE",
      body: "An NFC tap (NTAG 424 DNA) isn't just an authenticity check. A verified tap becomes a presence receipt that updates the commitment, and in the same atomic transaction the smart contract routes the resale royalty, transfers ownership, advances the lifecycle state, and steps the renderer forward. Physical presence, payment, and provenance move together — the loop ordinary NFC authentication leaves open.",
      figure: {
        kind: "code",
        code: `NFC tap (NTAG 424 DNA)
  → verified presence receipt
  → commitment updated
  → one atomic transaction:
       royalty routed · ownership transferred
       lifecycle advanced · renderer stepped`,
        caption:
          "physical-authentication sequence · concept redraw — no construction detail",
      },
    },
  ],
  proof: {
    items: [
      {
        claim:
          "SELECTIVE DISCLOSURE, NOT ALL-OR-NOTHING. A regulator sees a compliance verdict; a brand partner sees an approved-source category; a consumer sees a curated provenance story and certification badges. The raw supplier identity, cost, recipe, and exact emissions stay hidden from all of them — proven, not shown.",
      },
      {
        claim:
          "PROVENANCE THAT STARTS BEFORE MANUFACTURE. For bio-materials — mycelium leather, algae textile — the environmentally significant phase happens before cutting. Vestige carries time-windowed cultivation sensor data into a batch commitment inherited by every downstream item: a seed-to-sale history, cryptographically linked.",
      },
      {
        claim:
          "PRESENTED TO INDUSTRY LEADS. The system was presented to leads at PwC, JPMorgan, and Tapestry. The cryptographic construction is covered in a filed provisional; this page describes the architecture, not the circuits.",
        source:
          "coming EU digital product passport requirement for textiles · rollout 2027+",
      },
    ],
    limits: [
      "A filed provisional and a live mock-up — not a production deployment. The consumer passport at vestige.alilinlab.com demonstrates the renderer and the disclosure model; the full multi-circuit prover is specified, not yet shipped end to end.",
    ],
  },
  context:
    "Vestige is where the practice meets a market. Latent and Teardown instrument what generative systems do; Vestige instruments trust itself — turning a regulatory burden into something a brand can use, without surrendering the secrets that make it a brand. The seal, the provenance, the object that remembers who owned it — it's the same instinct as a maker's mark, rebuilt in zero knowledge.",
  byline: "Ali Lin, design engineer",
  prev: { label: "TEARDOWN № 1", href: "/work/teardown" },
  next: { label: "MATERIAL MEMORY", href: "/work/material-memory" },
};
export default vestige;
