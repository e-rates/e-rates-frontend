'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendFetch, backendJson } from '@/lib/backend';
import { formatMoney } from '@/lib/format';
import { landUseLabel, ratingYears } from '@/lib/rates';

type Block = 'sub_counties' | 'wards' | 'land_uses' | 'parcel_refs';

interface Waiver extends Record<Block, string[]> {
  waiver_id: string;
  name: string;
  legal_reference: string;
  percent: string;
  years: number[];
  starts_on: string;
  ends_on: string | null;
  status: 'active' | 'scheduled' | 'ended' | 'revoked';
  created_by: string | null;
  created_at: string;
  revoked_by: string | null;
  bills_affected: number;
  amount_waived: string;
}

interface Impact {
  bills: number;
  parcels: number;
  amount_waived: string;
}

const BLOCKS: { key: Block; label: string }[] = [
  { key: 'sub_counties', label: 'Sub-county' },
  { key: 'wards', label: 'Ward' },
  { key: 'land_uses', label: 'Land use' },
  { key: 'parcel_refs', label: 'Plot' },
];
const EMPTY_SCOPE: Record<Block, string[]> = { sub_counties: [], wards: [], land_uses: [], parcel_refs: [] };

const FIELD = 'border-border-default bg-main-bg w-full border-[0.5px] px-2 py-1.5 text-sm text-text-primary';
const LABEL = 'text-xs text-text-tertiary';
const BUTTON =
  'border-border-default hover:bg-hover-surface flex items-center gap-2 border-[0.5px] px-3 py-1.5 text-sm text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40';
const PRIMARY =
  'bg-text-primary px-3 py-1.5 text-sm font-medium text-main-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40';
const STATUS_DOT: Record<Waiver['status'], string> = {
  active: 'bg-green-600',
  scheduled: 'bg-amber-500',
  ended: 'bg-neutral-400',
  revoked: 'bg-red-600',
};

const today = () => new Date().toISOString().slice(0, 10);
const labelOf = (block: Block, value: string) => (block === 'land_uses' ? landUseLabel[value] ?? value : value);

