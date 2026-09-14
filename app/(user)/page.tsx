'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle } from 'lucide-react';
import { PlotDetail, PlotPicker } from './components/Assets/Assets';
import History from './components/History/History';
import RatesSummary from './components/Summary/RatesSummary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { formatKes, ratingYears, useMyPayments, useMyRateParcels } from '@/lib/rates';

const LeafletMap = dynamic(() => import('@/app/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-neutral-100 dark:bg-neutral-900" />,
});

type View = 'plots' | 'bills';

export default function UserHome() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [view, setView] = useState<View>('plots');
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const { data: parcelData, isLoading, error } = useMyRateParcels(year);
  const payments = useMyPayments();
  const features = useMemo(() => parcelData?.features ?? [], [parcelData]);
  const active = features.find((f) => f.properties.parcel_ref === selectedRef) ?? features[0];

  const otherYearArrears = useMemo(() => {
    const byYear = new Map<number, number>();
    for (const p of payments.data ?? []) {
      if (!p.payment_year || p.payment_year === year || !['pending', 'failed'].includes(p.status)) continue;
      byYear.set(p.payment_year, (byYear.get(p.payment_year) ?? 0) + Number(p.amount));
    }
    return [...byYear.entries()].sort(([a], [b]) => a - b);
  }, [payments.data, year]);

  const selectById = (id: string | null) =>
    setSelectedRef(id ? (features.find((f) => f.id === id)?.properties.parcel_ref ?? null) : null);

  const openBill = (y: number, parcelRef: string | null) => {
    setYear(y);
    setSelectedRef(parcelRef);
    setView('plots');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabClass = (v: View) =>
    ` px-4 py-1.5 text-sm font-medium transition-colors ${
      view === v
        ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
    }`;

  return (
    <div className="bg-elevated-surface min-h-screen w-full">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">Land rates</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Your plots, bills and M-Pesa receipts.</p>
          </div>
          <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
            <SelectTrigger aria-label="Rating year" className="w-[132px] rounded-none! bg-white dark:bg-neutral-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ratingYears().map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y} rates
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {otherYearArrears.length > 0 && (
          <div className=" flex flex-wrap items-center gap-x-3 gap-y-2 border border-neutral-200 border-l-4 border-l-neutral-900 bg-white px-4 py-3 text-sm text-neutral-800 dark:border-neutral-800 dark:border-l-white dark:bg-neutral-900 dark:text-neutral-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">Unpaid rates from other years</span>
            {otherYearArrears.map(([y, amount]) => (
              <button
                key={y}
                onClick={() => openBill(y, null)}
                className="border border-neutral-300 px-3 py-1 font-semibold tabular-nums hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {y}: {formatKes(amount)}
              </button>
            ))}
          </div>
        )}

        <RatesSummary features={features} year={year} />

        <div role="tablist" aria-label="View" className="inline-flex w-fit gap-1 bg-neutral-100 p-1 dark:bg-neutral-800">
          <button role="tab" aria-selected={view === 'plots'} className={tabClass('plots')} onClick={() => setView('plots')}>
            My plots{features.length ? ` (${features.length})` : ''}
          </button>
          <button role="tab" aria-selected={view === 'bills'} className={tabClass('bills')} onClick={() => setView('bills')}>
            Bills &amp; receipts{payments.data?.length ? ` (${payments.data.length})` : ''}
          </button>
        </div>

        <div
          hidden={view !== 'plots'}
          className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_440px]"
        >
            <div className="flex flex-col gap-4 lg:order-2">
              <PlotPicker
                features={features}
                activeId={active?.id}
                onSelect={(id) => selectById(id)}
              />
              {isLoading && <p className="text-sm text-neutral-500">Loading your plots…</p>}
              {error && <p className="text-sm text-red-600">Could not load your plots: {(error as Error).message}</p>}
              {!isLoading && !error && !features.length && (
                <p className="text-sm text-neutral-500">No plots are allocated to you yet.</p>
              )}
              {active && <PlotDetail feature={active} />}
            </div>

            <div className="lg:order-1">
              <div className="relative h-72 overflow-hidden border border-neutral-200 sm:h-96 lg:sticky lg:top-[72px] lg:h-[calc(100vh-120px)] lg:max-h-[720px] dark:border-neutral-800">
                <LeafletMap
                  parcelData={parcelData}
                  isLoading={isLoading}
                  selectedId={selectedRef ? active?.id : null}
                  onSelect={selectById}
                  visible={view === 'plots'}
                />
                {selectedRef && features.length > 1 && (
                  <button
                    onClick={() => setSelectedRef(null)}
                    className="absolute top-3 left-14 z-[1000] bg-white px-3 py-1.5 text-xs font-medium shadow-md hover:bg-neutral-50 dark:bg-neutral-900"
                  >
                    Show all plots
                  </button>
                )}
              </div>
            </div>
        </div>

        {view === 'bills' && (
          <History
            payments={payments.data}
            isLoading={payments.isLoading}
            error={payments.error as Error | null}
            onOpenBill={openBill}
          />
        )}
      </div>
    </div>
  );
}
