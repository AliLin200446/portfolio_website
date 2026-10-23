const objects = [
<svg key="0" className="obj" role="img" aria-label="35mm camera" width="150" height="62" viewBox="0 0 150 62" fill="none" stroke="#111111" strokeWidth="1.2">
      <rect x="1" y="12" width="148" height="48" fill="#D6D6D2"></rect>
      <rect x="18" y="4" width="28" height="8" fill="#D6D6D2"></rect>
      <rect x="104" y="6" width="34" height="6" fill="#8C8C88"></rect>
      <rect x="1" y="12" width="148" height="9" fill="#2B2B29"></rect>
      <circle cx="75" cy="38" r="17" fill="#FFFFFF"></circle>
      <circle className="acc" cx="75" cy="38" r="10" fill="#8C8C88"></circle>
      <rect x="10" y="28" width="16" height="10" fill="#FFFFFF"></rect>
    </svg>,
<svg key="1" className="obj" role="img" aria-label="Film canister with leader" width="230" height="50" viewBox="0 0 230 50" fill="none" stroke="#111111" strokeWidth="1.2">
      <rect x="1" y="16" width="150" height="22" fill="#FFFFFF"></rect>
      <path d="M8 19h6M22 19h6M36 19h6M50 19h6M64 19h6M78 19h6M92 19h6M106 19h6M120 19h6M134 19h6M8 35h6M22 35h6M36 35h6M50 35h6M64 35h6M78 35h6M92 35h6M106 35h6M120 35h6M134 35h6"></path>
      <rect className="acc" x="40" y="23" width="56" height="8" fill="#D6D6D2"></rect>
      <rect x="151" y="6" width="66" height="42" fill="#D6D6D2"></rect>
      <rect x="151" y="6" width="66" height="7" fill="#2B2B29"></rect>
      <rect x="151" y="41" width="66" height="7" fill="#2B2B29"></rect>
      <rect x="217" y="20" width="12" height="14" fill="#8C8C88"></rect>
    </svg>,
<svg key="2" className="obj" role="img" aria-label="Acupuncture needle" width="290" height="24" viewBox="0 0 290 24" fill="none" stroke="#111111" strokeWidth="1.2">
      <line x1="1" y1="12" x2="190" y2="12"></line>
      <rect x="190" y="6" width="74" height="12" fill="#D6D6D2"></rect>
      <path d="M196 6v12M202 6v12M208 6v12M214 6v12M220 6v12M226 6v12M232 6v12M238 6v12M244 6v12M250 6v12M256 6v12"></path>
      <rect className="acc" x="264" y="4" width="24" height="16" fill="#2B2B29"></rect>
    </svg>,
<svg key="3" className="obj" role="img" aria-label="Measuring caliper" width="250" height="64" viewBox="0 0 250 64" fill="none" stroke="#111111" strokeWidth="1.2">
      <rect x="1" y="10" width="248" height="16" fill="#FFFFFF"></rect>
      <path d="M20 10v6M30 10v4M40 10v6M50 10v4M60 10v6M70 10v4M80 10v6M90 10v4M100 10v6M110 10v4M120 10v6M130 10v4M140 10v6M150 10v4M160 10v6M170 10v4M180 10v6M190 10v4M200 10v6M210 10v4M220 10v6M230 10v4"></path>
      <path d="M1 26h18v36H1z" fill="#2B2B29"></path>
      <rect className="acc" x="96" y="4" width="48" height="28" fill="#D6D6D2"></rect>
      <path d="M118 32h18v30h-18z" fill="#2B2B29"></path>
      <path d="M19 44h99" strokeDasharray="3 3"></path>
    </svg>,
<svg key="4" className="obj" role="img" aria-label="New York studio building" width="200" height="66" viewBox="0 0 200 66" fill="none" stroke="#111111" strokeWidth="1.2">
      <rect x="1" y="14" width="120" height="51" fill="#D6D6D2"></rect>
      <rect x="121" y="1" width="78" height="64" fill="#FFFFFF"></rect>
      <path d="M12 24h12v10H12zM34 24h12v10H34zM56 24h12v10H56zM78 24h12v10H78zM100 24h12v10h-12zM12 44h12v10H12zM34 44h12v10H34zM56 44h12v10H56zM78 44h12v10H78z" fill="#FFFFFF"></path>
      <path d="M131 10h58M131 20h58M131 30h58M131 40h58"></path>
      <rect className="acc" x="98" y="44" width="16" height="21" fill="#2B2B29"></rect>
    </svg>,
<svg key="5" className="obj" role="img" aria-label="Rolled diploma" width="170" height="30" viewBox="0 0 170 30" fill="none" stroke="#111111" strokeWidth="1.2">
      <rect x="1" y="6" width="168" height="18" fill="#FFFFFF"></rect>
      <ellipse cx="9" cy="15" rx="8" ry="9" fill="#D6D6D2"></ellipse>
      <rect className="acc" x="78" y="4" width="14" height="22" fill="#8C8C88"></rect>
    </svg>,
<svg key="6" className="obj" role="img" aria-label="Envelope" width="110" height="64" viewBox="0 0 110 64" fill="none" stroke="#111111" strokeWidth="1.2">
      <rect x="1" y="1" width="108" height="62" fill="#D6D6D2"></rect>
      <path d="M1 1l54 36L109 1"></path>
      <rect className="acc" x="84" y="8" width="18" height="14" fill="#FFFFFF"></rect>
    </svg>
];
export default function AboutObject({ index }: { index: number }) { return objects[index]; }
