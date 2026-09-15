'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, Download, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { backendFetch } from '@/lib/backend';
import { downloadBlob } from '@/lib/format';

async function downloadPdf(href: string) {
  const toastId = toast.loading('Preparing download...');
  try {
    const res = await backendFetch(href);
    if (!res.ok) {
      let errMessage = `Download failed (${res.status})`;
      try {
        const errData = await res.json();
        if (errData.detail || errData.error) errMessage = errData.detail || errData.error;
      } catch {}
      throw new Error(errMessage);
    }
    const blob = await res.blob();
    const cd = res.headers.get('content-disposition') || '';
    const match = cd.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i);
    const target = new URL(href, window.location.origin);
    const fallback = target.searchParams.get('file') || 'report.pdf';
    const filename = (match && match[1]) ? match[1] : fallback;
    downloadBlob(blob, filename);
    toast.dismiss(toastId);
    toast.success('Downloaded successfully');
  } catch (e) {
    toast.dismiss(toastId);
    toast.error((e as Error).message || 'Failed to download PDF');
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'error';
  text: string;
  sources?: { tool: string; args: Record<string, unknown> }[];
}

interface StoredMessage {
  role: 'user' | 'assistant';
  text: string;
  sources?: ChatMessage['sources'];
  error?: string;
}

const TOOL_LABELS: Record<string, string> = {
  collections_summary: 'Collections',
  ward_summary: 'Ward summary',
  ward_parcels: 'Ward plots',
  defaulters: 'Defaulters',
  plot_lookup: 'Plot lookup',
  owner_lookup: 'Owner lookup',
  payments_in_period: 'Payment register',
  years_summary: 'Rating years',
  counties: 'Counties',
  generate_analysis_pdf: 'Executive Analysis (PDF)',
  generate_report_pdf: 'Official Report (PDF)',
};

const EXAMPLES_BY_ROLE: Record<string, string[]> = {
  admin: [
    'How many parcels have owners, and who are they?',
    'How much have we collected this year, by ward?',
    'Who has been overdue for more than 60 days?',
    'Show all years with unpaid bills',
    'Generate an executive analysis PDF report',
    'Show history of plot 935',
  ],
  auditor: [
    'Export arrears & defaulters report as PDF',
    'Show payments received this month',
    'How much revenue is outstanding this year?',
    'Who has been overdue for more than 90 days?',
  ],
  owner: [
    'Which counties do we have?',
    'Generate an executive analysis PDF',
    'Show all years with unpaid bills',
  ],
  default: [
    'How much have we collected this year?',
    'Who has been overdue for more than 60 days?',
  ],
};

const MD_CELL = 'border-border-default border-[0.5px] px-2.5 py-1.5 text-left align-top';

