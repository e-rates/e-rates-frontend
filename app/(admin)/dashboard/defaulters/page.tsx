'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, UserCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AssistantChat } from '../../components/Assistant/AssistantChat';
import { exportDefaulters, fetchDefaulters } from './service';
import { backendJson } from '@/lib/backend';
import { downloadBlob, downloadCSV, formatMoney, today } from '@/lib/format';
import { titleCase } from '../../components/QuickAccess/WardsPanel';
import { YearTabs, useYearParam } from '../../components/YearSelect';
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
  overdue: { label: 'Overdue', dot: '#dc2626' },
  unpaid: { label: 'Unpaid', dot: '#525252' },
  processing: { label: 'Confirming', dot: '#2563eb' },
  paid: { label: 'Paid', dot: '#16a34a' },
  not_billed: { label: 'No bill', dot: '#a3a3a3' },
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

function DefaultersTable() {
  const [rows, setRows] = useState<DefaulterRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDefaulters()
      .then((data: any) => {
        setRows(data.results ?? []);
        setTotal(data.count ?? 0);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportDefaulters();
      if (blob.size === 0) {
        toast('There are no defaulters to export');
        return;
      }
      downloadBlob(blob, `defaulters-${today()}.csv`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TableHeader
        title="All defaulters"
        subtitle={rows ? `${total} overdue payment${total === 1 ? '' : 's'} · pick a ward on the left to see its parcels` : 'Loading…'}
        actions={
          <button onClick={handleExport} disabled={exporting || !rows?.length} className={exportButton}>
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        }
      />
      {error ? (
        <EmptyState icon={UserCheck} title="Couldn’t load defaulters" message={error} />
      ) : rows && rows.length === 0 ? (
        <EmptyState icon={UserCheck} title="No defaulters" message="Nobody has an overdue rate payment right now." />
      ) : (
        <table className="w-full text-sm">
          <thead className={TABLE_HEAD}>
            <tr className="border-border-default border-b-[0.5px]">
              <th className={CELL}>Owner</th>
              <th className={CELL}>Plot</th>
              <th className={`${CELL} text-right`}>Amount due</th>
              <th className={`${CELL} text-right`}>Overdue</th>
            </tr>
          </thead>
          <tbody className="divide-border-default divide-y-[0.5px]">
            {!rows
              ? [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td colSpan={4} className={CELL}>
                      <div className="bg-hover-surface h-4" />
                    </td>
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={row.payment_id} className="hover:bg-hover-surface">
                    <td className={`${CELL} font-medium text-text-primary`}>{row.username}</td>
                    <td className={`${CELL} text-text-secondary`}>{row.parcels[0]?.parcel_ref ?? '—'}</td>
                    <td className={`${CELL} text-right font-medium text-text-primary tabular-nums`}>
                      {formatMoney(row.amount, row.currency)}
                    </td>
                    <td className={`${CELL} text-right text-red-600 tabular-nums dark:text-red-400`}>
                      {row.days_overdue} day{row.days_overdue === 1 ? '' : 's'}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

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

function WardParcelsTable({ ward, year: selectedYear }: { ward: string; year: number }) {
  const router = useRouter();
  const [rows, setRows] = useState<WardParcel[] | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    backendJson<{ year: number; parcels: WardParcel[] }>(`/api/payments/ward-parcels/?ward=${encodeURIComponent(ward)}&year=${selectedYear}`)
      .then((data) => {
        if (cancelled) return;
        setRows(data.parcels);
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
  const due = (rows ?? []).filter((r) => ['overdue', 'unpaid', 'processing'].includes(r.status));
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
      `${ward}-ward-${year ?? ''}-${today()}.csv`
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TableHeader
        title={`${titleCase(ward)} ward`}
        subtitle={
          rows
            ? `${rows.length} plot${rows.length === 1 ? '' : 's'} · ${overdue.length} overdue · ${formatMoney(dueTotal)} outstanding for ${year}`
            : 'Loading…'
        }
        actions={
          <>
            <button onClick={() => router.push(`/dashboard/defaulters?tab=tables${selectedYear !== new Date().getFullYear() ? `&year=${selectedYear}` : ''}`)} className={exportButton}>
              <X className="h-4 w-4" /> All defaulters
            </button>
            <button onClick={exportWard} disabled={!rows?.length} className={exportButton}>
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </>
        }
      />
      {error ? (
        <EmptyState icon={UserCheck} title="Couldn’t load this ward" message={error} />
      ) : rows && rows.length === 0 ? (
        <EmptyState icon={UserCheck} title="No allocated plots" message="No plots in this ward are allocated to an owner yet." />
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

type Tab = 'chat' | 'tables';

function DefaultersView() {
  const params = useSearchParams();
  const router = useRouter();
  const ward = params.get('ward');
  const [year] = useYearParam();
  const activeTab: Tab = ward || params.get('tab') === 'tables' ? 'tables' : 'chat';

  const setActiveTab = (tab: Tab) => {
    const query = new URLSearchParams();
    if (tab !== 'chat') query.set('tab', tab);
    if (params.get('year')) query.set('year', params.get('year')!);
    router.replace(`/dashboard/defaulters${query.toString() ? `?${query}` : ''}`);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'chat', label: 'Chat' },
    { key: 'tables', label: ward ? `View Tables · ${titleCase(ward)}` : 'View Tables' },
  ];

  return (
    <div className="bg-main-bg flex h-full w-full flex-col overflow-hidden">
      <div className="border-border-default flex w-full items-center justify-between gap-4 border-b-[0.5px] px-6 pt-3">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-text-primary" />}
            </button>
          ))}
        </div>
        {activeTab === 'tables' && ward && (
          <div className="flex items-center gap-3">
            <span className="pb-3 text-xs text-text-tertiary">Rating year</span>
            <YearTabs />
          </div>
        )}
      </div>

      {activeTab === 'chat' ? (
        <AssistantChat />
      ) : ward ? (
        <WardParcelsTable key={`${ward}-${year}`} ward={ward} year={year} />
      ) : (
        <DefaultersTable />
      )}
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
