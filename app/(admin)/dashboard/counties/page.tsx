'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Building2, KeyRound, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendFetch, backendJson } from '@/lib/backend';
import { formatMoney } from '@/lib/format';
import { EmptyState } from '../../components/EmptyState';
import { YearSelect, useYearParam } from '../../components/YearSelect';
import { IssuedAccount, OneTimePassword } from '../../components/OneTimePassword';

interface CountyRow {
  county: string;
  parcels: number;
  allocated: number;
  ratepayers: number;
  officials: number;
  billed: string;
  collected: string;
  outstanding: string;
}

interface Official {
  user_id: string;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  county: string;
  is_active: boolean;
  must_change_password: boolean;
  last_login: string | null;
}

const CELL = 'px-5 py-2.5 whitespace-nowrap';
const HEAD = 'bg-main-bg sticky top-0 z-10 text-left text-[11px] font-medium tracking-wide text-text-tertiary uppercase';
const field = 'border-border-default bg-main-bg w-full border-[0.5px] px-3 py-2 text-sm text-text-primary';
const primary = 'bg-text-primary text-main-bg flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-40';
const ghost = 'border-border-default hover:bg-hover-surface border-[0.5px] px-3 py-1.5 text-xs text-text-primary';

const shortDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—');

interface CountyRecord {
  county_id: string;
  name: string;
  logo_url: string | null;
  rates_office_email: string;
  rates_office_phone: string;
  paybill: string;
  is_active: boolean;
}