const problemText = (data: Record<string, unknown>) =>
  Object.entries(data)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : String(value)}`)
    .join('; ');

export const scopeText = (w: Pick<Waiver, Block | 'years'>) => {
  const parts = BLOCKS.filter((b) => w[b.key].length).map(
    (b) => `${b.label}: ${w[b.key].map((v) => labelOf(b.key, v)).join(', ')}`,
  );
  return `${parts.length ? parts.join(' · ') : 'Every plot in the county'} · ${w.years.length ? w.years.join(', ') : 'all years'}`;
};

function ScopeBuilder({
  scope,
  setScope,
  wards,
  subCounties,
}: {
  scope: Record<Block, string[]>;
  setScope: (next: Record<Block, string[]>) => void;
  wards: string[];
  subCounties: string[];
}) {
  const [block, setBlock] = useState<Block>('wards');
  const [value, setValue] = useState('');
  const choices: Partial<Record<Block, string[]>> = {
    wards,
    sub_counties: subCounties,
    land_uses: Object.keys(landUseLabel),
  };
  const options = choices[block];

  const add = () => {
    const v = value.trim();
    if (!v || scope[block].some((x) => x.toLowerCase() === v.toLowerCase())) return;
    setScope({ ...scope, [block]: [...scope[block], v] });
    setValue('');
  };

  const pieces = BLOCKS.flatMap((b) => scope[b.key].map((v) => ({ block: b, value: v })));

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-text-primary">Who gets it</p>
      <p className={LABEL}>Stack blocks to narrow it down. Blocks of the same kind widen it. No blocks means the whole county.</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {pieces.length === 0 && <span className="border-border-default border-[0.5px] border-dashed px-2 py-1 text-xs text-text-tertiary">Whole county</span>}
        {pieces.map(({ block: b, value: v }) => (
          <span key={`${b.key}-${v}`} className="bg-hover-surface flex items-center gap-1.5 px-2 py-1 text-xs text-text-primary">
            <span className="text-text-tertiary">{b.label}</span> {labelOf(b.key, v)}
            <button
              onClick={() => setScope({ ...scope, [b.key]: scope[b.key].filter((x) => x !== v) })}
              aria-label={`Remove ${b.label} ${v}`}
              className="text-text-tertiary hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <select
          value={block}
          onChange={(e) => {
            setBlock(e.target.value as Block);
            setValue('');
          }}
          className={`${FIELD} w-32! shrink-0`}
        >
          {BLOCKS.map((b) => (
            <option key={b.key} value={b.key}>
              {b.label}
            </option>
          ))}
        </select>
        {options ? (
          <select value={value} onChange={(e) => setValue(e.target.value)} className={FIELD}>
            <option value="">Choose…</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {labelOf(block, o)}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Plot number, e.g. Aguthi-Gaaki/935"
            className={FIELD}
          />
        )}
        <button onClick={add} disabled={!value.trim()} className={BUTTON} aria-label="Add block">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Waivers({ open, year, onClose, onChanged }: { open: boolean; year: number; onClose: () => void; onChanged: () => void }) {
  const [rows, setRows] = useState<Waiver[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [wards, setWards] = useState<string[]>([]);
  const [subCounties, setSubCounties] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [legal, setLegal] = useState('');
  const [percent, setPercent] = useState('50');
  const [years, setYears] = useState<number[]>([year]);
  const [scope, setScope] = useState(EMPTY_SCOPE);
  const [startsOn, setStartsOn] = useState(today());
  const [endsOn, setEndsOn] = useState('');
  const [preview, setPreview] = useState<Impact | null>(null);
  const [busy, setBusy] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = useCallback(() => {
    backendJson<Waiver[]>('/api/waivers/')
      .then(setRows)
      .catch((e: Error) => {
        toast.error(e.message);
        setRows([]);
      });
  }, []);

  useEffect(() => {
    if (!open) return;
    load();
    backendJson<{ wards: { ward: string; sub_county: string }[] }>(`/api/payments/wards/?year=${year}`)
      .then((data) => {
        setWards([...new Set(data.wards.map((w) => w.ward).filter(Boolean))].sort());
        setSubCounties([...new Set(data.wards.map((w) => w.sub_county).filter(Boolean))].sort());
      })
      .catch(() => undefined);
  }, [open, year, load]);

  useEffect(() => setPreview(null), [name, legal, percent, years, scope, startsOn, endsOn]);

  const body = () => ({
    name,
    legal_reference: legal,
    percent,
    years,
    ...scope,
    starts_on: startsOn,
    ends_on: endsOn || null,
  });

  const post = async <T,>(path: string, payload?: object): Promise<T | null> => {
    setBusy(true);
    try {
      const response = await backendFetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(problemText(data) || `Request failed (${response.status})`);
      return data as T;
    } catch (e) {
      toast.error((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const create = async () => {
    const waiver = await post<Waiver>('/api/waivers/', body());
    if (!waiver) return;
    toast.success(`${waiver.name}: ${waiver.bills_affected} bill${waiver.bills_affected === 1 ? '' : 's'} reduced`);
    setCreating(false);
    setName('');
    setLegal('');
    setScope(EMPTY_SCOPE);
    load();
    onChanged();
  };

  const revoke = async (waiver: Waiver) => {
    if (revoking !== waiver.waiver_id) return setRevoking(waiver.waiver_id);
    setRevoking(null);
    if (await post<Waiver>(`/api/waivers/${waiver.waiver_id}/revoke/`)) {
      toast.success(`${waiver.name} revoked; its bills are back to the full amount`);
      load();
      onChanged();
    }
  };

  const toggleYear = (y: number) => setYears((current) => (current.includes(y) ? current.filter((x) => x !== y) : [...current, y].sort((a, b) => b - a)));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-main-bg border-border-default max-h-[90vh] w-full max-w-2xl overflow-y-auto border-[0.5px] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">{creating ? 'New waiver' : 'Waivers'}</h2>
            <p className="mt-0.5 text-xs text-text-tertiary">
              A percentage off the bill amount, applied automatically to unpaid bills it covers. Every change is logged.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-text-tertiary hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {creating ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="col-span-2 flex flex-col gap-1">
                <span className={LABEL}>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2026 drought relief" className={FIELD} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={LABEL}>Percent off the bill</span>
                <input inputMode="decimal" value={percent} onChange={(e) => setPercent(e.target.value)} className={FIELD} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={LABEL}>Gazette / resolution reference</span>
                <input value={legal} onChange={(e) => setLegal(e.target.value)} placeholder="Optional" className={FIELD} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={LABEL}>Starts</span>
                <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className={FIELD} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={LABEL}>Ends (optional)</span>
                <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} className={FIELD} />
              </label>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-text-primary">Rating years</p>
              <p className={LABEL}>None selected means every year with unpaid bills.</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ratingYears().map((y) => (
                  <button
                    key={y}
                    onClick={() => toggleYear(y)}
                    className={`border-[0.5px] px-2 py-0.5 text-xs transition-colors ${
                      years.includes(y) ? 'border-text-primary bg-text-primary text-main-bg' : 'border-border-default text-text-secondary hover:bg-hover-surface'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <ScopeBuilder scope={scope} setScope={setScope} wards={wards} subCounties={subCounties} />

            {preview && (
              <div className="border-border-default bg-hover-surface mt-4 border-[0.5px] p-3 text-sm text-text-primary">
                <p className="font-medium">
                  {preview.bills} unpaid bill{preview.bills === 1 ? '' : 's'} on {preview.parcels} plot{preview.parcels === 1 ? '' : 's'} ·{' '}
                  {formatMoney(preview.amount_waived)} waived
                </p>
                <p className="mt-1 text-xs text-text-secondary">{scopeText({ ...scope, years })}</p>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setCreating(false)} className={BUTTON}>
                Back
              </button>
              <button onClick={async () => setPreview(await post<Impact>('/api/waivers/preview/', body()))} disabled={busy || !name.trim()} className={BUTTON}>
                Preview
              </button>
              <button onClick={create} disabled={busy || !preview} className={PRIMARY}>
                {busy ? 'Working…' : 'Create waiver'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setCreating(true)} className={PRIMARY}>
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> New waiver
                </span>
              </button>
            </div>
            <div className="mt-3 divide-border-default divide-y-[0.5px]">
              {rows === null && <p className="py-6 text-center text-sm text-text-tertiary">Loading…</p>}
              {rows?.length === 0 && <p className="py-6 text-center text-sm text-text-tertiary">No waivers yet.</p>}
              {rows?.map((w) => (
                <div key={w.waiver_id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {Number(w.percent)}% · {w.name}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">{scopeText(w)}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-tertiary">
                      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[w.status]}`} />
                      {w.status} · from {w.starts_on}
                      {w.ends_on ? ` to ${w.ends_on}` : ''} · {w.bills_affected} bills, {formatMoney(w.amount_waived)} · by {w.created_by ?? '—'}
                      {w.revoked_by ? ` · revoked by ${w.revoked_by}` : ''}
                      {w.legal_reference ? ` · ${w.legal_reference}` : ''}
                    </p>
                  </div>
                  {w.status !== 'revoked' && (
                    <button onClick={() => revoke(w)} disabled={busy} className={`${BUTTON} shrink-0 ${revoking === w.waiver_id ? 'text-red-600!' : ''}`}>
                      {revoking === w.waiver_id ? 'Confirm revoke' : 'Revoke'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
