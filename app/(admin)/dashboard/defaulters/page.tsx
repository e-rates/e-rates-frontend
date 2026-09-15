'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BadgePercent, Download, FilePlus2, Plus, UserCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { IssueBills } from '../../components/Billing/IssueBills';
import { Waivers } from '../../components/Billing/Waivers';
import { PaymentsView } from '../../components/Billing/PaymentsView';
import { useAuth } from '@/hooks/useAuth';
import { ratingYears } from '@/lib/rates';
import { backendJson } from '@/lib/backend';
import { downloadBlob, downloadCSV, formatMoney, today } from '@/lib/format';
import { titleCase } from '../../components/QuickAccess/WardsPanel';
import { useYearParam } from '../../components/YearSelect';
import { EmptyState } from '../../components/EmptyState';

interface DefaulterRow {
  payment_id: string;
  username: string;
  amount: string;
  currency: string;
  days_overdue: number;
  parcels: { parcel_ref: string; ward?: string }[];
}

const TABLE_HEAD = 'border-border-default sticky top-0 z-10 bg-main-bg text-left text-[11px] font-medium tracking-wide text-text-tertiary uppercase';
const CELL = 'px-5 py-2.5 whitespace-nowrap';

const STATUS: Record<string, { label: string; dot: string }> = {
  overdue: { label: 'Overdue', dot: '#ff3b30' },
  unpaid: { label: 'Unpaid', dot: '#ff6961' },
  processing: { label: 'Confirming', dot: '#007aff' },
  paid: { label: 'Paid', dot: '#34c759' },
  not_billed: { label: 'No bill', dot: '#aeaeb2' },
};

