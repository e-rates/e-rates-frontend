'use client';

import { useEffect, useState } from 'react';
import { BadgePercent } from 'lucide-react';
import { backendJson } from '@/lib/backend';
import { formatDate } from '@/lib/format';

interface MyWaiver {
  waiver_id: string;
  county: string;
  name: string;
  legal_reference: string;
  percent: string;
  years: number[];
  starts_on: string;
  ends_on: string | null;
  status: 'active' | 'scheduled' | 'ended';
  plots: string[];
}

const STATUS: Record<MyWaiver['status'], { label: string; badge: string }> = {
  active: { label: 'In effect', badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  scheduled: { label: 'Starts soon', badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  ended: { label: 'Ended', badge: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400' },
};

export default function WaiversPage() {
  const [waivers, setWaivers] = useState<MyWaiver[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    backendJson<MyWaiver[]>('/api/waivers/mine/')
      .then(setWaivers)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-start p-4 md:p-6">
      <div className="w-full max-w-3xl">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Waivers</h2>
        <p className="mb-6 text-sm text-neutral-500">
          Relief your county has granted on land rates for your plots. It comes off your bill automatically.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && waivers === null && <p className="text-sm text-neutral-500">Loading…</p>}

        {waivers?.length === 0 && (
          <div className="squircle-2xl flex flex-col items-center gap-2 border border-dashed border-neutral-200 px-6 py-14 text-center dark:border-neutral-700">
            <BadgePercent className="h-6 w-6 text-neutral-400" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No waivers on your plots</p>
            <p className="max-w-[24rem] text-xs text-neutral-500">
              When your county waives rates for an area that includes your plot, it shows up here and your bill is reduced.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {waivers?.map((w) => (
            <div key={w.waiver_id} className="squircle-2xl border border-neutral-200 p-5 dark:border-neutral-700">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{Number(w.percent)}% off</p>
                  <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{w.name}</p>
                </div>
                <span className={`shrink-0 px-2 py-1 text-xs font-medium ${STATUS[w.status].badge}`}>{STATUS[w.status].label}</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-neutral-500">Plots</dt>
                  <dd className="mt-0.5 text-neutral-900 dark:text-neutral-100">{w.plots.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Rating years</dt>
                  <dd className="mt-0.5 text-neutral-900 dark:text-neutral-100">{w.years.length ? w.years.join(', ') : 'All unpaid years'}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Valid</dt>
                  <dd className="mt-0.5 text-neutral-900 dark:text-neutral-100">
                    {formatDate(w.starts_on)}
                    {w.ends_on ? ` – ${formatDate(w.ends_on)}` : ' onwards'}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Issued by</dt>
                  <dd className="mt-0.5 text-neutral-900 dark:text-neutral-100">
                    {w.county}
                    {w.legal_reference ? ` · ${w.legal_reference}` : ''}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
