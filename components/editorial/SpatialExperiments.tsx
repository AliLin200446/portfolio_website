'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { experiments, type Experiment } from '@/lib/experiments';

type Drag = { down: boolean; moved: boolean; x: number; y: number; vx: number; vy: number; yaw: number; pitch: number; ring: number; last: number };
type Node = { sphere: THREE.Vector3; position: THREE.Vector3; from: THREE.Vector3; target: THREE.Vector3; opacity: number; fromOpacity: number; scale: number };
const related = (a: Experiment, b: Experiment) => a.tags.some(tag => b.tags.includes(tag));
// Invert cubic-bezier(.6,0,.2,1) without allocating objects in the frame loop.
function ease(x: number) {
  let lo = 0, hi = 1, t = x;
  for (let i = 0; i < 12; i++) { t = (lo + hi) / 2; const p = 1.8*t*(1-t)*(1-t)+.6*t*t*(1-t)+t*t*t; if(p<x) lo=t; else hi=t; }
  return 3*t*t-2*t*t*t;
}
function Poster({ item, node, index, active, setActive, choose, drag }: { item: Experiment; node: Node; index: number; active: string | null; setActive: (s:string|null)=>void; choose:(s:string)=>void; drag:MutableRefObject<Drag> }) {
  const sprite = useRef<THREE.Sprite>(null);
  const label = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let disposed = false;
    const loader = new THREE.TextureLoader();
    const loaded = loader.load(item.image, t => {
      if (disposed) { t.dispose(); return; }
      t.colorSpace = THREE.SRGBColorSpace; setTexture(t);
    });
    return () => { disposed = true; loaded.dispose(); };
  }, [item.image]);
  useEffect(() => { if (sprite.current) sprite.current.material.needsUpdate = true; }, [texture]);
  const size = useThree(s => s.size);
  const image = texture?.image as HTMLImageElement | undefined;
  const ratio = image ? image.width / image.height : 1;
  const long = Math.min(size.width,size.height)*.19;
  const width = ratio >= 1 ? long : long*ratio;
  const height = ratio >= 1 ? long/ratio : long;
  useFrame(() => {
    if (!sprite.current) return;
    sprite.current.position.copy(node.position);
    sprite.current.scale.set(width*node.scale,height*node.scale,1);
    sprite.current.material.opacity = texture ? node.opacity : 0;
    sprite.current.renderOrder = Math.round(node.position.z*100)+10000+index;
    if(label.current) { label.current.position.copy(node.position); label.current.position.y -= height*node.scale/2+12; }
  }, 0);
  return <>
    <sprite ref={sprite} onPointerOver={e=>{e.stopPropagation();if(!drag.current.down)setActive(item.id);}} onPointerOut={()=>setActive(null)} onClick={e=>{e.stopPropagation();if(!drag.current.moved)window.open(item.href,'_blank','noopener,noreferrer');}}>
      <spriteMaterial map={texture} transparent depthWrite={false} depthTest={false} />
    </sprite>
    {active === item.id && <group ref={label}><Html center zIndexRange={[10,1]}><div className="spatial-label" onPointerEnter={()=>setActive(item.id)} onPointerLeave={()=>setActive(null)}>E.{item.no} {item.title} ↗<div>{item.tags.map(tag=><button key={tag} onClick={()=>choose(tag)}>{tag}</button>)}</div></div></Html></group>}
  </>;
}
function Connection({ a,b,nodes,highlight }: {a:number;b:number;nodes:Node[];highlight:boolean}) {
  const resource = useMemo(()=>{
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
    geometry.setAttribute('lineDistance',new THREE.BufferAttribute(new Float32Array(2),1));
    const material = new THREE.LineDashedMaterial({color:'#C9C6BE',transparent:true,opacity:.45,dashSize:3,gapSize:5,depthTest:false,depthWrite:false});
    return {geometry,material,line:new THREE.Line(geometry,material)};
  },[]);
  useEffect(()=>()=>{resource.geometry.dispose();resource.material.dispose();},[resource]);
  useFrame(()=>{
    const p=resource.geometry.attributes.position as THREE.BufferAttribute;
    p.setXYZ(0,nodes[a].position.x,nodes[a].position.y,nodes[a].position.z);
    p.setXYZ(1,nodes[b].position.x,nodes[b].position.y,nodes[b].position.z);p.needsUpdate=true;
    const d=resource.geometry.attributes.lineDistance as THREE.BufferAttribute;d.setX(1,nodes[a].position.distanceTo(nodes[b].position));d.needsUpdate=true;
    resource.material.color.set(highlight?'#5B2A30':'#C9C6BE');
    resource.material.opacity=Math.min(nodes[a].opacity,nodes[b].opacity)*.55;
  });
  return <primitive object={resource.line} renderOrder={-1} dispose={null} />;
}
function Scene({tag,active,setActive,choose,reduced,drag,entered,onFailure}:{tag:string|null;active:string|null;setActive:(s:string|null)=>void;choose:(s:string)=>void;reduced:boolean;drag:MutableRefObject<Drag>;entered:MutableRefObject<boolean>;onFailure:()=>void}) {
  const gl = useThree(s=>s.gl);
  useEffect(()=>{const canvas=gl.domElement;canvas.addEventListener("webglcontextlost",onFailure);return()=>canvas.removeEventListener("webglcontextlost",onFailure);},[gl,onFailure]);
  const size=useThree(s=>s.size);
  const nodes=useMemo<Node[]>(()=>experiments.map((_,i)=>{
    const y=1-2*(i+.5)/experiments.length, r=Math.sqrt(1-y*y),theta=i*Math.PI*(3-Math.sqrt(5));
    return {sphere:new THREE.Vector3(Math.cos(theta)*r,y,Math.sin(theta)*r),position:new THREE.Vector3(),from:new THREE.Vector3(),target:new THREE.Vector3(),opacity:0,fromOpacity:0,scale:0};
  }),[]);
  const edges=useMemo(()=>experiments.flatMap((a,i)=>experiments.slice(i+1).flatMap((b,j)=>related(a,b)?[[i,i+j+1]]:[])),[]);
  const start=useRef<number|null>(null);
  const transition=useRef(-Infinity);
  const previousTag=useRef<string|null>(null);
  const rotation=useMemo(()=>new THREE.Euler(),[]);
  const highlighted=useMemo(()=>experiments.map(p=>p.id===active || (!!active&&related(p,experiments.find(x=>x.id===active)!))),[active]);
  const members=useMemo(()=>experiments.map((p,i)=>p.tags.includes(tag??'')?i:-1).filter(i=>i>=0),[tag]);
  useEffect(()=>{
    if(previousTag.current===tag)return;
    nodes.forEach(n=>{n.from.copy(n.position);n.fromOpacity=n.opacity;});
    previousTag.current=tag; transition.current=performance.now();drag.current.last=performance.now();drag.current.ring=0;
  },[tag,nodes,drag]);
  useFrame((_,dt)=>{
    dt=Math.min(dt,.05);
    const now=performance.now(); if(start.current===null){start.current=entered.current?-Infinity:now;entered.current=true;}
    const radius=Math.min(size.width,size.height)*.38;
    const input=drag.current;
    if(!reduced&&!input.down){
      if(tag) input.ring+=input.vx*dt;
      else {input.yaw+=input.vx*dt;input.pitch+=input.vy*dt;if(now-input.last>3000)input.yaw+=.06*dt;}
      input.vx*=Math.exp(-5*dt);input.vy*=Math.exp(-5*dt);
    }
    rotation.set(input.pitch,input.yaw,0);
    for(let i=0;i<nodes.length;i++){
      const node=nodes[i]; const rank=members.indexOf(i);
      node.target.copy(node.sphere).multiplyScalar(radius).applyEuler(rotation);
      if(tag&&rank>=0){const angle=rank/Math.max(1,members.length)*Math.PI*2+input.ring;node.target.set(Math.cos(angle)*radius*.76,Math.sin(angle)*radius*.76,20);}
      const elapsed=now-transition.current;
      const fly=reduced?1:ease(THREE.MathUtils.clamp((elapsed-(tag?200:0)-Math.max(rank,0)*20)/800,0,1));
      if(fly<1)node.position.copy(node.from).lerp(node.target,fly);else node.position.copy(node.target);
      const entrance=reduced?1:ease(THREE.MathUtils.clamp((now-start.current-i*15)/700,0,1));
      node.position.multiplyScalar(entrance);
      const depth=THREE.MathUtils.clamp((node.position.z/radius+1)/2,0,1);
      let opacity=.35+.65*depth;
      if(tag){const fade=Math.min(1,elapsed/200);opacity=rank>=0?(reduced?THREE.MathUtils.lerp(node.fromOpacity,1,fade):elapsed<200?THREE.MathUtils.lerp(node.fromOpacity,.1,fade):THREE.MathUtils.lerp(.1,1,fly)):THREE.MathUtils.lerp(node.fromOpacity,.1,fade);}
      else if(elapsed<1000) opacity=THREE.MathUtils.lerp(node.fromOpacity,opacity,reduced?Math.min(1,elapsed/200):fly);
      if(active)opacity=highlighted[i]?1:.3;
      node.opacity=opacity*entrance;
      node.scale=(tag&&rank>=0?1:.7+.3*depth)*entrance*(active===experiments[i].id?1.12:1);
    }
  },-1);
  return <>{edges.map(([a,b])=><Connection key={`${a}-${b}`} a={a} b={b} nodes={nodes} highlight={!!active&&(experiments[a].id===active||experiments[b].id===active)} />)}{experiments.map((item,i)=><Poster key={item.id} item={item} index={i} node={nodes[i]} active={active} setActive={setActive} choose={choose} drag={drag}/>)}</>;
}
export default function SpatialExperiments({onFailure,entered}:{onFailure:()=>void;entered:MutableRefObject<boolean>}) {
  const stage=useRef<HTMLDivElement>(null);
  const drag=useRef<Drag>({down:false,moved:false,x:0,y:0,vx:0,vy:0,yaw:0,pitch:.15,ring:0,last:0});
  const [running,setRunning]=useState(false);
  const [seen,setSeen]=useState(false);
  const [reduced,setReduced]=useState(false);
  const [active,updateActive]=useState<string|null>(null);
  const hoverTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const setActive=(id:string|null)=>{if(hoverTimer.current)clearTimeout(hoverTimer.current);if(id)updateActive(id);else hoverTimer.current=setTimeout(()=>updateActive(null),180);};
  useEffect(()=>()=>{if(hoverTimer.current)clearTimeout(hoverTimer.current);},[]);
  const [tag,setTag]=useState<string|null>(null);
  const tags=useMemo(()=>[...new Set(experiments.flatMap(p=>p.tags))],[]);
  const choose=(value:string)=>setTag(current=>current===value?null:value);
  useEffect(()=>{
    const motion=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(motion.matches);update();motion.addEventListener('change',update);
    let visible=false;
    const visibility=()=>setRunning(visible&&!document.hidden);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)setSeen(true);visibility();});
    if(stage.current)observer.observe(stage.current);
    document.addEventListener('visibilitychange',visibility);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',update);};
  },[]);
  return <div onKeyDown={e=>{if(e.key==='Escape'){setTag(null);setActive(null);}}}>
    {tags.length>0&&<div className="spatial-tags" aria-label="Gather experiments by tag">{tags.map(t=><button key={t} aria-pressed={tag===t} onClick={()=>choose(t)}>{t}</button>)}</div>}
    <div ref={stage} className="spatial-stage" onPointerDown={e=>{if(e.button!==0||(e.target as HTMLElement).closest('button,a'))return;const d=drag.current;setActive(null);d.down=true;d.moved=false;d.x=e.clientX;d.y=e.clientY;d.vx=0;d.vy=0;}} onPointerMove={e=>{const d=drag.current;if(!d.down)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>2){d.moved=true;e.currentTarget.setPointerCapture(e.pointerId);}d.x=e.clientX;d.y=e.clientY;d.last=performance.now();if(tag)d.ring+=dx*.005;else{d.yaw+=dx*.005;d.pitch=THREE.MathUtils.clamp(d.pitch+dy*.005,-1,1);}d.vx=dx*.15;d.vy=dy*.15;}} onPointerUp={e=>{drag.current.down=false;drag.current.last=performance.now();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>{drag.current.down=false;drag.current.vx=0;drag.current.vy=0;}}>
      {seen&&<Canvas aria-hidden="true" orthographic camera={{position:[0,0,1000],near:.1,far:2000,zoom:1}} dpr={[1,1.75]} frameloop={running?'always':'never'}>
        <Scene tag={tag} active={active} setActive={setActive} choose={choose} reduced={reduced} drag={drag} entered={entered} onFailure={onFailure}/>
      </Canvas>}
      {tag&&<button className="spatial-centre" onClick={()=>setTag(null)} aria-label={`Release ${tag}`}>{tag}</button>}
      <ul className="spatial-keyboard" aria-label="Spatial experiments">{experiments.map(item=><li key={item.id}><a href={item.href} target="_blank" rel="noopener noreferrer" onFocus={()=>setActive(item.id)} onBlur={()=>setActive(null)}>E.{item.no} {item.title} ↗ {item.tags.join(', ')}</a></li>)}</ul>
    </div>
    <footer className="spatial-footer"><span>{String(experiments.length).padStart(2,'0')} experiments</span><span>© 2026 Ali Lin Lab LLC</span></footer>
  </div>;
}
