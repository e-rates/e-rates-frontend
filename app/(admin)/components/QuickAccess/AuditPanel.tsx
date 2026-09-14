'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { backendJson } from '@/lib/backend';

interface Summary {
  categories: { key: string; label: string; count: number }[];
  failed_logins_today: number;
}

export function AuditPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const active = useSearchParams().get('category') ?? '';

  useEffect(() => {
    backendJson<Summary>('/api/audit-logs/summary/').then(setSummary).catch(() => setSummary(null));
  }, []);

  const total = summary?.categories.reduce((sum, c) => sum + c.count, 0) ?? 0;
  const rows = [{ key: '', label: 'All events', count: total }, ...(summary?.categories ?? [])];

  return (
    <section className="border-border-default mt-2 border-t-[0.5px] pt-3">
      <p className="px-1 text-sm font-semibold text-text-primary">Audit log</p>
      {summary && summary.failed_logins_today > 0 && (
        <Link
          href="/dashboard/audit?category=auth&q=login_failed"
          className="mt-3 block border-[0.5px] border-red-500/40 px-3 py-2 text-xs text-red-600 dark:text-red-400"
        >
          {summary.failed_logins_today} failed sign-in{summary.failed_logins_today === 1 ? '' : 's'} today
        </Link>
      )}
      <ul className="divide-border-default mt-2 divide-y-[0.5px]">
        {rows.map((c) => (
          <li key={c.key || 'all'}>
            <Link
              href={c.key ? `/dashboard/audit?category=${c.key}` : '/dashboard/audit'}
              className={`flex items-center justify-between px-2 py-2.5 text-sm transition-colors ${
                active === c.key ? 'bg-hover-surface font-medium text-text-primary' : 'text-text-secondary hover:bg-hover-surface'
              }`}
            >
              {c.label}
              <span className="text-xs text-text-tertiary tabular-nums">{summary ? c.count : '—'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
