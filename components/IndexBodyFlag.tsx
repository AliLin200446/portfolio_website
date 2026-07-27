"use client";

import { useEffect } from "react";

/** Marks the body while the index is mounted so the layout-level nav can
 *  step aside for HomeShell's own bar. A data attribute rather than a
 *  route check, so it stays correct through client navigation. */
export default function IndexBodyFlag() {
  useEffect(() => {
    document.body.dataset.index = "true";
    return () => {
      delete document.body.dataset.index;
    };
  }, []);
  return null;
}
