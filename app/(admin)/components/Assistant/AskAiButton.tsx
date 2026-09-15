'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function AskAiButton() {
  return (
    <Link
      href="/dashboard/ask-ai"
      className="squircle-lg flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      title="Ask the E-Rates assistant"
    >
      <Sparkles size={16} />
      <span>Ask AI</span>
    </Link>
  );
}
