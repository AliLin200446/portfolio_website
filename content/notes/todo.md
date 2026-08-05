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
