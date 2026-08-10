import type { CaseData } from "./_schema";

/*
 * VESTIGE: copy supplied by the author, verbatim.
 *
 * DISCLOSURE BOUNDARY: the provisional is FILED, so priority is secured
 * and the ARCHITECTURE can be described. The cryptographic CONSTRUCTION
 *: hash formulas, circuit leaf structure, nullifier derivation: stays
 * in the filed spec and appears nowhere in this file or its figures.
 * The two diagrams are concept-level redraws, not reproductions.
 * Wording held exactly: "presented to leads at" (not validated /
 * partnered / piloted), and "a filed provisional" (singular, one merged
 * spec: never "two patents"). The EU requirement is described as
 * coming, with the textile rollout dated 2027+ and never 2026.
 */
const vestige: CaseData = {
  slug: "vestige",
  name: "VESTIGE",
  oneLine:
    "a digital product passport that proves what a luxury item is, without exposing what the brand can't afford to reveal",
  meta: {
    type: "cryptographic product-lifecycle system",
    stack: "ZK proofs / NFC / smart contract",
    year: "2026",
    status: "filed provisional · live mock-up",
    live: "https://vestige.alilinlab.com",
  },
  claim:
    "One commitment. Three audiences. Each sees only what it's allowed to, and can't reconstruct the rest.",
  hero: {
    kind: "live",
    url: "https://vestige.alilinlab.com",
    caption:
      "a live mock-up of the consumer passport, the renderer that ages with the object · click to run the real thing",
  },
  sections: {
    what: "For luxury, the very facts that prove compliance are the ones a brand can't reveal.",
    why: "Coming EU regulation will require a digital product passport. That forces a trade: disclose raw supply-chain data, or withhold it and fail compliance.",
    how: {
      summary: [
        "One cryptographic commitment generates role-differentiated zero-knowledge proofs, with an inference firewall so proofs cannot be combined.",
      ],
      phases: [
        {
          title: "Phase 1 \u00b7 One commitment, three readings",
          body: [
            "A regulator sees a verdict, a brand partner a category, a consumer a story.",
            "Supplier identity, cost and recipe stay hidden from all three: proven, not shown.",
          ],
          /* The four partitions and the four disclosure modes, kept as
             an enumeration. This phase's figure slot holds the
             commitment tree, so these are mono lines rather than an
             aligned block, following the Latent precedent. */
          data: [
            "partition | disclosure modes available",
            "static identity | exact value, bucket, predicate only, nothing",
            "compliance state | exact value, bucket, predicate only, nothing",
            "dynamic ownership | exact value, bucket, predicate only, nothing",
            "bio-material lineage | exact value, bucket, predicate only, nothing",
          ],
          figure: {
            kind: "code",
            code: `one commitment root
  \u251c\u2500\u2500 static identity
  \u251c\u2500\u2500 compliance state
  \u251c\u2500\u2500 dynamic ownership
  \u2514\u2500\u2500 bio-material lineage
        \u2502
        \u251c\u2500\u2500 policy circuit \u2192 regulator   compliance verdict
        \u251c\u2500\u2500 policy circuit \u2192 brand       approved-source category
        \u2514\u2500\u2500 policy circuit \u2192 consumer    withheld
                                          \u2191 inference firewall:
                                            proofs cannot be combined`,
            caption:
              "role-differentiated proof architecture \u00b7 concept redraw. The construction stays in the filed provisional",
          },
        },
        {
          title: "Phase 2 \u00b7 Provenance that starts before manufacture",
          body: [
            "For mycelium leather and algae textile the significant phase is before cutting. Cultivation data enters a batch commitment every item inherits.",
          ],
        },
        {
          title: "Phase 3 \u00b7 The tap that changes state",
          body: [
            "A verified NFC tap (NTAG 424 DNA) becomes a presence receipt, and one atomic transaction carries the rest.",
          ],
          figure: {
            kind: "code",
            code: `NFC tap (NTAG 424 DNA)
  \u2192 verified presence receipt
  \u2192 commitment updated
  \u2192 one atomic transaction:
       royalty routed \u00b7 ownership transferred
       lifecycle advanced \u00b7 renderer stepped`,
            caption:
              "physical-authentication sequence \u00b7 concept redraw. No construction detail",
          },
        },
      ],
    },
  },
  proof: {
    items: [
      {
        claim:
          "PRESENTED TO INDUSTRY LEADS. The system was presented to leads at PwC, JPMorgan, and Tapestry. The cryptographic construction is covered in a filed provisional; this page describes the architecture, not the circuits.",
        /* No source. The field held a duplicate of the EU regulation
           line, which `why` already carries more fully; it cited a fact
           the claim never makes. Presenting to leads at three firms has
           no artefact in this repo, so the claim stands uncited rather
           than dressed in a citation for something else. */
      },
    ],
    limits: [
      "A filed provisional and a live mock-up, not a production deployment. The consumer passport at vestige.alilinlab.com demonstrates the renderer and the disclosure model; the full multi-circuit prover is specified, not yet shipped end to end.",
    ],
  },
  coda: "It turns a regulatory burden into something a brand can use without surrendering what makes it a brand. The same instinct as a maker's mark, rebuilt in zero knowledge.",
  byline: "Ali Lin",
  prev: { label: "TEARDOWN № 1", href: "/work/teardown" },
  next: { label: "MATERIAL MEMORY", href: "/work/material-memory" },
};
export default vestige;
