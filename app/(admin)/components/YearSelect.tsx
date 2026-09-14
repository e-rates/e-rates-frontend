'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ratingYears } from '@/lib/rates';

export function useYearParam(): [number, (year: number) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = new Date().getFullYear();
  const year = Number(params.get('year')) || current;

  const setYear = (next: number) => {
    const query = new URLSearchParams(params.toString());
    if (next === current) query.delete('year');
    else query.set('year', String(next));
    const qs = query.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return [year, setYear];
}

export function YearTabs() {
  const [year, setYear] = useYearParam();
  return (
    <div role="tablist" aria-label="Rating year" className="flex items-stretch gap-1">
      {ratingYears().map((y) => {
        const active = y === year;
        return (
          <button
            key={y}
            role="tab"
            aria-selected={active}
            onClick={() => setYear(y)}
            className={`relative px-3 pb-3 text-sm transition-colors ${
              active ? 'font-semibold text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {y}
            {active && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-text-primary" />}
          </button>
        );
      })}
    </div>
  );
}

export function YearSelect({ label = 'Rating year' }: { label?: string }) {
  const [year, setYear] = useYearParam();
  return (
    <label className="flex items-center gap-2 text-xs text-text-tertiary">
      {label}
      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="border-border-default bg-main-bg border-[0.5px] px-2 py-1 text-sm text-text-primary"
      >
        {ratingYears().map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}
