'use client';
import { InspectMode } from './InspectMode';
import { CommandMenu, defaultCommands } from './CommandMenu';
import { ViewTransitionResolver } from './ViewTransitions';
import { useListNav } from '../lib/useListNav';
export default function InteractionProvider({children}:{children:React.ReactNode}) {
  useListNav();
  return <InspectMode>{children}<ViewTransitionResolver/><CommandMenu commands={defaultCommands}/></InspectMode>;
}
export function CommandToggle(){return <button className="interaction-command-toggle" aria-label="Open command menu" aria-keyshortcuts="Meta+K Control+K" onClick={()=>window.dispatchEvent(new Event('open-command-menu'))}>⌘K</button>;}
