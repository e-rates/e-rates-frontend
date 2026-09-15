'use client';

import React, { useEffect, useState } from 'react';
import { Download, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendJson } from '@/lib/backend';
import { downloadCSV, formatDate, formatMoney, today } from '@/lib/format';
import { parcelOf, type Paginated, type Payment } from '@/lib/payments';
import { EmptyState } from '../EmptyState';
import { useYearParam } from '../YearSelect';

const CELL = 'px-5 py-2.5 whitespace-nowrap';
const HEAD = 'bg-main-bg sticky top-0 z-10 text-left text-[11px] font-medium tracking-wide text-text-tertiary uppercase';
const button =
  'border-border-default hover:bg-hover-surface flex items-center gap-2 border-[0.5px] px-3 py-1.5 text-sm text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40';

const STATUS: Record<Payment['status'], { label: string; dot: string }> = {
  completed: { label: 'Paid', dot: '#16a34a' },
  processing: { label: 'Confirming', dot: '#2563eb' },
  pending: { label: 'Unpaid', dot: '#525252' },
  failed: { label: 'Not completed', dot: '#dc2626' },
  refunded: { label: 'Refunded', dot: '#a3a3a3' },
};

const FILTERS: { key: '' | Payment['status']; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'completed', label: 'Paid' },
  { key: 'pending', label: 'Unpaid' },
  { key: 'processing', label: 'Confirming' },
  { key: 'failed', label: 'Not completed' },
];

const receiptOf = (p: Payment) =>
  p.status === 'completed' && p.processor_ref && !p.processor_ref.startsWith('ws_CO_') ? p.processor_ref : null;

export function PaymentsView() {
  const [year] = useYearParam();
  const [status, setStatus] = useState<'' | Payment['status']>('');
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [total, setTotal] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [collected, setCollected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ payment_year: String(year), ordering: '-updated_at' });
    if (status) query.set('status', status);
    Promise.all([
      backendJson<Paginated<Payment>>(`/api/payments/?${query}`),
      backendJson<{ collected_for_year: string }>(`/api/payments/collections/?year=${year}`),
    ])
      .then(([page, summary]) => {
        if (cancelled) return;
        setPayments(page.results);
        setTotal(page.count);
        setNext(page.next);
        setCollected(summary.collected_for_year);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
      setPayments(null);
    };
  }, [year, status]);

  const loadMore = async () => {
    if (!next) return;
    setLoadingMore(true);
    try {
      const url = new URL(next);
      const page = await backendJson<Paginated<Payment>>(`${url.pathname}${url.search}`);
      setPayments((current) => [...(current ?? []), ...page.results]);
      setNext(page.next);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const exportCsv = () => {
    if (!payments?.length) return;
    downloadCSV(
      ['Payer', 'Plot', 'Year', 'Amount', 'Currency', 'Status', 'Deadline', 'Paid on', 'M-Pesa receipt'],
      payments.map((p) => [
        p.user_username,
        parcelOf(p) ?? '',
        p.payment_year ?? '',
        p.amount,
        p.currency,
        STATUS[p.status].label,
        p.deadline ? formatDate(p.deadline) : '',
        p.status === 'completed' ? formatDate(p.updated_at) : '',
        receiptOf(p) ?? '',
      ]),
      `rate-payments-${year}${status ? `-${status}` : ''}-${today()}.csv`
    );
  };

  return (
    <div className="bg-main-bg flex h-full w-full flex-col overflow-hidden">
      <div className="border-border-default flex flex-wrap items-center justify-between gap-3 border-b-[0.5px] px-6">
        <div className="flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={`relative px-3 py-2.5 text-sm transition-colors ${
              status === f.key ? 'font-medium text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {f.label}
            {status === f.key && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-text-primary" />}
          </button>
        ))}
        </div>
        <div className="flex items-center gap-3 py-2">
          <span className="text-sm text-text-tertiary">
            {payments
              ? `${total} bill${total === 1 ? '' : 's'} for ${year}${collected ? ` · ${formatMoney(collected)} collected` : ''}`
              : 'Loading…'}
          </span>
          <button onClick={exportCsv} disabled={!payments?.length} className={button}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <EmptyState icon={Receipt} title="Couldn’t load payments" message={error} />
        ) : payments?.length === 0 ? (
          <EmptyState icon={Receipt} title={`No ${status ? STATUS[status].label.toLowerCase() + ' ' : ''}bills for ${year}`} message="Try another year or status." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={HEAD}>
                <tr className="border-border-default border-b-[0.5px]">
                  <th className={CELL}>Payer</th>
                  <th className={CELL}>Plot</th>
                  <th className={`${CELL} text-right`}>Amount</th>
                  <th className={CELL}>Status</th>
                  <th className={CELL}>Due / paid</th>
                  <th className={CELL}>M-Pesa receipt</th>
                </tr>
              </thead>
              <tbody className="divide-border-default divide-y-[0.5px]">
                {!payments
                  ? [0, 1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td colSpan={6} className={CELL}>
                          <div className="bg-hover-surface h-4" />
                        </td>
                      </tr>
                    ))
                  : payments.map((p) => {
                      const s = STATUS[p.status];
                      return (
                        <tr key={p.payment_id} className="hover:bg-hover-surface">
                          <td className={`${CELL} font-medium text-text-primary`}>{p.user_username}</td>
                          <td className={`${CELL} text-text-secondary`}>{parcelOf(p) ?? '—'}</td>
                          <td className={`${CELL} text-right font-medium text-text-primary tabular-nums`}>
                            {formatMoney(p.amount, p.currency)}
                          </td>
                          <td className={CELL}>
                            <span className="inline-flex items-center gap-2 text-text-secondary">
                              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                              {s.label}
                            </span>
                          </td>
                          <td className={`${CELL} text-text-secondary`}>
                            {p.status === 'completed'
                              ? `Paid ${formatDate(p.updated_at)}`
                              : p.days_overdue
                                ? <span className="text-red-600 dark:text-red-400">{p.days_overdue} days overdue</span>
                                : p.deadline
                                  ? `Due ${formatDate(p.deadline)}`
                                  : '—'}
                          </td>
                          <td className={`${CELL} font-mono text-xs text-text-secondary`}>{receiptOf(p) ?? '—'}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
            {next && (
              <div className="border-border-default border-t-[0.5px] px-6 py-3">
                <button onClick={loadMore} disabled={loadingMore} className={button}>
                  {loadingMore ? 'Loading…' : `Show more (${total - (payments?.length ?? 0)} left)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
