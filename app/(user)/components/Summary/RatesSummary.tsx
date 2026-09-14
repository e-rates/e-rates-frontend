import { RateParcelFeature, formatKes } from '@/lib/rates';

function Stat({ label, value, hint, alert }: { label: string; value: string; hint: string; alert?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 px-4 py-3">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="truncate text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">{value}</span>
      <span className={`truncate text-xs ${alert ? 'font-medium text-red-700 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
        {hint}
      </span>
    </div>
  );
}

export default function RatesSummary({ features, year }: { features: RateParcelFeature[]; year: number }) {
  const withStatus = (statuses: string[]) => features.filter((f) => statuses.includes(f.properties.payment_status));
  const total = (list: RateParcelFeature[]) => list.reduce((sum, f) => sum + Number(f.properties.bill?.amount ?? 0), 0);
  const unpaid = withStatus(['unpaid', 'overdue']);
  const overdue = withStatus(['overdue']);
  const paid = withStatus(['paid']);
  const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

  return (
    <div className="grid grid-cols-2 border border-neutral-200 bg-white sm:grid-cols-4 sm:divide-x sm:divide-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:sm:divide-neutral-800">
      <Stat
        label={`${year} outstanding`}
        value={formatKes(total(unpaid))}
        hint={unpaid.length ? count(unpaid.length, 'unpaid bill') : 'Nothing to pay'}
      />
      <Stat
        label="Overdue"
        value={formatKes(total(overdue))}
        hint={overdue.length ? `${count(overdue.length, 'plot')} past deadline` : 'None'}
        alert={overdue.length > 0}
      />
      <Stat label={`Paid for ${year}`} value={formatKes(total(paid))} hint={`${count(paid.length, 'plot')} cleared`} />
      <Stat label="Plots" value={String(features.length)} hint="Allocated to you" />
    </div>
  );
}
