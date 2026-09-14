'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { backendJson } from '@/lib/backend';
import { formatMoney, timeAgo } from '@/lib/format';
import { parcelOf, type Paginated, type Payment } from '@/lib/payments';

const REFRESH_MS = 30_000;

interface Collections {
  total_collected: string;
  collected_today: string;
  payments_count: number;
}

function receiptOf(p: Payment) {
  return p.processor_ref && !p.processor_ref.startsWith('ws_CO_') ? p.processor_ref : null;
}

export function PaymentActivity() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [totals, setTotals] = useState<Collections | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [page, summary] = await Promise.all([
        backendJson<Paginated<Payment>>('/api/payments/?status=completed&ordering=-updated_at'),
        backendJson<Collections>('/api/payments/collections/'),
      ]);
      setPayments(page.results.slice(0, 15));
      setTotals(summary);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <section className="border-border-default mt-2 flex min-h-0 flex-col border-t-[0.5px] pt-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-semibold text-text-primary">Incoming payments</p>
        <button
          onClick={load}
          aria-label="Refresh payments"
          className="hover:bg-hover-surface flex h-7 w-7 items-center justify-center text-text-tertiary hover:text-text-primary"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="border-border-default mt-3 border-[0.5px] px-3 py-3">
        <p className="text-[11px] text-text-tertiary">Total collected</p>
        <p className="text-2xl font-semibold text-text-primary tabular-nums">
          {totals ? formatMoney(totals.total_collected) : '—'}
        </p>
        <p className="mt-1 text-[11px] text-text-tertiary tabular-nums">
          {totals ? `${formatMoney(totals.collected_today)} today · ${totals.payments_count} payments` : ' '}
        </p>
      </div>

      {error && <p className="px-1 py-6 text-center text-xs text-text-tertiary">Couldn’t load payments.</p>}
      {!error && !payments && (
        <div className="space-y-2 py-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-hover-surface h-9" />
          ))}
        </div>
      )}
      {payments?.length === 0 && <p className="px-1 py-6 text-center text-xs text-text-tertiary">No payments received yet.</p>}

      {!!payments?.length && (
        <ol className="divide-border-default mt-2 min-h-0 divide-y-[0.5px] overflow-y-auto">
          {payments.map((p) => {
            const plot = parcelOf(p);
            const receipt = receiptOf(p);
            return (
              <li key={p.payment_id} className="flex items-baseline justify-between gap-3 px-1 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-text-primary">{p.user_username}</p>
                  <p className="truncate text-[11px] text-text-tertiary">
                    {plot ? `Plot ${plot}` : 'Rate payment'}
                    {p.payment_year ? ` · ${p.payment_year}` : ''}
                    {receipt ? ` · ${receipt}` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-text-primary tabular-nums">{formatMoney(p.amount, p.currency)}</p>
                  <p className="text-[11px] text-text-tertiary">{timeAgo(p.updated_at)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
