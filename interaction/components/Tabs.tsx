'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
export type TabItem = { href: string; label: string };
export function Tabs({ items }: { items: TabItem[] }) {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);
  const [ink, setInk] = useState({left:0,width:0});
  const active = items.findIndex(t => t.href === '/' ? pathname === '/' || pathname.startsWith('/work/') : pathname === t.href || pathname.startsWith(t.href+'/'));
  useEffect(() => {
    const update = () => { const el=nav.current?.querySelector<HTMLElement>('[aria-current="page"]'); if(!el||!nav.current) return; setInk({left:el.offsetLeft,width:el.offsetWidth}); nav.current.scrollLeft=Math.max(0,el.offsetLeft-16); };
    update(); const ro=new ResizeObserver(update); if(nav.current) ro.observe(nav.current); return ()=>ro.disconnect();
  },[pathname,active]);
  return <nav ref={nav} aria-label="Primary" className="tab-navigation interaction-tabs">{items.map((t,i)=><Link key={t.href} href={t.href} aria-current={i===active?'page':undefined}>{t.label}</Link>)}<span className="interaction-ink" aria-hidden="true" style={ink}/></nav>;
}