/** The platform owner's register of Kenya's 47 counties: onboarding, crest, paybill and rates office contacts. */
function CountyRegistry({ onChange }: { onChange: () => void }) {
  const [counties, setCounties] = useState<CountyRecord[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const page = await backendJson<{ results: CountyRecord[] }>('/api/counties/');
      setCounties(page.results);
    } catch (e) {
      toast.error((e as Error).message);
      setCounties([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patchCounty = async (county: CountyRecord, body: FormData | Record<string, unknown>) => {
    setBusy(county.county_id);
    try {
      const isFile = body instanceof FormData;
      const response = await backendFetch(`/api/counties/${county.county_id}/`, {
        method: 'PATCH',
        ...(isFile ? {} : { headers: { 'Content-Type': 'application/json' } }),
        body: isFile ? (body as FormData) : JSON.stringify(body),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(Object.values(problem).flat().join(' ') || `Update failed (${response.status})`);
      }
      await load();
      onChange();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const uploadLogo = (county: CountyRecord, file: File) => {
    const form = new FormData();
    form.append('logo', file);
    patchCounty(county, form);
  };

  const saveField = (county: CountyRecord, key: 'paybill' | 'rates_office_email' | 'rates_office_phone', value: string) => {
    if (value.trim() !== county[key]) patchCounty(county, { [key]: value.trim() });
  };

  const onboarded = (counties ?? []).filter((c) => c.is_active);
  const visible = [...(counties ?? [])]
    .filter((c) => showAll || c.is_active)
    .sort((a, b) => Number(b.is_active) - Number(a.is_active) || a.name.localeCompare(b.name));

  return (
    <>
      <div className="border-border-default mt-6 flex flex-wrap items-end justify-between gap-3 border-y-[0.5px] px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">County register</h2>
          <p className="mt-0.5 text-sm text-text-tertiary">
            {counties ? `${onboarded.length} of ${counties.length} counties onboarded` : 'Loading…'}
          </p>
        </div>
        <button onClick={() => setShowAll(!showAll)} className={ghost}>
          {showAll ? 'Show onboarded only' : `Show all ${counties?.length ?? 47} counties`}
        </button>
      </div>

      {counties && visible.length === 0 ? (
        <EmptyState icon={Building2} title="No counties onboarded yet" message="Show all counties and onboard the first one." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={HEAD}>
              <tr className="border-border-default border-b-[0.5px]">
                <th className={CELL}>Crest</th>
                <th className={CELL}>County</th>
                <th className={CELL}>M-Pesa paybill</th>
                <th className={CELL}>Rates office email</th>
                <th className={CELL}>Rates office phone</th>
                <th className={CELL}>Status</th>
                <th className={CELL}></th>
              </tr>
            </thead>
            <tbody className="divide-border-default divide-y-[0.5px]">
              {visible.map((c) => (
                <tr key={c.county_id} className="hover:bg-hover-surface">
                  <td className={CELL}>
                    {c.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo_url} alt={`${c.name} crest`} className="h-8 w-8 object-contain" />
                    ) : (
                      <span className="bg-hover-surface flex h-8 w-8 items-center justify-center text-[11px] text-text-tertiary">
                        {c.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className={`${CELL} font-medium text-text-primary`}>{c.name}</td>
                  {(['paybill', 'rates_office_email', 'rates_office_phone'] as const).map((key) => (
                    <td key={key} className="px-3 py-1.5">
                      <input
                        key={`${c.county_id}-${key}-${c[key]}`}
                        defaultValue={c[key]}
                        disabled={!c.is_active || busy === c.county_id}
                        placeholder={c.is_active ? '—' : ''}
                        onBlur={(e) => saveField(c, key, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                        className="hover:border-border-default focus:border-border-default w-full min-w-[9rem] border-[0.5px] border-transparent bg-transparent px-2 py-1 text-sm text-text-secondary focus:bg-main-bg focus:outline-none disabled:opacity-50"
                      />
                    </td>
                  ))}
                  <td className={CELL}>
                    <span className="inline-flex items-center gap-2 text-text-secondary">
                      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${c.is_active ? 'bg-green-600' : 'bg-neutral-400'}`} />
                      {c.is_active ? 'Onboarded' : 'Not onboarded'}
                    </span>
                  </td>
                  <td className={`${CELL} flex gap-2`}>
                    {c.is_active && (
                      <label className={`${ghost} cursor-pointer`}>
                        {busy === c.county_id ? 'Saving…' : c.logo_url ? 'Replace crest' : 'Upload crest'}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadLogo(c, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                    <button
                      onClick={() => patchCounty(c, { is_active: !c.is_active })}
                      disabled={busy === c.county_id}
                      className={c.is_active ? ghost : `${primary} py-1.5 text-xs`}
                    >
                      {c.is_active ? 'Suspend' : 'Onboard'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function CountiesView() {
  const [year] = useYearParam();
  const [counties, setCounties] = useState<CountyRow[] | null>(null);
  const [onboarded, setOnboarded] = useState<string[]>([]);
  const [officials, setOfficials] = useState<Official[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', email: '', phone: '', county: '', role: 'admin' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [issued, setIssued] = useState<IssuedAccount | null>(null);

  const load = useCallback(async () => {
    try {
      const [overview, admins, auditors, register] = await Promise.all([
        backendJson<{ counties: CountyRow[] }>(`/api/payments/counties/?year=${year}`),
        backendJson<{ results: Official[] }>('/api/users/?role=admin&ordering=county'),
        backendJson<{ results: Official[] }>('/api/users/?role=auditor&ordering=county'),
        backendJson<{ results: CountyRecord[] }>('/api/counties/?is_active=true'),
      ]);
      setOnboarded(register.results.map((c) => c.name));
      setCounties(overview.counties);
      setOfficials([...admins.results, ...auditors.results]);
      setLoadError(null);
    } catch (e) {
      const message = (e as Error).message;
      toast.error(message);
      setLoadError(message);
      setCounties([]);
      setOfficials([]);
    }
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  const createOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const response = await backendFetch('/api/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(Object.fromEntries(Object.entries(body).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)])));
        return;
      }
      setIssued({
        username: body.username,
        password: body.temporary_password,
        note: `${body.county} official. They can now create land owner accounts for that county.`,
      });
      setForm({ username: '', email: '', phone: '', county: '', role: 'admin' });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (official: Official) => {
    try {
      const response = await backendFetch(`/api/users/${official.user_id}/reset_password/`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not reset the password');
      setIssued({ username: body.username, password: body.temporary_password, note: 'New one-time password. The old one no longer works.' });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const totals = (counties ?? []).reduce(
    (sum, c) => ({
      parcels: sum.parcels + c.parcels,
      ratepayers: sum.ratepayers + c.ratepayers,
      collected: sum.collected + Number(c.collected),
      outstanding: sum.outstanding + Number(c.outstanding),
    }),
    { parcels: 0, ratepayers: 0, collected: 0, outstanding: 0 }
  );

  return (
    <div className="bg-main-bg flex h-full w-full flex-col overflow-y-auto">
      <div className="border-border-default flex flex-wrap items-end justify-between gap-3 border-b-[0.5px] px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Counties</h1>
          <p className="mt-0.5 text-sm text-text-tertiary">
            {counties
              ? `${counties.length} count${counties.length === 1 ? 'y' : 'ies'} · ${totals.parcels.toLocaleString()} plots · ${formatMoney(totals.collected)} collected in ${year}`
              : loadError
                ? 'Could not load the platform figures.'
                : 'Loading…'}
          </p>
        </div>
        <YearSelect />
      </div>

      {loadError ? (
        <EmptyState icon={Building2} title="Could not load counties" message={`${loadError} Reload the page to try again.`} />
      ) : counties?.length === 0 ? (
        <EmptyState icon={Building2} title="No counties yet" message="Counties appear once parcels are imported and officials are created." />
      ) : (
        <table className="w-full text-sm">
          <thead className={HEAD}>
            <tr className="border-border-default border-b-[0.5px]">
              <th className={CELL}>County</th>
              <th className={`${CELL} text-right`}>Plots</th>
              <th className={`${CELL} text-right`}>Allocated</th>
              <th className={`${CELL} text-right`}>Land owners</th>
              <th className={`${CELL} text-right`}>Officials</th>
              <th className={`${CELL} text-right`}>Billed {year}</th>
              <th className={`${CELL} text-right`}>Collected</th>
              <th className={`${CELL} text-right`}>Outstanding</th>
            </tr>
          </thead>
          <tbody className="divide-border-default divide-y-[0.5px]">
            {(counties ?? []).map((c) => (
              <tr key={c.county} className="hover:bg-hover-surface">
                <td className={`${CELL} font-medium text-text-primary`}>{c.county}</td>
                <td className={`${CELL} text-right tabular-nums`}>{c.parcels.toLocaleString()}</td>
                <td className={`${CELL} text-right tabular-nums`}>{c.allocated.toLocaleString()}</td>
                <td className={`${CELL} text-right tabular-nums`}>{c.ratepayers.toLocaleString()}</td>
                <td className={`${CELL} text-right tabular-nums`}>{c.officials}</td>
                <td className={`${CELL} text-right tabular-nums`}>{formatMoney(c.billed)}</td>
                <td className={`${CELL} text-right tabular-nums`}>{formatMoney(c.collected)}</td>
                <td className={`${CELL} text-right tabular-nums`}>{formatMoney(c.outstanding)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CountyRegistry onChange={load} />

      <div className="border-border-default mt-6 border-y-[0.5px] px-6 py-4">
        <h2 className="text-base font-semibold text-text-primary">County officials</h2>
      </div>

      <form onSubmit={createOfficial} className="border-border-default grid gap-4 border-b-[0.5px] px-6 py-5 lg:grid-cols-6">
        {([
          ['username', 'Username', 'e.g. nyeri_rates', 'text', true],
          ['email', 'Email', 'official@county.go.ke', 'email', true],
          ['phone', 'Phone number', '07…', 'tel', false],
        ] as const).map(([name, label, placeholder, type, required]) => (
          <label key={name} className="flex flex-col gap-1 text-xs text-text-tertiary">
            {label}
            <input
              value={form[name]}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              placeholder={placeholder}
              type={type}
              required={required}
              className={field}
            />
            {errors[name] && <span className="text-red-600 dark:text-red-400">{errors[name]}</span>}
          </label>
        ))}
        <label className="flex flex-col gap-1 text-xs text-text-tertiary">
          County
          <select value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} required className={field}>
            <option value="">Choose an onboarded county</option>
            {onboarded.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {errors.county && <span className="text-red-600 dark:text-red-400">{errors.county}</span>}
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-tertiary">
          Access
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={field}>
            <option value="admin">County official</option>
            <option value="auditor">Auditor (read only)</option>
          </select>
          {errors.role && <span className="text-red-600 dark:text-red-400">{errors.role}</span>}
        </label>
        <div className="flex items-end">
          <button type="submit" disabled={saving} className={primary}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create official
          </button>
        </div>
      </form>

      {issued && (
        <div className="px-6 pt-4">
          <OneTimePassword account={issued} onClose={() => setIssued(null)} />
        </div>
      )}

      {officials?.length === 0 ? (
        <EmptyState icon={Building2} title="No officials yet" message="Create the first county official with the form above." />
      ) : (
        <table className="w-full text-sm">
          <thead className={HEAD}>
            <tr className="border-border-default border-b-[0.5px]">
              <th className={CELL}>Official</th>
              <th className={CELL}>County</th>
              <th className={CELL}>Access</th>
              <th className={CELL}>Contact</th>
              <th className={CELL}>Status</th>
              <th className={CELL}>Last sign-in</th>
              <th className={CELL}></th>
            </tr>
          </thead>
          <tbody className="divide-border-default divide-y-[0.5px]">
            {(officials ?? []).map((o) => (
              <tr key={o.user_id} className="hover:bg-hover-surface">
                <td className={`${CELL} font-medium text-text-primary`}>{o.username}</td>
                <td className={`${CELL} text-text-secondary`}>{o.county || '—'}</td>
                <td className={`${CELL} text-text-secondary`}>{o.role === 'admin' ? 'County official' : 'Auditor'}</td>
                <td className={`${CELL} text-text-secondary`}>{o.phone || o.email}</td>
                <td className={`${CELL} text-text-secondary`}>
                  {!o.is_active ? 'Deactivated' : o.must_change_password ? 'Awaiting first sign-in' : 'Active'}
                </td>
                <td className={`${CELL} text-text-tertiary`}>{shortDate(o.last_login)}</td>
                <td className={CELL}>
                  <button onClick={() => resetPassword(o)} className={ghost}>
                    <KeyRound className="mr-1 inline h-3.5 w-3.5" />
                    New password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function CountiesPage() {
  return (
    <Suspense fallback={null}>
      <CountiesView />
    </Suspense>
  );
}
