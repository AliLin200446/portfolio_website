"use client";
import { useEffect, useRef, useState } from "react";

type Shot = "wide" | "medium" | "close";
type Angle = "low" | "eye" | "high";
type Lens = 24 | 35 | 50 | 85 | 135;
export default function FramefieldLite() {
  const [shot, setShot] = useState<Shot>("medium");
  const [angle, setAngle] = useState<Angle>("eye");
  const [lens, setLens] = useState<Lens>(50);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
    const SH = { wide: { label: 'Wide', u: 2.2, txt: 'wide shot, full figure in its surroundings', code: 'WS' }, medium: { label: 'Medium', u: 5, txt: 'medium shot, framed from the waist up', code: 'MS' }, close: { label: 'Close-up', u: 9.5, txt: 'close-up on the face and shoulders', code: 'CU' } };
    const AN = { low: { label: 'Low', hz: 146, dy: -14, txt: 'low angle looking up', code: 'LOW' }, eye: { label: 'Eye level', hz: 112, dy: 0, txt: 'eye-level camera', code: 'EYE' }, high: { label: 'High', hz: 58, dy: 14, txt: 'high angle looking down', code: 'HIGH' } };
    const LN = { 24: { spread: 1.7, txt: '24mm wide-angle lens, expansive perspective' }, 35: { spread: 1.35, txt: '35mm lens, natural perspective' }, 50: { spread: 1, txt: '50mm standard lens' }, 85: { spread: 0.68, txt: '85mm portrait lens, compressed background' }, 135: { spread: 0.45, txt: '135mm telephoto, strongly compressed background' } };
    const hz = AN[angle].hz;
    const rect = (x: number, y: number, w: number, h: number) => 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'h' + w.toFixed(1) + 'v' + h.toFixed(1) + 'h' + (-w).toFixed(1) + 'z';

    // pixel figure, 10 x 16 grid; rows 4–9 are the jacket (accent)
    const G = ['...####...', '...####...', '...####...', '....##....', '..######..', '.########.', '#.######.#', '#.######.#', '#.######.#', '..######..', '..##..##..', '..##..##..', '..##..##..', '..##..##..', '..##..##..', '.###..###.'];
    const lensBoost = lens >= 85 ? 1.08 : lens <= 24 ? 0.92 : 1;
    const u = SH[shot].u * lensBoost;
    const figH = 16 * u, figW = 10 * u;
    let top;
    if (shot === 'wide') top = hz + 22 - figH; else if (shot === 'medium') top = 34; else top = 14;
    top += AN[angle].dy;
    const left = 160 - figW / 2;
    let figInk = '', figAcc = '';
    G.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== '#') continue;
        const d = rect(left + c * u, top + r * u, u + 0.2, u + 0.2);
        if (r >= 4 && r <= 9) figAcc += d; else figInk += d;
      }
    });

    // background trees: lens changes spacing and size (compression)
    const sp = LN[lens].spread;
    const ts = Math.min(3.2, 1 / sp) * 1.0;
    let trees = '', trunks = '';
    [-118, -64, 72, 128].forEach((dx, i) => {
      const x = 160 + dx * sp;
      const w = (i % 2 ? 22 : 30) * ts, h = (i % 2 ? 30 : 40) * ts;
      trees += rect(x - w / 2, hz - h - 6 * ts, w, h);
      trunks += rect(x - 2 * ts, hz - 6 * ts, 4 * ts, 6 * ts);
    });

    const prompt = SH[shot].txt.charAt(0).toUpperCase() + SH[shot].txt.slice(1) + ', ' + AN[angle].txt + ', ' + LN[lens].txt + '.';

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyLabel("Copied ✓");
    } catch { setCopyLabel("Try again"); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyLabel("Copy"), 1500);
  }
  return <div className="ff-lite">
    <div className="ff-topline"><span>TRY A LITE VERSION · 3 CONTROLS</span><span>FRAME 16:9</span></div>
    <div className="ff-preview">
      <svg role="img" aria-label={`Preview: ${prompt}`} viewBox="0 0 320 180">
        <rect width="320" height="180" fill="#FFFFFF" />
        <rect y={hz} width="320" height={180-hz} fill="#F1EFEA" />
        <path d={trees} fill="#9AA58E" /><path d={trunks} fill="#6E5430" />
        <rect y={hz} width="320" height="1" fill="#C9C6BE" />
        <path d={figInk} fill="#1C1B19" /><path d={figAcc} fill="#5B2A30" />
        <path d="M106.7 0V180M213.3 0V180M0 60H320M0 120H320" stroke="#5B2A30" strokeOpacity=".18" strokeWidth=".5" fill="none" />
        <path d="M6 6h12M6 6v12M314 6h-12M314 6v12M6 174h12M6 174v-12M314 174h-12M314 174v-12" stroke="#111111" fill="none" />
      </svg>
      <span className="ff-chip">{SH[shot].code} · {lens}MM · {AN[angle].code}</span>
    </div>
    <div className="ff-controls">
      <div className="ff-control"><span>SHOT</span><div className="ff-segments" role="group" aria-label="Shot size">{(["wide","medium","close"] as Shot[]).map(k=><button key={k} type="button" aria-pressed={k===shot} onClick={()=>setShot(k)}>{SH[k].label}</button>)}</div></div>
      <div className="ff-control"><span>ANGLE</span><div className="ff-segments" role="group" aria-label="Camera angle">{(["low","eye","high"] as Angle[]).map(k=><button key={k} type="button" aria-pressed={k===angle} onClick={()=>setAngle(k)}>{AN[k].label}</button>)}</div></div>
      <div className="ff-control ff-lens"><span>LENS</span><div className="ff-segments" role="group" aria-label="Lens focal length">{([24,35,50,85,135] as Lens[]).map(k=><button key={k} type="button" aria-pressed={k===lens} onClick={()=>setLens(k)}>{k}mm</button>)}</div></div>
    </div>
    <div className="ff-instruction"><div><span>INSTRUCTION</span><p aria-live="polite">{prompt}</p></div><button type="button" onClick={copy} aria-live="polite">{copyLabel}</button></div>
    <p className="ff-note">A simplified preview. The full library adds composition, movement and model-specific phrasing.</p>
  </div>;
}
