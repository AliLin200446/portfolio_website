/*
 * 地平 — the horizon meter. A sun half sunk into a band of ground,
 * with the bronze line it is sinking through and a tick at the centre.
 *
 * Inlined rather than served as an img so the header ships no extra
 * request and the mark can inherit from the page later. The geometry
 * and all four colours are the supplied source, unchanged: this file
 * adds a viewBox-sized box and a hover, nothing else.
 *
 * Static. The developing entrance is a separate piece of work.
 */
export default function BrandMark() {
  return (
    <svg
      viewBox="0 0 208 100"
      className="h-[18px] w-auto shrink-0 opacity-100 transition-opacity duration-200 group-hover:opacity-70 sm:h-[22px]"
      role="img"
      aria-label="Ali Lin Lab"
    >
      <circle cx="104" cy="50" r="50" fill="#B8452A" />
      <rect x="0" y="50" width="208" height="50" fill="#C4A87C" />
      <line x1="0" y1="50" x2="208" y2="50" stroke="#8C6A3F" strokeWidth="2" />
      <line x1="104" y1="40" x2="104" y2="60" stroke="#8C6A3F" strokeWidth="2" />
    </svg>
  );
}
