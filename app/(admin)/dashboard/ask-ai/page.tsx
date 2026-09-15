'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MessageSquarePlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendFetch, backendJson } from '@/lib/backend';
import { timeAgo } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { AssistantChat } from '../../components/Assistant/AssistantChat';

interface ConversationSummary {
  conversation_id: string;
  title: string;
  updated_at: string;
}

function AskAiView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = params.get('c');
  const { userRole } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);

  const load = useCallback(() => {
    backendJson<ConversationSummary[]>('/api/conversations/')
      .then(setConversations)
      .catch(() => setConversations([]));
  }, []);

  useEffect(load, [load]);

  const open = (id: string | null) => router.replace(id ? `${pathname}?c=${id}` : pathname);

  const remove = async (id: string) => {
    const response = await backendFetch(`/api/conversations/${id}/`, { method: 'DELETE' });
    if (!response.ok) {
      toast.error(`Could not delete this conversation (${response.status})`);
      return;
    }
    if (id === active) open(null);
    load();
  };

  const onConversation = (id: string) => {
    if (id !== active) router.replace(`${pathname}?c=${id}`);
    load();
  };

  return (
    <div className="bg-main-bg flex h-full w-full overflow-hidden">
      <aside className="border-border-default flex w-72 shrink-0 flex-col border-r-[0.5px]">
        <div className="p-3">
          <button
            onClick={() => open(null)}
            className="border-border-default hover:bg-hover-surface flex w-full items-center gap-2 border-[0.5px] px-3 py-2 text-sm font-medium text-text-primary transition-colors"
          >
            <MessageSquarePlus className="h-4 w-4" /> New conversation
          </button>
        </div>
        <p className="px-5 pb-1 text-[11px] font-medium tracking-wide text-text-tertiary uppercase">Previous conversations</p>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {conversations === null && <p className="px-3 py-2 text-xs text-text-tertiary">Loading…</p>}
          {conversations?.length === 0 && <p className="px-3 py-2 text-xs text-text-tertiary">No conversations yet.</p>}
          {conversations?.map((c) => (
            <div
              key={c.conversation_id}
              className={`group flex items-center transition-colors ${c.conversation_id === active ? 'bg-hover-surface' : 'hover:bg-hover-surface'}`}
            >
              <button onClick={() => open(c.conversation_id)} className="min-w-0 flex-1 px-3 py-2 text-left">
                <span className="block truncate text-sm text-text-primary">{c.title}</span>
                <span className="block text-[11px] text-text-tertiary">{timeAgo(c.updated_at)}</span>
              </button>
              <button
                onClick={() => remove(c.conversation_id)}
                aria-label="Delete conversation"
                className="p-2 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">
        <AssistantChat conversationId={active} onConversation={onConversation} userRole={userRole ?? undefined} />
      </section>
    </div>
  );
}

export default function AskAiPage() {
  return (
    <Suspense fallback={null}>
      <AskAiView />
    </Suspense>
  );
}
