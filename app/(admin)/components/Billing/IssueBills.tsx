'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendFetch, backendJson } from '@/lib/backend';
import { formatMoney } from '@/lib/format';
import { ratingYears } from '@/lib/rates';

interface Band {
  max_ha: string;
  amount: string;
}

interface Schedule {
  year: number;
  bands: Band[];
  top_amount: string;
  usv_rate_percent: string;
  deadline: string;
}

interface Outcome {
  created: number;
  updated: number;
  unchanged: number;
  parcels: number;
  total_billed: string;
  county: string;
}

const FIELD = 'border-border-default bg-main-bg w-full border-[0.5px] px-2 py-1.5 text-sm text-text-primary';
const LABEL = 'text-xs text-text-tertiary';
const BUTTON =
  'border-border-default hover:bg-hover-surface flex items-center gap-2 border-[0.5px] px-3 py-1.5 text-sm text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40';
const DEFAULT_BANDS: Band[] = [
  { max_ha: '0.1', amount: '2560' },
  { max_ha: '0.2', amount: '3200' },
  { max_ha: '0.4', amount: '4000' },
];

const problemText = (data: Record<string, unknown>) =>
  Object.entries(data)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ') : String(value)}`)
    .join('; ');

export function IssueBills({
  year,
  isOwner,
  onClose,
  onIssued,
}: {
  year: number | null;
  isOwner: boolean;
  onClose: () => void;
  onIssued: (year: number) => void;
}) {
  const open = year !== null;
  const [counties, setCounties] = useState<{ county_id: string; name: string }[]>([]);
  const [county, setCounty] = useState('');
  const [ratingYear, setRatingYear] = useState(year ?? new Date().getFullYear());
  const [bands, setBands] = useState<Band[]>(DEFAULT_BANDS);
  const [topAmount, setTopAmount] = useState('4800');
  const [usvRate, setUsvRate] = useState('0.115');
  const [deadline, setDeadline] = useState(`${ratingYear}-12-31`);
  const [savedYear, setSavedYear] = useState(false);
  const [preview, setPreview] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (year !== null) setRatingYear(year);
  }, [year]);

  useEffect(() => {
    if (!open || !isOwner) return;
    backendJson<{ results: { county_id: string; name: string }[] }>('/api/counties/')
      .then((page) => setCounties(page.results))
      .catch(() => setCounties([]));
  }, [open, isOwner]);

  useEffect(() => {
    if (!open || (isOwner && !county)) return;
    const query = isOwner ? `?county=${encodeURIComponent(county)}` : '';
    backendJson<Schedule[]>(`/api/rate-schedules/${query}`)
      .then((schedules) => {
        const saved = schedules.find((s) => s.year === ratingYear);
        setSavedYear(!!saved);
        if (saved) {
          setBands(saved.bands);
          setTopAmount(saved.top_amount);
          setUsvRate(saved.usv_rate_percent);
          setDeadline(saved.deadline.slice(0, 10));
        } else {
          setDeadline(`${ratingYear}-12-31`);
        }
      })
      .catch(() => setSavedYear(false));
  }, [open, isOwner, county, ratingYear]);

  useEffect(() => setPreview(null), [county, ratingYear, bands, topAmount, usvRate, deadline]);

  const post = async (path: 'preview' | 'issue'): Promise<Outcome | null> => {
    setBusy(true);
    try {
      const response = await backendFetch(`/api/rate-schedules/${path}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: ratingYear,
          bands,
          top_amount: topAmount,
          usv_rate_percent: usvRate,
          deadline: `${deadline}T23:59:00+03:00`,
          ...(isOwner ? { county } : {}),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(problemText(data) || `Request failed (${response.status})`);
      return data as Outcome;
    } catch (e) {
      toast.error((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const issue = async () => {
    const outcome = await post('issue');
    if (!outcome) return;
    toast.success(`${outcome.county} ${ratingYear}: ${outcome.created} bills created, ${outcome.updated} updated`);
    onIssued(ratingYear);
  };

  const setBand = (index: number, key: keyof Band, value: string) =>
    setBands((current) => current.map((band, i) => (i === index ? { ...band, [key]: value } : band)));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-main-bg border-border-default max-h-[90vh] w-full max-w-lg overflow-y-auto border-[0.5px] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Set rates and issue bills</h2>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Every parcel with an owner is billed. Re-issuing a year updates unpaid bills only.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-text-tertiary hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {isOwner && (
            <label className="col-span-2 flex flex-col gap-1">
              <span className={LABEL}>County</span>
              <select value={county} onChange={(e) => setCounty(e.target.value)} className={FIELD}>
                <option value="">Choose a county</option>
                {counties.map((c) => (
                  <option key={c.county_id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1">
            <span className={LABEL}>Rating year</span>
            <select value={ratingYear} onChange={(e) => setRatingYear(Number(e.target.value))} className={FIELD}>
              {ratingYears().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={LABEL}>Payment deadline</span>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={FIELD} />
          </label>
        </div>
        {savedYear && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            {ratingYear} already has saved rates, loaded below. Changes apply to unpaid bills only.
          </p>
        )}

        <div className="mt-4">
          <p className="text-sm font-medium text-text-primary">Flat rate by plot size</p>
          <div className="mt-2 space-y-2">
            {bands.map((band, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`${LABEL} w-14 shrink-0`}>Up to</span>
                <input inputMode="decimal" value={band.max_ha} onChange={(e) => setBand(i, 'max_ha', e.target.value)} className={FIELD} />
                <span className={`${LABEL} shrink-0`}>ha, KES</span>
                <input inputMode="decimal" value={band.amount} onChange={(e) => setBand(i, 'amount', e.target.value)} className={FIELD} />
                <button
                  onClick={() => setBands((current) => current.filter((_, j) => j !== i))}
                  aria-label="Remove band"
                  className="text-text-tertiary hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className={`${LABEL} w-14 shrink-0`}>Larger</span>
              <span className={`${LABEL} shrink-0`}>plots, KES</span>
              <input inputMode="decimal" value={topAmount} onChange={(e) => setTopAmount(e.target.value)} className={FIELD} />
            </div>
            <button onClick={() => setBands((current) => [...current, { max_ha: '', amount: '' }])} className={BUTTON}>
              <Plus className="h-4 w-4" /> Add size band
            </button>
          </div>
        </div>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">Site value rate (%)</span>
          <span className={LABEL}>Used instead of the flat rate for parcels with an unimproved site value.</span>
          <input inputMode="decimal" value={usvRate} onChange={(e) => setUsvRate(e.target.value)} className={FIELD} />
        </label>

        {preview && (
          <div className="border-border-default bg-hover-surface mt-4 border-[0.5px] p-3 text-sm text-text-primary">
            <p className="font-medium">
              {preview.county} {ratingYear}: {preview.parcels} owned parcel{preview.parcels === 1 ? '' : 's'},{' '}
              {formatMoney(preview.total_billed)} in total
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              {preview.created} new bill{preview.created === 1 ? '' : 's'} · {preview.updated} unpaid bill
              {preview.updated === 1 ? '' : 's'} updated · {preview.unchanged} unchanged or already paid
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={async () => setPreview(await post('preview'))} disabled={busy || (isOwner && !county)} className={BUTTON}>
            Preview
          </button>
          <button
            onClick={issue}
            disabled={busy || !preview}
            className="bg-text-primary px-3 py-1.5 text-sm font-medium text-main-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Working…' : 'Issue bills'}
          </button>
        </div>
      </div>
    </div>
  );
}
