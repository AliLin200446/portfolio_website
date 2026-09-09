// Original circle geometry and palette, with a tighter viewBox for legible mobile labels.
// Practice explanations now live beside and below the diagram rather than behind hover.
export default function Venn() {
  return (
    <svg viewBox="170 25 345 335" className="w-full" role="img" aria-label="Three overlapping circles: Eye, Hand and Instrument. Ali Lin sits where all three meet.">
      <circle cx="340" cy="155" r="115" fill="none" stroke="#866339" strokeWidth="1.5" />
      <circle cx="295" cy="235" r="115" fill="none" stroke="#3a4a3f" strokeWidth="1.5" />
      <circle cx="385" cy="235" r="115" fill="none" stroke="#1a1714" strokeWidth="1.5" />
      <g fontFamily="var(--font-geist-mono), monospace" fontSize="11" letterSpacing="0.08em" textAnchor="middle">
        <text x="340" y="92" fill="#866339">EYE</text>
        <text x="240" y="294" fill="#3a4a3f">HAND</text>
        <text x="444" y="294" fill="#1a1714">INSTRUMENT</text>
      </g>
      <text x="340" y="210" textAnchor="middle" fontFamily="var(--font-geist-sans), sans-serif" fontSize="14" fill="#1a1714">Ali Lin</text>
    </svg>
  );
}
