'use client';

import { useEffect, useState, useContext, createContext, useCallback } from 'react';
import { Sparkles, X } from 'lucide-react';
import { AssistantChat } from './AssistantChat';

/* ─── Global context so layout + button share open state ─────────────────── */
export const AiPanelContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function AiPanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AiPanelContext.Provider value={{ open, setOpen }}>
      {children}
    </AiPanelContext.Provider>
  );
}

/* ─── Header trigger button ───────────────────────────────────────────────── */
export function AskAiButton({ userRole }: { userRole?: string }) {
  const { open, setOpen } = useContext(AiPanelContext);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="squircle-lg flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      aria-label="Ask AI"
      aria-expanded={open}
      title="Ask the E-Rates assistant"
    >
      <Sparkles size={16} />
      <span>Ask AI</span>
    </button>
  );
}

/* ─── The inline panel itself — rendered inside the layout flex row ───────── */
export function AiPanel({ userRole }: { userRole?: string }) {
  const { open, setOpen } = useContext(AiPanelContext);

  return (
    <div
      className={`
        bg-main-bg border-border-default flex h-full flex-col border-l-[0.5px]
        transition-[width] duration-300 ease-in-out overflow-hidden shrink-0
        ${open ? 'w-[380px]' : 'w-0 border-l-0'}
      `}
      aria-hidden={!open}
    >
      {/* Only render content once we have width to avoid layout flash */}
      {open && (
        <>
          <div className="border-border-default flex shrink-0 items-center justify-between border-b-[0.5px] px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <Sparkles size={15} />
              Ask AI
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close AI panel"
              className="p-1.5 text-text-tertiary transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X size={16} />
            </button>
          </div>
          <AssistantChat compact userRole={userRole} />
        </>
      )}
    </div>
  );
}
