// 04 · Crop marks. Print marks close in by 4px on hover; a format label appears.

import type { ReactNode } from 'react';

export function CropFrame({
  children,
  label,
  className = '',
}: {
  children: ReactNode;
  /** e.g. "Pl. 03 · 3:2 · 35mm" */
  label?: string;
  className?: string;
}) {
  return (
    <figure className={`crop ${className}`} style={{ margin: 0 }}>
      {children}
      <span className="crop__mark crop__mark--tl" aria-hidden="true" />
      <span className="crop__mark crop__mark--tr" aria-hidden="true" />
      <span className="crop__mark crop__mark--bl" aria-hidden="true" />
      <span className="crop__mark crop__mark--br" aria-hidden="true" />
      {label ? <figcaption className="crop__label">{label}</figcaption> : null}
    </figure>
  );
}