function StatusCell({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.not_billed;
  return (
    <span className="inline-flex items-center gap-2 text-text-secondary">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  );
}

function TableHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border-border-default flex flex-wrap items-end justify-between gap-3 border-b-[0.5px] px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-0.5 text-sm text-text-tertiary">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

const exportButton =
  'border-border-default hover:bg-hover-surface flex items-center gap-2 border-[0.5px] px-3 py-1.5 text-sm text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40';

interface WardParcel {
  parcel_id: string;
  parcel_ref: string;
  registration_section: string | null;
  owner: string;
  owner_phone: string | null;
  owner_email: string;
  area_m2: number | null;
  land_use: string;
  status: string;
  amount: string | null;
  deadline: string | null;
  days_overdue: number | null;
  receipt: string | null;
  paid_at: string | null;
}

const area = (m2: number | null) => (!m2 ? '—' : m2 >= 1000 ? `${(m2 / 10000).toFixed(2)} ha` : `${Math.round(m2)} m²`);
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-KE', { dateStyle: 'medium' });

const DUE = ['overdue', 'unpaid', 'processing'];

function WardParcelsTable({ ward, year: selectedYear }: { ward: string | null; year: number }) {
  const router = useRouter();
  const [rows, setRows] = useState<WardParcel[] | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    backendJson<{ year: number; parcels: WardParcel[] }>(`/api/payments/ward-parcels/?${ward ? `ward=${encodeURIComponent(ward)}&` : ''}year=${selectedYear}`)
      .then((data) => {
        if (cancelled) return;
        setRows(data.parcels.filter((p) => DUE.includes(p.status)));
        setYear(data.year);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
      setRows(null);
    };
  }, [ward, selectedYear]);

  const overdue = rows?.filter((r) => r.status === 'overdue') ?? [];
  const due = rows ?? [];
  const dueTotal = due.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

  const exportWard = () => {
    if (!rows?.length) return;
    downloadCSV(
      ['Plot', 'Title ref', 'Owner', 'Phone', 'Email', 'Area (m2)', 'Land use', 'Status', 'Amount', 'Deadline', 'Days overdue', 'Receipt'],
      rows.map((r) => [
        r.parcel_ref,
        r.registration_section ? `${r.registration_section}/${r.parcel_ref}` : '',
        r.owner,
        r.owner_phone ?? '',
        r.owner_email,
        r.area_m2 ? Math.round(r.area_m2) : '',
        r.land_use,
        STATUS[r.status]?.label ?? r.status,
        r.amount ?? '',
        r.deadline ? shortDate(r.deadline) : '',
        r.days_overdue ?? '',
        r.receipt ?? '',
      ]),
      `${ward ? `${ward}-ward` : 'defaulters'}-${year ?? ''}-${today()}.csv`
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TableHeader
        title={ward ? `Defaulters · ${titleCase(ward)} ward` : 'All defaulters'}
        subtitle={
          rows
            ? `${rows.length} unpaid plot${rows.length === 1 ? '' : 's'} · ${overdue.length} past the deadline · ${formatMoney(dueTotal)} outstanding for ${year}${ward ? '' : ' · pick a ward on the left to narrow down'}`
            : 'Loading…'
        }
        actions={
          <>
            {ward && (
              <button onClick={() => router.push(`/dashboard/defaulters${selectedYear !== new Date().getFullYear() ? `?year=${selectedYear}` : ''}`)} className={exportButton}>
                <X className="h-4 w-4" /> All wards
              </button>
            )}
            <button onClick={exportWard} disabled={!rows?.length} className={exportButton}>
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </>
        }
      />
      {error ? (
        <EmptyState icon={UserCheck} title="Couldn’t load this ward" message={error} />
      ) : rows && rows.length === 0 ? (
        <EmptyState icon={UserCheck} title="No defaulters" message={`Every billed plot${ward ? ' in this ward' : ''} has paid for ${year ?? selectedYear}.`} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={TABLE_HEAD}>
              <tr className="border-border-default border-b-[0.5px]">
                <th className={CELL}>Plot</th>
                <th className={CELL}>Title ref.</th>
                <th className={CELL}>Owner</th>
                <th className={CELL}>Phone</th>
                <th className={`${CELL} text-right`}>Area</th>
                <th className={CELL}>Use</th>
                <th className={CELL}>Status</th>
                <th className={`${CELL} text-right`}>{year} bill</th>
                <th className={CELL}>Due / paid</th>
                <th className={CELL}>Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-border-default divide-y-[0.5px]">
              {!rows
                ? [0, 1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td colSpan={10} className={CELL}>
                        <div className="bg-hover-surface h-4" />
                      </td>
                    </tr>
                  ))
                : rows.map((r) => (
                    <tr key={r.parcel_id} className="hover:bg-hover-surface">
                      <td className={`${CELL} font-medium text-text-primary`}>{r.parcel_ref}</td>
                      <td className={`${CELL} text-text-tertiary`}>
                        {r.registration_section ? `${r.registration_section}/${r.parcel_ref}` : '—'}
                      </td>
                      <td className={`${CELL} text-text-primary`} title={r.owner_email}>{r.owner}</td>
                      <td className={`${CELL} text-text-secondary tabular-nums`}>{r.owner_phone || '—'}</td>
                      <td className={`${CELL} text-right text-text-secondary tabular-nums`}>{area(r.area_m2)}</td>
                      <td className={`${CELL} text-text-secondary capitalize`}>{r.land_use}</td>
                      <td className={CELL}>
                        <StatusCell status={r.status} />
                      </td>
                      <td className={`${CELL} text-right font-medium text-text-primary tabular-nums`}>
                        {r.amount ? formatMoney(r.amount) : '—'}
                      </td>
                      <td className={`${CELL} text-text-secondary`}>
                        {r.status === 'paid' && r.paid_at
                          ? `Paid ${shortDate(r.paid_at)}`
                          : r.days_overdue
                            ? <span className="text-red-600 dark:text-red-400">{r.days_overdue} days overdue</span>
                            : r.deadline
                              ? `Due ${shortDate(r.deadline)}`
                              : '—'}
                      </td>
                      <td className={`${CELL} font-mono text-xs text-text-secondary`}>
                        {r.receipt && !r.receipt.startsWith('ws_CO_') ? r.receipt : '—'}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DefaultersView() {
  const params = useSearchParams();
  const router = useRouter();
  const ward = params.get('ward');
  const view = params.get('view') === 'payments' ? 'payments' : 'defaulters';
  const [year, setYear] = useYearParam();
  const { userRole } = useAuth();
  const canBill = userRole === 'admin';
  const [billedYears, setBilledYears] = useState<number[]>([]);
  const [billingYear, setBillingYear] = useState<number | null>(null);
  const [waiversOpen, setWaiversOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    backendJson<{ year: number }[]>('/api/rate-schedules/')
      .then((schedules) => setBilledYears(schedules.map((s) => s.year)))
      .catch(() => setBilledYears([]));
  }, [refresh]);

  const current = new Date().getFullYear();
  const years = Array.from(new Set([current, year, ...billedYears])).sort((a, b) => b - a);
  const nextYear = ratingYears().find((y) => !years.includes(y)) ?? current;

  const showView = (next: 'payments' | 'defaulters') => {
    const query = new URLSearchParams(params.toString());
    query.delete('ward');
    if (next === 'payments') query.set('view', 'payments');
    else query.delete('view');
    router.replace(`/dashboard/defaulters${query.size ? `?${query}` : ''}`);
  };

  const issued = (issuedYear: number) => {
    setBillingYear(null);
    setYear(issuedYear);
    setRefresh((n) => n + 1);
  };

  return (
    <div className="bg-main-bg flex h-full w-full flex-col overflow-hidden">
      <div className="border-border-default flex w-full flex-wrap items-end justify-between gap-3 border-b-[0.5px] px-6 pt-3">
        <div role="tablist" aria-label="Rating year" className="flex items-end gap-1 overflow-x-auto">
          {years.map((y) => {
            const active = y === year;
            return (
              <button
                key={y}
                role="tab"
                aria-selected={active}
                onClick={() => setYear(y)}
                className={`relative flex items-center gap-1.5 px-3 pb-3 text-sm transition-colors ${
                  active ? 'font-semibold text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {y}
                {!billedYears.includes(y) && <span className="text-[10px] font-normal text-text-tertiary">no rates</span>}
                {active && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-text-primary" />}
              </button>
            );
          })}
          {canBill && (
            <button
              onClick={() => setBillingYear(nextYear)}
              aria-label="Add a rating year"
              title="Set rates and issue bills for another year"
              className="hover:bg-hover-surface mb-2 flex h-7 w-7 items-center justify-center text-text-tertiary transition-colors hover:text-text-primary"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="View" className="border-border-default flex border-[0.5px] text-sm">
            {(['defaulters', 'payments'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => showView(v)}
                className={`px-3 py-1.5 transition-colors ${view === v ? 'bg-text-primary text-main-bg font-medium' : 'text-text-secondary hover:bg-hover-surface'}`}
              >
                {v === 'payments' ? 'All payments' : 'Defaulters'}
              </button>
            ))}
          </div>
        {canBill && (
          <div className="flex gap-2">
            <button onClick={() => setWaiversOpen(true)} className={exportButton}>
              <BadgePercent className="h-4 w-4" /> Waivers
            </button>
            <button onClick={() => setBillingYear(year)} className={exportButton}>
              <FilePlus2 className="h-4 w-4" /> {billedYears.includes(year) ? `Update ${year} rates` : `Issue ${year} bills`}
            </button>
          </div>
        )}
        </div>
      </div>

      {view === 'payments' ? (
        <PaymentsView key={`payments-${year}-${refresh}`} />
      ) : (
        <WardParcelsTable key={`${ward}-${year}-${refresh}`} ward={ward} year={year} />
      )}

      {canBill && <IssueBills year={billingYear} isOwner={false} onClose={() => setBillingYear(null)} onIssued={issued} />}
      {canBill && <Waivers open={waiversOpen} year={year} onClose={() => setWaiversOpen(false)} onChanged={() => setRefresh((n) => n + 1)} />}
    </div>
  );
}

export default function DefaultersPage() {
  return (
    <Suspense fallback={null}>
      <DefaultersView />
    </Suspense>
  );
}
