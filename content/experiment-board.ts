import { experiments } from "./experiments";
/** Original portfolio images; Coodie retains its reference poster until an original is available. */
const existingPosters = [
  { id:'skeletal-silk', image:'/case-assets/skeletal-silk/hero-front.webp', objectPosition:'center', name:'Skeletal Silk', href:'https://skeletal-silk.alilinlab.com', left:26, top:8, width:17, rotation:1.6, ratio:'3 / 4', background:'#ECDCD1' },
  { id:'material-memory', image:'/experiments/material-memory.webp', objectPosition:'center', name:'Material Memory', href:'https://material-memory.alilinlab.com', left:58, top:6, width:22, rotation:-1.1, ratio:'3 / 2', background:'#D9DCDA' },
  { id:'cyber-i-ching', image:'/experiments/cyber-i-ching.webp', objectPosition:'center', name:'Cyber I Ching', href:'https://iching.alilinlab.com/', left:84, top:10, width:13, rotation:2.2, ratio:'3 / 4', background:'#151514' },
  { id:'resonance', image:'/experiments/resonance.webp', objectPosition:'center', name:'Resonance', href:'https://resonance.alilinlab.com', left:7, top:37, width:17, rotation:-1.6, ratio:'1 / 1', background:'#2E3A4A' },
  { id:'coodie', image:null, objectPosition:'center', name:'Coodie', href:'https://coodie.ai', left:74, top:39, width:16, rotation:1.3, ratio:'4 / 5', background:'#5B2A30' },
  { id:'arua-api', image:'/experiments/aura-api.webp', objectPosition:'center', name:'arua-api', href:'https://arua-api.alilinlab.com', left:33, top:47, width:18, rotation:-1.2, ratio:'3 / 2', background:'#E2E1DC' },
];

const restored = [
  { id:'tailors-time', name:"Tailor's Time", image:'/experiments/tailors-time/preview.png', href:'https://tailorstime.alilinlab.com', description:'A tailor’s clock built from thread, chalk, sound, and time.' },
  ...['RUNS','Project Lethe','Consensus Couture','Vestige'].map(name => {
    const source = experiments.find(item => item.name === name)!;
    return { id:name.toLowerCase().replaceAll(' ','-'), name, image:source.shot!, href:name === 'Vestige' ? 'https://vestige.alilinlab.com' : source.href!, description:source.line };
  }),
];
// Hand-set cluster placements; order and source assets are unchanged.
const composition: Record<string, {left:number;top:number;width:number;rotation:number;frame:boolean;fixing:string}> = {
 'tailors-time': {left:5,top:8,width:26,rotation:-1.1,frame:true,fixing:'pin-left'},
 'skeletal-silk': {left:27,top:43,width:10,rotation:1.3,frame:false,fixing:'tape'},
 'resonance': {left:3,top:49,width:16,rotation:.7,frame:true,fixing:'pin-right'},
 'coodie': {left:23,top:59,width:10,rotation:-3.2,frame:false,fixing:'none'},
 'material-memory': {left:56,top:7,width:16,rotation:-.8,frame:true,fixing:'pin-inset'},
 'cyber-i-ching': {left:70,top:6,width:10,rotation:1.1,frame:false,fixing:'pin-right'},
 'arua-api': {left:76,top:23,width:16,rotation:-1.3,frame:true,fixing:'tape'},
 'runs': {left:88,top:12,width:10,rotation:3.1,frame:false,fixing:'none'},
 'project-lethe': {left:57,top:58,width:16,rotation:-1.4,frame:true,fixing:'pin-left'},
 'consensus-couture': {left:70,top:72,width:10,rotation:1.2,frame:false,fixing:'tape'},
 'vestige': {left:59,top:78,width:10,rotation:.8,frame:true,fixing:'pin-inset'},
};
export const pinnedExperiments = [
 ...existingPosters,
 ...restored.map(item => ({...item, objectPosition:'center', left:0,top:0,width:0,rotation:0, ratio:item.id==='tailors-time'?'4 / 5':'3 / 2', background:'#e2e1dc'})),
].map(item => ({...item,...composition[item.id]}));
