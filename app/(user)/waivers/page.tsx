'use client';

import { useCallback, useEffect, useState } from 'react';
import { BadgePercent, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendFetch, backendJson } from '@/lib/backend';
import { formatDate } from '@/lib/format';
import type { MyWaiver } from '@/lib/rates';

export default function WaiversPage() {
  const [waivers, setWaivers] = useState<MyWaiver[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  const load = useCallback(() => {
    backendJson<MyWaiver[]>('/api/waivers/mine/')
      .then(setWaivers)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const claim = async (w: MyWaiver) => {
    setClaiming(w.waiver_id);
    try {
      const response = await backendFetch(`/api/waivers/${w.waiver_id}/claim/`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || `Claim failed (${response.status})`);
      toast.success(
        w.status === 'scheduled'
          ? `Claimed. ${Number(w.percent)}% comes off your bill from ${formatDate(w.starts_on)}.`
          : `Claimed. ${Number(w.percent)}% is now off your bill.`
      );
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-start p-4 md:p-6">
      <div className="w-full max-w-3xl">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Waivers</h2>
        <p className="mb-6 text-sm text-neutral-500">
          Relief your county has granted on land rates. Claim a waiver and it comes off your unpaid bill.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && waivers === null && <p className="text-sm text-neutral-500">Loading…</p>}

        {waivers?.length === 0 && (
          <div className="squircle-2xl flex flex-col items-center gap-2 border border-dashed border-neutral-200 px-6 py-14 text-center dark:border-neutral-700">
            <BadgePercent className="h-6 w-6 text-neutral-400" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No waivers for your plots</p>
            <p className="max-w-[24rem] text-xs text-neutral-500">
              When your county offers a waiver that covers your plot, it shows up here and in your notifications.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {waivers?.map((w) => {
            const claimed = w.plots.every((p) => w.claimed_plots.includes(p));
            const ended = w.status === 'ended';
            return (
              <div key={w.waiver_id} className="squircle-2xl border border-neutral-200 p-5 dark:border-neutral-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{Number(w.percent)}% off</p>
                    <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{w.name}</p>
                  </div>
                  {claimed ? (
                    <span className="flex shrink-0 items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      {w.status === 'scheduled' ? `Claimed · starts ${formatDate(w.starts_on)}` : 'Claimed · applied to your bill'}
                    </span>
                  ) : ended ? (
                    <span className="shrink-0 bg-neutral-500/10 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">Ended</span>
                  ) : (
                    <button
                      onClick={() => claim(w)}
                      disabled={claiming !== null}
                      className="flex shrink-0 items-center gap-2 bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                      {claiming === w.waiver_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />}
                      Claim waiver
                    </button>
                  )}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
