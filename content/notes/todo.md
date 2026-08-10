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
