'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Download, ShieldAlert, ShieldCheck, ScrollText } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendJson } from '@/lib/backend';
import { downloadCSV, today } from '@/lib/format';
import { EmptyState } from '../../components/EmptyState';

interface AuditEntry {
  audit_id: number;
  who_username: string | null;
  action: string;
  category: 'auth' | 'parcel' | 'payment' | string;
  summary: string;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown> | null;
  integrity_verified: boolean;
  created_at: string;
}

interface Page<T> {
  count: number;
  next: string | null;
  results: T[];
}

export const AUDIT_CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'auth', label: 'Logins & accounts' },
  { key: 'parcel', label: 'Parcel allocations' },
  { key: 'payment', label: 'Payments' },
];

const CATEGORY_LABEL: Record<string, string> = { auth: 'Login', parcel: 'Allocation', payment: 'Payment' };
const ALERT_ACTIONS = new Set(['auth.login_failed', 'auth.login_locked', 'payment.failed', 'payment.amount_mismatch']);

const CELL = 'px-5 py-2.5 whitespace-nowrap';
const HEAD = 'bg-main-bg sticky top-0 z-10 text-left text-[11px] font-medium tracking-wide text-text-tertiary uppercase';
const control = 'border-border-default bg-main-bg border-[0.5px] px-2.5 py-1.5 text-sm text-text-primary';
const button = 'border-border-default hover:bg-hover-surface flex items-center gap-2 border-[0.5px] px-3 py-1.5 text-sm text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40';

