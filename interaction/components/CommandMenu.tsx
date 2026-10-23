'use client';
// 13b · ⌘K command menu. Native <dialog> (focus trap + Esc for free).
// Only worth shipping with real content: pages, projects, copy email, résumé.

import { expandedProjects } from '@/content/projects-expanded';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

export type Command =
  | { id: string; label: string; hint?: string; group: string; href: string; external?: boolean }
  | { id: string; label: string; hint?: string; group: string; run: () => void | Promise<void> };

export function CommandMenu({ commands }: { commands: Command[] }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const [status,setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.group} ${c.hint ?? ''}`.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(''), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const open = () => {
    const d = dialog.current;
    if (!d || d.open) return;
    if(document.querySelector('dialog[open]')) return;
    origin.current=document.activeElement as HTMLElement;
    setQuery(''); setActive(0);
    d.showModal();
    requestAnimationFrame(() => input.current?.focus());
  };
  const close = () => dialog.current?.close();

  // ⌘K / Ctrl+K toggles from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialog.current?.open) close();
        else open();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-menu', open);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-command-menu', open); };
  }, []);

  const runCommand = async (c: Command) => {
    close();
    if ('href' in c) {
      if (c.external) window.open(c.href, '_blank', 'noopener,noreferrer');
      else router.push(c.href);
    } else {
      try { await c.run(); setStatus(c.id === 'a-email' ? 'Email copied' : 'Done'); } catch { setStatus('Could not copy. Email: alilin406@outlook.com'); }
    }
  };

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.max(0, Math.min(results.length - 1, i + 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      void runCommand(results[active]);
    }
  };

  const listId = 'cmdk-list';

  useEffect(() => { document.getElementById(`cmdk-${results[active]?.id}`)?.scrollIntoView({block:'nearest'}); },[active,results]);

  return (
    <><span className="interaction-status" role="status">{status}</span><dialog
      ref={dialog}
      className="cmdk"
      aria-label="Command menu"
      onClose={()=>origin.current?.focus()}
      onClick={(e) => {
        if (e.target === dialog.current) close(); // click on backdrop
      }}
    >
      <button className="cmdk-close" onClick={close} aria-label="Close command menu">Close / Esc</button>
      <input
        ref={input}
        className="cmdk__input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onInputKey}
        placeholder="Jump to a project, page or action…"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={results[active] ? `cmdk-${results[active].id}` : undefined}
        aria-label="Search commands"
      />
      <ul id={listId} role="listbox" className="cmdk__list">
        {results.map((c, i) => (
          <li
            key={c.id}
            id={`cmdk-${c.id}`}
            role="option"
            aria-selected={i === active}
            className="cmdk__item"
            onMouseMove={() => setActive(i)}
            onClick={() => void runCommand(c)}
          >
            <span>{c.label}</span>
            <span className="cmdk__hint">{c.hint ?? c.group}</span>
          </li>
        ))}
        {results.length === 0 ? (
          <li className="cmdk__item" role="option" aria-selected="false" aria-disabled="true">
            <span className="cmdk__hint">No matches</span>
          </li>
        ) : null}
      </ul>
      <div className="cmdk__foot" aria-hidden="true">
        <span>↑↓ move</span>
        <span>↵ open</span>
        <span>esc close</span>
      </div>
    </dialog></>
  );
}

/** Example command set — replace hrefs with your real routes. */
export const defaultCommands: Command[] = [
  { id:'g-projects', group:'Pages', label:'Projects', href:'/' },
  ...expandedProjects.map(project => ({ id: `p-${project.id}`, group: 'Projects', label: project.name, hint: project.discipline, href: project.href ?? `/#${project.id}` })),
  { id: 'g-experiments', group: 'Pages', label: 'Experiments', href: '/experiments' },
  { id: 'g-generative', group: 'Pages', label: 'Generative', href: '/generative' },
  { id: 'g-photography', group: 'Pages', label: 'Photography', href: '/photography' },
  { id: 'g-about', group: 'Pages', label: 'About', href: '/about' },
  {
    id: 'a-email', group: 'Actions', label: 'Copy email', hint: 'alilin406@outlook.com',
    run: () => navigator.clipboard.writeText('alilin406@outlook.com'),
  },
  { id: 'a-resume', group: 'Actions', label: 'Resume', hint: 'Web edition', href: '/about#resume-title' },
  { id: 'a-github', group: 'Actions', label: 'GitHub', href: 'https://github.com/AliLin200446', external: true },
];
