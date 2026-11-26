"use client";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { experiments } from "@/lib/experiments";
const Spatial = dynamic(() => import("./SpatialExperiments"), { ssr: false });
class SpatialBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function ExperimentsViews() {
  const entered = useRef(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const onFailure = useCallback(() => setAvailable(false), []);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    try {
      const gl = canvas.getContext("webgl2");
      setAvailable(!!gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { setAvailable(false); }
  }, []);
  return <>
    <header className="experiments-view-controls">
      <h1>Experiments</h1>
      <p>{available === false ? "Explore the experiments below." : "Drag to rotate · select a project to explore"}</p>
    </header>
    {available === true && <SpatialBoundary onFailure={onFailure}><Spatial entered={entered} onFailure={onFailure} /></SpatialBoundary>}
    {available !== true && <ul className="spatial-fallback" aria-label="Experiments">{experiments.map(item => <li key={item.id}><a href={item.href} target="_blank" rel="noopener noreferrer">E.{item.no} {item.title} ↗</a></li>)}</ul>}
  </>;
}
