# Open items that cannot be closed from this repo

## material-memory: applyPointer comment contradicts the code

`applyPointer` says the pointer pushes the cloth *toward viewer*. It
pushes it *away from the camera*. The comment is wrong, not the code.

It cannot be fixed from here: the material-memory engine is a separate
repository and is not on this machine. Checked, it is not anywhere
under the Applications directory. This is recorded rather than worked
around, so it does not get lost the way the em dash guard did in the
latent repo.

Fix it wherever that repository lives.

## latent: live copy verified clean, 2026-08-07

Latent live copy verified clean on 2026-08-07: no 24fps, no "six
passes" as a pipeline count. The earlier fix had reached production;
the concern was stale. Five GL passes in the pipeline, 6 gaussian
iterations at radius 4.9, correctly distinct.

Recorded here because the question was raised across several rounds
and re-checked each time. A verified negative belongs in the repo, not
in a conversation, or it gets asked again.

## figures: candidates left after the compression pass

Six paragraphs that restated a figure on the same page were deleted
rather than compressed, and Latent's radius mapping became two mono
rows, so the obvious cases are closed. What remains, for a later pass:

- Teardown Phase 3's five-experiment rows and Vestige Phase 1's four
  partitions are mono lines, not aligned blocks, because `expspace`
  and the commitment tree hold those phases' single figure slots.
  `ph.data` renders as a plain paragraph, so runs of spaces collapse.
  An aligned table there needs either a second figure slot on Phase or
  a preformatted variant of `data`. Not worth restructuring a phase
  for; noted so the reason is on record.
- Latent's radius table carries two rows, not three. The source
  supports radius 4.9 -> N 6 -> about sigma 30, and the
  MAX_BLUR_ITERATIONS ceiling of 24 near radius 9.8. A third row would
  mean computing an effective sigma no evidence file states.

## comments: a lying comment survives review

A comment that describes intent while the code does something else is
a lie that survives review, because reviewers read the comment. Three
found so far: BenchLoader claiming drei asset tracking that never
existed, applyPointer claiming toward viewer while pushing away, a
subdivision comment claiming a necessity the measurement did not
support. When they diverge, the comment is what changes.

## geometry: measure the placement, do not recompute it

A number derived from the placement formula agrees with the placement
code even when the placement code is wrong. Read it back off the scene
graph instead.

This is why the dive assertion could never catch the `% 6` bug it was
written for: both of its sides ran through the same index function, so
a wrong index moved the object and moved the expected value with it.

## guards: test the guard against the real failure, not against a clean pass

The orphan-claim detector would not have caught this regression. The old
hero sentences scored 0.75 against the case file's HOW section: they
were correctly sourced sentences sitting in the wrong slot. A whole-file
check cannot see position. Tested against the real failure before
shipping, and replaced rather than tuned.

The replacement compares positions instead: hero PROBLEM against case
WHAT, which scored 0.11 on the broken pair and 1.00 on all five heroes
once fixed.

The duplication this produces is not a defect, it is the guard's
control. PROBLEM and WHAT are the same sentence in two files on
purpose. If the hero became the only place the sentence appeared, the
position check would have nothing left to compare against.

## records: a decision recorded only in conversation is not recorded

A decision recorded in one repo is not recorded in the other. The
cross-repo style reconciliation was written down in Skeletal Silk's
STYLE.md and nowhere in the portfolio, so from inside the portfolio it
did not exist, and I reported it as unrecorded after searching only
this repo. Both halves were wrong in the same way: a note is only
findable from the side it was written on.

If a decision spans two repos, it goes in a file in BOTH, and each copy
names the other by its real path. Searching one repo is not evidence
about the other.
