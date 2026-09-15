'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { backendJson } from '@/lib/backend';
import { formatMoney } from '@/lib/format';
import { useYearParam } from '../YearSelect';

export interface WardSummary {
  ward: string;
  sub_county: string;
  parcels: number;
  billed: number;
  paid: number;
  unpaid: number;
  overdue: number;
  outstanding: string;
  overdue_amount: string;
  collected: string;
}

export const titleCase = (value: string) => value.replace(/\b\w/g, (c) => c.toUpperCase());

export function WardsPanel() {
  const [wards, setWards] = useState<WardSummary[] | null>(null);
  const [error, setError] = useState(false);
  const active = useSearchParams().get('ward');
  const [year] = useYearParam();

  useEffect(() => {
    let cancelled = false;
    backendJson<{ wards: WardSummary[] }>(`/api/payments/wards/?year=${year}`)
      .then((data) => !cancelled && setWards(data.wards))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [year]);

  const totalOverdue = (wards ?? []).reduce((sum, w) => sum + w.unpaid, 0);

  return (
    <section className="border-border-default mt-2 flex min-h-0 flex-col border-t-[0.5px] pt-3">
      <div className="flex items-baseline justify-between px-1">
        <p className="text-sm font-semibold text-text-primary">Wards · {year}</p>
        {wards && (
          <span className="text-[11px] text-text-tertiary">
            {totalOverdue} defaulter{totalOverdue === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {error && <p className="px-1 py-6 text-center text-xs text-text-tertiary">Couldn’t load wards.</p>}
      {!error && !wards && (
        <div className="space-y-2 py-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-hover-surface h-10" />
          ))}
        </div>
      )}
      {wards?.length === 0 && <p className="px-1 py-6 text-center text-xs text-text-tertiary">No allocated parcels yet.</p>}

      {!!wards?.length && (
        <ul className="divide-border-default mt-2 min-h-0 divide-y-[0.5px] overflow-y-auto">
          {wards.map((w) => {
            const selected = active?.toLowerCase() === w.ward;
            return (
              <li key={`${w.ward}-${w.sub_county}`}>
                <Link
                  href={`/dashboard/defaulters?ward=${encodeURIComponent(w.ward)}${year !== new Date().getFullYear() ? `&year=${year}` : ''}`}
                  aria-current={selected ? 'true' : undefined}
                  className={`flex items-center justify-between gap-3 px-2 py-2.5 transition-colors ${
                    selected ? 'bg-hover-surface' : 'hover:bg-hover-surface'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{titleCase(w.ward)}</p>
                    <p className="truncate text-[11px] text-text-tertiary">
                      {w.parcels} plot{w.parcels === 1 ? '' : 's'} · {w.paid} paid
                      {w.sub_county ? ` · ${w.sub_county}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-semibold tabular-nums ${w.overdue ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>
                      {w.overdue ? `${w.overdue} overdue` : `${w.unpaid} unpaid`}
                    </p>
                    <p className="text-[11px] text-text-tertiary tabular-nums">{formatMoney(w.outstanding)} due</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
