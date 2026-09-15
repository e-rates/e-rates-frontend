'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Smartphone } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useUserAuth } from '../../context/UserAuthContext';
import {
  RateParcelFeature,
  RateStatus,
  formatArea,
  formatKes,
  landUseLabel,
  rateStatusMeta,
  useMpesaPayment,
} from '@/lib/rates';

const PRIMARY =
  'rounded-none! bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200';

const dateFmt = (iso: string) => new Date(iso).toLocaleDateString('en-KE', { dateStyle: 'medium' });
const titleCase = (value?: string | null) =>
  value && value !== 'Unknown' ? value.replace(/\b\w/g, (c) => c.toUpperCase()) : null;

export function StatusBadge({ status }: { status: RateStatus }) {
  const meta = rateStatusMeta[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 px-2 py-1 text-xs font-medium ${meta.badge}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}

export function PlotPicker({
  features,
  activeId,
  onSelect,
}: {
  features: RateParcelFeature[];
  activeId: string | undefined;
  onSelect: (id: string) => void;
}) {
  if (features.length < 2) return null;
  return (
    <div role="tablist" aria-label="Your plots" className="flex flex-wrap gap-2">
      {features.map((f) => {
        const active = f.id === activeId;
        const status = rateStatusMeta[f.properties.payment_status];
        return (
          <button
            key={f.id}
            role="tab"
            aria-selected={active}
            aria-label={`Plot ${f.properties.parcel_ref}, ${status.label}`}
            onClick={() => onSelect(f.id)}
            className={`inline-flex items-center gap-2 border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
            }`}
          >
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
            {f.properties.parcel_ref}
          </button>
        );
      })}
    </div>
  );
}

function PayForm({ feature, onClose }: { feature: RateParcelFeature; onClose: () => void }) {
  const { user } = useUserAuth();
  const [phone, setPhone] = useState(user?.phonenumber ?? '');
  const bill = feature.properties.bill!;
  const payment = useMpesaPayment((state) => {
    if (state.status === 'completed') {
      toast.success(`Paid. M-Pesa receipt ${state.receipt ?? ''}`.trim());
      onClose();
    } else if (state.status === 'processing') {
      toast('Still waiting for M-Pesa confirmation. Check back shortly.');
    } else {
      toast.error(state.failure_reason || state.result_desc || 'Payment was not completed');
    }
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    payment.mutate({ paymentId: bill.payment_id, phone }, { onError: (error) => toast.error(error.message) });
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-2">
      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300" htmlFor={`phone-${feature.id}`}>
        M-Pesa phone number
      </label>
      <Input
        id={`phone-${feature.id}`}
        type="tel"
        inputMode="tel"
        autoFocus
        placeholder="0712 345 678"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={payment.isPending}
        className="h-11 rounded-none! bg-white dark:bg-neutral-900"
        required
      />
      <div className="flex gap-2">
        <Button type="submit" className={`h-11 flex-1 ${PRIMARY}`} disabled={payment.isPending || !phone}>
          {payment.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Waiting for your PIN…
            </>
          ) : (
            `Pay ${formatKes(bill.amount)} with M-Pesa`
          )}
        </Button>
        {!payment.isPending && (
          <Button type="button" variant="outline" className="h-11 rounded-none!" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        A prompt will come to this number. It shows{' '}
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          Land rates {feature.properties.payment_year}
        </span>{' '}
        and account{' '}
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          {feature.properties.parcel_ref}
        </span>
        , which is your plot number. Enter your M-Pesa PIN to pay.
      </p>
    </form>
  );
}

function BillBox({ feature }: { feature: RateParcelFeature }) {
  const [paying, setPaying] = useState(false);
  const { bill, payment_status, payment_year } = feature.properties;

  if (!bill) {
    return (
      <div className=" border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700">
        No {payment_year} rates bill has been issued for this plot yet.
      </div>
    );
  }

  const payable = payment_status === 'unpaid' || payment_status === 'overdue';
  const receipt = bill.receipt && !bill.receipt.startsWith('ws_CO_') ? bill.receipt : null;
  const paidOn = bill.paid_at ? ` ${dateFmt(bill.paid_at)}` : '';

  return (
    <div className="border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{payment_year} land rates</p>
          <p className="mt-0.5 text-3xl font-semibold tabular-nums text-neutral-900 dark:text-white">
            {formatKes(bill.amount)}
          </p>
        </div>
        <StatusBadge status={payment_status} />
      </div>

      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
        {payment_status === 'paid' && `Paid${paidOn}${receipt ? ` · M-Pesa ${receipt}` : ''}`}
        {payment_status === 'processing' && 'Waiting for M-Pesa confirmation…'}
        {payable &&
          (bill.days_overdue ? (
            <span className="font-medium text-red-700 dark:text-red-400">{bill.days_overdue} days overdue</span>
          ) : bill.deadline ? (
            `Due ${dateFmt(bill.deadline)}`
          ) : (
            'Due now'
          ))}
      </p>

      {bill.explanation && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {bill.explanation}
          {!bill.waiver && bill.standard_amount && Number(bill.standard_amount) !== Number(bill.amount) && ` (adjusted to ${formatKes(bill.amount)})`}
        </p>
      )}
      {bill.waiver && (
        <p className="mt-2 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          {Number(bill.waiver.percent)}% waiver · {bill.waiver.name}
          {bill.standard_amount && ` · was ${formatKes(bill.standard_amount)}`}
        </p>
      )}

      {payable && !paying && (
        <Button className={`mt-4 h-11 w-full ${PRIMARY}`} onClick={() => setPaying(true)}>
          <Smartphone className="h-4 w-4" />
          Pay with M-Pesa
        </Button>
      )}
      {payable && paying && <PayForm feature={feature} onClose={() => setPaying(false)} />}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">{value ?? '—'}</dd>
    </div>
  );
}

export function PlotDetail({ feature }: { feature: RateParcelFeature }) {
  const p = feature.properties;
  const titleRef = p.registration_section ? `${p.registration_section}/${p.parcel_ref}` : null;
  const place = [titleCase(p.ward) && `${titleCase(p.ward)} ward`, titleCase(p.sub_county), titleCase(p.county)]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className=" border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <header className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Plot</p>
        <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">{titleRef ?? p.parcel_ref}</h3>
        {place && <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{place}</p>}
      </header>

      <BillBox key={`${feature.id}-${p.payment_year}`} feature={feature} />

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-neutral-100 pt-5 dark:border-neutral-800">
        <Fact label="County" value={titleCase(p.county)} />
        <Fact label="Sub-county" value={titleCase(p.sub_county)} />
        <Fact label="Ward" value={titleCase(p.ward)} />
        <Fact label="Registration section" value={p.registration_section} />
        <Fact label="Parcel number" value={p.parcel_ref} />
        <Fact label="Map sheet" value={p.map_sheet} />
        <Fact label="Area" value={formatArea(p.area_m2)} />
        <Fact label="Land use" value={landUseLabel[p.land_use] ?? p.land_use} />
      </dl>
    </article>
  );
}
