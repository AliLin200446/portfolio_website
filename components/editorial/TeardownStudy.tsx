'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import teardown from '@/content/cases/teardown';
import { LatencyAnatomy, StepDelta, StepFit, SeedDeterminism } from '@/components/case/TeardownFigures';

const sections = ['Question', 'Instrumentation', 'Measurements', 'Key decisions', 'Findings', 'Designed / Built', 'Next teardown'];
const metrics = [
  { name:'Inference', ms:'533', sd:'9.9', description:'The inference segment reported in the existing latency study.' },
  { name:'Queue', ms:'250.5', sd:'277.0', description:'The waiting segment not returned in the API response body.' },
  { name:'Network', ms:'0', sd:'0.5', description:'The network segment as recorded by this study; not a claim of zero physical network latency.' },
];
const figures = [
  { title:'Latency anatomy', caption:'Measured segment p50 and standard deviation · n = 20 at S28', source:'e4-latency/stats.md', Component:LatencyAnatomy },
  { title:'Inference against steps', caption:'Ten measured rungs and the published linear fit', source:'e4-latency/stats.md', Component:StepFit },
  { title:'Adjacent step differences', caption:'Changed pixels, Δ > 32 · one image pair per comparison', source:'_tools/adjacent-diffs.txt', Component:StepDelta },
  { title:'Seed determinism', caption:'Three runs · one SHA-256 · 512 × 512 pixels', source:'e3-seed/report.txt', Component:SeedDeterminism },
];
const decisions = [
  ['Measure the integration path','The harness reaches a hosted API from the browser, as an integrator would.','These results describe this integration and model, not every deployment.'],
  ['Separate timing from image change','Latency, step sweeps, guidance sweeps and seed comparisons answer different questions.','A faster response is not itself a measure of image quality.'],
  ['Publish the measurement scope','The latency series, step comparisons and repeated seed runs have different sample sizes.','A small study supports specific observations, not universal guarantees.'],
];
function Section({ index, children }: { index:number; children:React.ReactNode }) {
  return <section id={`t${index}`} className="study-section"><div className="study-section-label"><h2>{sections[index-1]}</h2><span>0{index}</span></div><div className="case-section-body">{children}</div></section>;
}
export default function TeardownStudy() {
  const [metric,setMetric] = useState(0), [experiment,setExperiment] = useState(0), [active,setActive] = useState('t1'), [zoom,setZoom] = useState<number|null>(null);
  const dialog = useRef<HTMLDialogElement>(null), origin = useRef<HTMLButtonElement|null>(null);
  const methods = teardown.sections.methods!.items;
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(visible[0]) setActive(visible[0].target.id);
    },{rootMargin:'-10% 0px -55% 0px'});
    document.querySelectorAll('.teardown-study .study-section').forEach(el=>observer.observe(el));
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(zoom===null) return;
    dialog.current?.showModal();
    const overflow=document.body.style.overflow; document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=overflow;};
  },[zoom]);
  const ZoomFigure = zoom === null ? null : figures[zoom].Component;
  return <div className="case-bespoke latent-study teardown-study">
    <div className="study-breadcrumb"><nav aria-label="Breadcrumb"><Link href="/">Projects</Link><span>/</span><span aria-current="page">02 Teardown №1</span></nav><span>02 / 04</span><Link href="/work/latent" aria-label="Previous project: Latent">←</Link><Link href="/#preserve" aria-label="Next project: Preserve">→</Link><Link href="/" aria-label="Return to projects">×</Link></div>
    <main id="main-content" className="case-layout"><aside className="case-rail"><nav aria-label="Case study contents"><Link href="/" className="case-back">← Back to Projects</Link>{sections.map((name,i)=><a key={name} href={`#t${i+1}`} aria-current={active===`t${i+1}`?'location':undefined} onClick={()=>setActive(`t${i+1}`)}><span>{name}</span><span>0{i+1}</span></a>)}</nav></aside><div className="case-article">
      <section className="study-title"><div><h1 style={{viewTransitionName:'title-teardown'}}>Teardown №1</h1><p>A measurement study of a hosted image generation API, built to turn “it feels fast” <em>into numbers.</em></p></div><dl><div><dt>subject</dt><dd>fal-ai/flux/dev</dd></div><div><dt>work</dt><dd>Measurement harness & report</dd></div><div><dt>scope</dt><dd>47 calls · 5 experiments</dd></div><div><dt>status</dt><dd><i />Shipped · 2026</dd></div></dl><a className="study-live-link" href="https://teardown.alilinlab.com">teardown.alilinlab.com <span>↗</span></a></section>
      <section className="td-hero" aria-label="Measurement instrument"><figure><video controls playsInline preload="none" poster="/case-assets/teardown/teardown-demo-poster.webp" aria-label="Recorded Teardown measurement harness"><source src="/case-assets/teardown/teardown-demo.mp4" type="video/mp4" /></video><figcaption>Fig. 01 · The measurement harness · recorded demonstration</figcaption></figure><div className="td-readout"><div className="td-readout-label">Latency series <span>p50 · n = 20</span></div><div className="td-reading" aria-live="polite"><strong>{metrics[metric].ms}<small> ms</small></strong><span>{metrics[metric].name.toLowerCase()} at p50</span><p>{metrics[metric].description}</p><span className="study-small">Standard deviation: {metrics[metric].sd} ms</span></div><div className="td-chips" role="group" aria-label="Latency segment">{metrics.map((m,i)=><button key={m.name} aria-pressed={metric===i} onClick={()=>setMetric(i)}>{m.name}</button>)}</div></div></section>
      <div className="study-body"><div>
        <Section index={1}><div className="study-prose"><p className="study-lead">A benchmark answers which model is better. What happens inside the one you already chose?</p><p>{teardown.sections.what}</p><p>{Array.isArray(teardown.sections.who) ? teardown.sections.who.join(' ') : teardown.sections.who}</p></div></Section>
        <Section index={2}><div className="study-prose"><p>47 structured calls across five experiments, with measurements logged to disk. Select an experiment to see the question it asks.</p></div><div className="study-passes" role="group" aria-label="Measurement experiments">{methods.map((method,i)=><button key={method.name} aria-pressed={experiment===i} onClick={()=>setExperiment(i)} onMouseEnter={()=>setExperiment(i)} onFocus={()=>setExperiment(i)}><span>E{i+1}</span>{method.name}</button>)}</div><p className="study-pass-description" aria-live="polite">{methods[experiment].question}?</p><div className="study-code"><span>Study method / reading order</span><pre><code>{'sweep → diff → time → log → publish\n\nstep sweep       / image change + inference time\nguidance sweep   / adjacent image differences\nseed repeats     / hashes + pixel differences\nlatency series   / segment timing + variability\nfriction log     / documentation versus behavior'}</code></pre><p>Method summary from the existing case study, not a source-code excerpt.</p></div></Section>
        <Section index={3}><div className="study-prose"><p>Segment timings and image differences are separate measurements. The figures below preserve the recorded values and sample sizes from the existing report.</p><p className="study-small">Segment medians cannot be added to obtain end-to-end p50. End-to-end p95/p99 and the sampling window are not documented in the local case-study data.</p></div><div className="td-figures">{figures.map(({title,caption,source,Component},i)=><figure key={title}><div className="td-figure-heading"><h3>{title}</h3><button aria-label={`Enlarge ${title}`} onClick={e=>{origin.current=e.currentTarget;setZoom(i);}}>Enlarge ↗</button></div><Component /><figcaption>Fig. 0{i+2} · {caption}<span>Source cited in the existing report: {source}</span></figcaption></figure>)}</div></Section>
        <Section index={4}><div className="study-decisions"><div className="study-decision-head"><span>No.</span><span>Decision</span><span>Why</span><span>Trade-off</span></div>{decisions.map(([decision,why,cost],i)=><div key={decision}><span>D{i+1}</span><h3>{decision}</h3><p><small>Why</small>{why}</p><p><small>Trade-off</small>{cost}</p></div>)}</div></Section>
        <Section index={5}><div className="study-results"><div><strong>277<small> ms</small></strong><span>Queue standard deviation</span></div><div><strong>9.9<small> ms</small></strong><span>Inference standard deviation</span></div><div><strong>0</strong><span>Different pixels in the seed repeats</span></div></div><div className="study-prose">{teardown.sections.findings!.items.map((finding,i)=><div key={finding.name}><h3 className="td-finding-title">F{i+1} / {finding.name}</h3><p>{finding.body}</p></div>)}</div></Section>
        <Section index={6}><div className="study-contributions"><div><h3>Designed</h3><p>The interactive report and its reading order: questions, measurement methods, figures and findings.</p></div><div><h3>Built</h3><p>A browser-based measurement harness using TypeScript, React and the fal API, with five experiments and measurements logged to disk.</p></div></div></Section>
        <Section index={7}><div className="study-prose"><p>{teardown.coda}</p><p className="study-small">The next subject has not been announced in this case study.</p></div></Section>
      </div></div><Link className="study-next" href="/#preserve"><div><span>Next project · 03</span><strong>Preserve</strong></div><span>→</span></Link>
    </div></main>
    <dialog ref={dialog} className="study-dialog td-dialog" aria-label={zoom===null?'Measurement figure':figures[zoom].title} onClose={()=>{setZoom(null);origin.current?.focus();}}><button autoFocus onClick={()=>dialog.current?.close()}>Close / Esc</button>{ZoomFigure && <div><ZoomFigure /></div>}</dialog>
  </div>;
}