const stamp = (iso: string) =>
  new Date(iso).toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function AuditView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category = params.get('category') ?? '';
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [since, setSince] = useState(params.get('since') ?? '');
  const [until, setUntil] = useState(params.get('until') ?? '');
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const setParam = (updates: Record<string, string>) => {
    const query = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => (v ? query.set(k, v) : query.delete(k)));
    router.replace(query.toString() ? `${pathname}?${query}` : pathname);
  };

  const q = params.get('q') ?? '';
  const sinceParam = params.get('since') ?? '';
  const untilParam = params.get('until') ?? '';

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ ordering: '-audit_id' });
    if (category) query.set('category', category);
    if (q) query.set('search', q);
    if (sinceParam) query.set('since', sinceParam);
    if (untilParam) query.set('until', untilParam);
    backendJson<Page<AuditEntry>>(`/api/audit-logs/?${query}`)
      .then((page) => {
        if (cancelled) return;
        setEntries(page.results);
        setTotal(page.count);
        setNext(page.next);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
      setEntries(null);
    };
  }, [category, q, sinceParam, untilParam]);

  const loadMore = async () => {
    if (!next) return;
    setLoadingMore(true);
    try {
      const url = new URL(next);
      const page = await backendJson<Page<AuditEntry>>(`${url.pathname}${url.search}`);
      setEntries((current) => [...(current ?? []), ...page.results]);
      setNext(page.next);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const exportCsv = () => {
    if (!entries?.length) return;
    downloadCSV(
      ['Time', 'Category', 'Event', 'Action', 'By', 'IP address', 'Integrity', 'Details'],
      entries.map((e) => [
        stamp(e.created_at),
        CATEGORY_LABEL[e.category] ?? e.category,
        e.summary,
        e.action,
        e.who_username ?? '',
        e.ip_address ?? '',
        e.integrity_verified ? 'verified' : 'MISMATCH',
        JSON.stringify(e.details ?? {}),
      ]),
      `audit-log${category ? `-${category}` : ''}-${today()}.csv`
    );
  };

  return (
    <div className="bg-main-bg flex h-full w-full flex-col overflow-hidden">
      <div className="border-border-default flex flex-wrap items-end justify-between gap-3 border-b-[0.5px] px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Audit log</h1>
          <p className="mt-0.5 text-sm text-text-tertiary">
            {entries ? `${total} event${total === 1 ? '' : 's'} · tamper-evident, newest first` : 'Loading…'}
          </p>
        </div>
        <button onClick={exportCsv} disabled={!entries?.length} className={button}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="border-border-default flex flex-wrap items-center justify-between gap-3 border-b-[0.5px] px-6">
        <div className="flex gap-1">
          {AUDIT_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setParam({ category: c.key })}
              className={`relative px-3 py-2.5 text-sm transition-colors ${
                category === c.key ? 'font-medium text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {c.label}
              {category === c.key && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-text-primary" />}
            </button>
          ))}
        </div>
        <form
          className="flex flex-wrap items-center gap-2 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            setParam({ q: search.trim(), since, until });
          }}
        >
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user, plot, receipt…" className={`${control} w-56`} />
          <input type="date" value={since} onChange={(e) => setSince(e.target.value)} aria-label="From date" className={control} />
          <span className="text-xs text-text-tertiary">to</span>
          <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} aria-label="To date" className={control} />
          <button type="submit" className={button}>Apply</button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <EmptyState icon={ScrollText} title="Couldn’t load the audit log" message={error} />
        ) : entries?.length === 0 ? (
          <EmptyState icon={ScrollText} title="No events" message="Nothing matches these filters yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={HEAD}>
                <tr className="border-border-default border-b-[0.5px]">
                  <th className={CELL}>Time</th>
                  <th className={CELL}>Type</th>
                  <th className={`${CELL} w-full`}>Event</th>
                  <th className={CELL}>By</th>
                  <th className={CELL}>IP address</th>
                  <th className={CELL}>Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-border-default divide-y-[0.5px]">
                {!entries
                  ? [0, 1, 2, 3, 4].map((i) => (
                      <tr key={i}>
                        <td colSpan={6} className={CELL}>
                          <div className="bg-hover-surface h-4" />
                        </td>
                      </tr>
                    ))
                  : entries.map((e) => (
                      <React.Fragment key={e.audit_id}>
                        <tr
                          onClick={() => setOpen(open === e.audit_id ? null : e.audit_id)}
                          className="hover:bg-hover-surface cursor-pointer"
                        >
                          <td className={`${CELL} text-text-tertiary tabular-nums`}>{stamp(e.created_at)}</td>
                          <td className={`${CELL} text-text-secondary`}>{CATEGORY_LABEL[e.category] ?? e.category}</td>
                          <td className={`${CELL} ${ALERT_ACTIONS.has(e.action) ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>
                            {e.summary}
                          </td>
                          <td className={`${CELL} text-text-secondary`}>{e.who_username ?? '—'}</td>
                          <td className={`${CELL} font-mono text-xs text-text-tertiary`}>{e.ip_address ?? '—'}</td>
                          <td className={CELL}>
                            {e.integrity_verified ? (
                              <span className="inline-flex items-center gap-1.5 text-text-tertiary">
                                <ShieldCheck className="h-3.5 w-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
                                <ShieldAlert className="h-3.5 w-3.5" /> Altered
                              </span>
                            )}
                          </td>
                        </tr>
                        {open === e.audit_id && (
                          <tr className="bg-hover-surface">
                            <td colSpan={6} className="px-5 py-3">
                              <dl className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
                                <dt className="text-text-tertiary">Action</dt>
                                <dd className="font-mono text-text-secondary">{e.action}</dd>
                                {Object.entries(e.details ?? {}).map(([k, v]) => (
                                  <React.Fragment key={k}>
                                    <dt className="text-text-tertiary">{k.replace(/_/g, ' ')}</dt>
                                    <dd className="break-all text-text-secondary">{String(v)}</dd>
                                  </React.Fragment>
                                ))}
                                {e.user_agent && (
                                  <>
                                    <dt className="text-text-tertiary">Device</dt>
                                    <dd className="break-all text-text-secondary">{e.user_agent}</dd>
                                  </>
                                )}
                              </dl>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
              </tbody>
            </table>
            {next && (
              <div className="border-border-default border-t-[0.5px] px-6 py-3">
                <button onClick={loadMore} disabled={loadingMore} className={button}>
                  {loadingMore ? 'Loading…' : `Show more (${total - (entries?.length ?? 0)} left)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={null}>
      <AuditView />
    </Suspense>
  );
}
