'use client';
import { useEffect, useRef } from 'react';
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('button,input,select')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const elements = ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select,textarea,a[href],summary');
      const visible = elements && Array.from(elements).filter(e => e.getClientRects().length);
      if (!visible?.length) return;
      const first = visible[0], last = visible[visible.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); before?.focus(); };
  }, [onClose]);
  return <div className="fixed inset-0 z-[100] bg-on-surface/40 p-3 sm:p-6 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl bg-white shadow-xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5"><h2 className="text-lg font-semibold">{title}</h2><button type="button" aria-label="Close dialog" className="btn-secondary" onClick={onClose}>✕</button></div>{children}
    </div>
  </div>;
}
