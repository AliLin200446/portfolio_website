'use client';
// 07 · Copy feedback. Label swaps to "Copied" for 1.5s; width is locked
// to the longer label so nothing around it shifts.

import { useEffect, useRef, useState } from 'react';

export function CopyEmail({
  email = 'alilin406@outlook.com',
  className = '',
}: {
  email?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed,setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      setFailed(true);
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`copy-btn ${className}`}
      style={{ minWidth: `${Math.max(email.length, 8) + 2}ch`, textAlign: 'left' }}
      aria-label={copied ? 'Email copied' : `Copy email ${email}`}
    >
      <span aria-live="polite">{copied ? 'Copied ✓' : failed ? 'Copy unavailable: ' + email : email}</span>
    </button>
  );
}