export function AssistantMarkdown({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm text-text-primary [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-[13px] tabular-nums">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-hover-surface">{children}</thead>,
          th: ({ children }) => <th className={`${MD_CELL} font-medium text-text-secondary`}>{children}</th>,
          td: ({ children }) => <td className={MD_CELL}>{children}</td>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-text-primary">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          code: ({ children }) => (
            <code className="bg-hover-surface px-1 py-0.5 font-mono text-[12px]">{children}</code>
          ),
          a: ({ children, href }) => {
            const isPdf = href && (href.includes('/ai-download/') || href.includes('.pdf'));
            if (isPdf) {
              return (
                <span className="my-2.5 flex flex-col justify-between gap-3 border border-neutral-300 bg-neutral-50 p-3 sm:flex-row sm:items-center dark:border-neutral-700 dark:bg-neutral-900/60">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-red-600 text-[10px] font-bold tracking-wider text-white">
                      PDF
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-text-primary">{children || 'Download PDF Report'}</span>
                      <span className="block text-[11px] text-text-tertiary">Generated by E-Rates AI · Ready for download</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadPdf(href)}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </button>
                </span>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-primary">
                {children}
              </a>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export function ThinkingIndicator() {
  return (
    <div className="self-stretch space-y-2 pl-4">
      <p className="text-xs text-text-tertiary">Looking up the data…</p>
      <div className="h-[2px] w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="h-full w-1/2 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #6366f1 40%, #a855f7 60%, transparent 100%)',
            animation: 'ai-shimmer 1.4s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}

const sourceLabel = (s: { tool?: string; args?: Record<string, unknown> } | string) => {
  if (typeof s === 'string') return s;
  if (!s || typeof s !== 'object') return String(s ?? '');
  const args = s.args && typeof s.args === 'object' ? s.args : {};
  const detail = Object.entries(args)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');
  const toolName = (s.tool && TOOL_LABELS[s.tool]) || s.tool || 'Database';
  return `${toolName}${detail ? ` · ${detail}` : ''}`;
};

const fromStored = (stored: StoredMessage[]): ChatMessage[] =>
  stored.flatMap((m) => [
    ...(m.text ? [{ role: m.role, text: m.text, sources: m.sources }] : []),
    ...(m.error ? [{ role: 'error' as const, text: m.error }] : []),
  ]);

export function AssistantChat({
  conversationId,
  onConversation,
  userRole,
}: {
  conversationId: string | null;
  onConversation: (id: string) => void;
  userRole?: string;
}) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const currentId = useRef<string | null | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId === currentId.current) return;
    currentId.current = conversationId;
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    backendJson<{ messages: StoredMessage[] }>(`/api/conversations/${conversationId}/`)
      .then((conversation) => setMessages(fromStored(conversation.messages)))
      .catch((e: Error) => setMessages([{ role: 'error', text: e.message }]))
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const send = async (preset?: string) => {
    const query = (preset ?? text).trim();
    if (!query || sending) return;
    const base = messages.length + 1;
    setMessages((m) => [...m, { role: 'user', text: query }]);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setSending(true);
    try {
      const response = await backendFetch('/api/llm/analyze/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, ...(currentId.current ? { conversation: currentId.current } : {}) }),
      });
      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({}));
        setMessages((m) => [...m, { role: 'error', text: body.error || body.detail || `Request failed (${response.status})` }]);
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let answer = '';
      let sources: ChatMessage['sources'] = [];
      let failure = '';
      for (;;) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split('\n');
        buffer = done ? '' : (lines.pop() ?? '');
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.conversation) {
            currentId.current = event.conversation;
            onConversation(event.conversation);
            continue;
          }
          if (event.sources) sources = event.sources;
          if (event.text) answer += event.text;
          if (event.error) failure = event.error;
        }
        const next: ChatMessage[] = [
          ...(answer ? [{ role: 'assistant' as const, text: answer, sources }] : []),
          ...(failure ? [{ role: 'error' as const, text: failure }] : []),
        ];
        setMessages((m) => [...m.slice(0, base), ...next]);
        if (done) break;
      }
      if (currentId.current) onConversation(currentId.current);
    } catch (error) {
      setMessages((m) => [...m, { role: 'error', text: (error as Error).message }]);
    } finally {
      setSending(false);
    }
  };

  const examples = EXAMPLES_BY_ROLE[userRole ?? 'default'] ?? EXAMPLES_BY_ROLE.default;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          {loading && <ThinkingIndicator />}
          {!loading && messages.length === 0 && (
            <div className="py-16">
              <div className="flex items-center gap-2 text-text-primary">
                <Sparkles className="h-5 w-5" />
                <p className="text-lg font-semibold">What would you like to know?</p>
              </div>
              <p className="mt-1 text-sm text-text-tertiary">
                Ask about parcels, owners, bills, collections or defaulters. Answers come from live E-Rates data.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    onClick={() => send(example)}
                    className="border-border-default hover:bg-hover-surface border-[0.5px] px-3 py-2.5 text-left text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message, i) =>
            message.role === 'user' ? (
              <div key={i} className="bg-hover-surface max-w-[80%] self-end px-4 py-2.5 text-sm text-text-primary">
                {message.text}
              </div>
            ) : (
              <div key={i} className="self-stretch">
                <div
                  className={`border-l-2 pl-4 text-sm ${
                    message.role === 'error'
                      ? 'border-red-600 whitespace-pre-wrap text-red-700 dark:text-red-400'
                      : 'border-text-primary text-text-primary'
                  }`}
                >
                  {message.role === 'error' ? message.text : <AssistantMarkdown text={message.text} />}
                </div>
                {!!message.sources?.length && (
                  <p className="mt-2 pl-4 text-[11px] text-text-tertiary">From: {message.sources.map(sourceLabel).join(' · ')}</p>
                )}
              </div>
            )
          )}
          {sending && messages[messages.length - 1]?.role === 'user' && <ThinkingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-border-default w-full shrink-0 border-t-[0.5px] px-6 py-4">
        <div className="border-border-default focus-within:border-text-tertiary mx-auto flex max-w-4xl items-end gap-3 border-[0.5px] px-3 py-2 text-[14px] text-text-primary transition-colors">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask the E-Rates assistant"
            rows={1}
            className="max-h-[200px] w-full flex-1 resize-none bg-transparent py-2 placeholder:text-text-tertiary focus:outline-none"
          />
          <button
            onClick={() => send()}
            disabled={!text.trim() || sending}
            aria-label="Send"
            className="mb-1 bg-text-primary p-2 text-main-bg transition-opacity disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mx-auto mt-1.5 max-w-4xl text-[10px] text-text-tertiary">
          Answers can be wrong. Check figures against Reports before acting on them.
        </p>
      </div>
    </div>
  );
}
