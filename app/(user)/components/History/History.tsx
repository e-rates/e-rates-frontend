'use client';

import { Receipt } from 'lucide-react';
import { formatKes, RatePayment } from '@/lib/rates';

const statusStyle: Record<RatePayment['status'], { text: string; dot: string }> = {
  completed: { text: 'Paid', dot: '#16a34a' },
  processing: { text: 'Confirming', dot: '#2563eb' },
  pending: { text: 'Unpaid', dot: '#404040' },
  failed: { text: 'Not completed', dot: '#dc2626' },
  refunded: { text: 'Refunded', dot: '#a3a3a3' },
};

const dateFmt = (iso: string) => new Date(iso).toLocaleDateString('en-KE', { dateStyle: 'medium' });

function receiptOf(p: RatePayment): string | null {
  return p.status === 'completed' && p.processor_ref && !p.processor_ref.startsWith('ws_CO_') ? p.processor_ref : null;
}

function yearOf(p: RatePayment) {
  return p.payment_year ?? new Date(p.updated_at).getFullYear();
}

function dateNote(p: RatePayment) {
  if (p.status === 'completed') return `Paid ${dateFmt(p.updated_at)}`;
  return p.deadline ? `Due ${dateFmt(p.deadline)}` : '—';
}

function StatusPill({ status }: { status: RatePayment['status'] }) {
  const s = statusStyle[status];
  return (
    <span className="inline-flex items-center gap-1.5 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {s.text}
    </span>
  );
}

interface HistoryProps {
  payments: RatePayment[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onOpenBill: (year: number, parcelRef: string | null) => void;
}

const History = ({ payments, isLoading, error, onOpenBill }: HistoryProps) => {
  if (isLoading) return <p className="py-10 text-center text-sm text-neutral-500">Loading bills…</p>;
  if (error) return <p className="py-10 text-center text-sm text-red-600">Could not load bills: {error.message}</p>;
  if (!payments?.length) {
    return (
      <div className=" flex flex-col items-center gap-2 border border-dashed border-neutral-300 py-14 text-center dark:border-neutral-700">
        <Receipt className="h-6 w-6 text-neutral-400" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No bills yet</p>
      </div>
    );
  }

  const sorted = [...payments].sort((a, b) => yearOf(b) - yearOf(a) || (a.parcel_ref ?? '').localeCompare(b.parcel_ref ?? ''));

  return (
    <>
      <ul className="space-y-2 sm:hidden">
        {sorted.map((p) => {
          const receipt = receiptOf(p);
          return (
            <li key={p.payment_id}>
              <button
                onClick={() => onOpenBill(yearOf(p), p.parcel_ref)}
                className=" w-full border border-neutral-200 bg-white p-4 text-left dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {yearOf(p)} · Plot {p.parcel_ref ?? '—'}
                  </span>
                  <StatusPill status={p.status} />
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <span className="text-lg font-semibold tabular-nums text-neutral-900 dark:text-white">{formatKes(p.amount)}</span>
                  <span className="text-xs text-neutral-500">{dateNote(p)}</span>
                </div>
                {receipt && <p className="mt-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">Receipt {receipt}</p>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className=" hidden overflow-hidden border border-neutral-200 bg-white sm:block dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium text-neutral-500 dark:bg-neutral-800/50 dark:text-neutral-400">
            <tr>
              <th className="px-5 py-3 font-medium">Year</th>
              <th className="px-5 py-3 font-medium">Plot</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">M-Pesa receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {sorted.map((p) => {
              const receipt = receiptOf(p);
              return (
                <tr
                  key={p.payment_id}
                  onClick={() => onOpenBill(yearOf(p), p.parcel_ref)}
                  className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <td className="px-5 py-3 tabular-nums">{yearOf(p)}</td>
                  <td className="px-5 py-3 font-medium">{p.parcel_ref ?? '—'}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">{formatKes(p.amount)}</td>
                  <td className="px-5 py-3"><StatusPill status={p.status} /></td>
                  <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">{dateNote(p)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                    {receipt ?? (p.status === 'completed' ? 'Confirmed, no code' : '—')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default History;
