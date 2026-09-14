'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { KeyRound, Loader2, Search, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendFetch, backendJson } from '@/lib/backend';
import { authService } from '@/lib/auth';
import { EmptyState } from '../../components/EmptyState';
import { IssuedAccount, OneTimePassword } from '../../components/OneTimePassword';

interface Account {
  user_id: string;
  username: string;
  email: string;
  phone: string | null;
  national_id: string | null;
  county: string;
  is_active: boolean;
  must_change_password: boolean;
  last_login: string | null;
  created_at: string;
}

const CELL = 'px-5 py-2.5 whitespace-nowrap';
const HEAD = 'bg-main-bg sticky top-0 z-10 text-left text-[11px] font-medium tracking-wide text-text-tertiary uppercase';
const field = 'border-border-default bg-main-bg w-full border-[0.5px] px-3 py-2 text-sm text-text-primary';
const primary = 'bg-text-primary text-main-bg flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-40';
const ghost = 'border-border-default hover:bg-hover-surface border-[0.5px] px-3 py-1.5 text-xs text-text-primary';

const shortDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—');

export default function LandOwnersPage() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ username: '', email: '', phone: '', national_id: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [issued, setIssued] = useState<IssuedAccount | null>(null);
  const county = authService.getCounty();

  const load = useCallback(async (term = '') => {
    try {
      const query = new URLSearchParams({ role: 'user', ordering: '-created_at' });
      if (term) query.set('search', term);
      const page = await backendJson<{ results: Account[] }>(`/api/users/?${query}`);
      setAccounts(page.results);
    } catch (e) {
      toast.error((e as Error).message);
      setAccounts([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search.trim()), search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [search, load]);

  const create = async (e: React.FormEvent) => {
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
      setIssued({ username: body.username, password: body.temporary_password });
      setForm({ username: '', email: '', phone: '', national_id: '' });
      load(search.trim());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (account: Account) => {
    try {
      const response = await backendFetch(`/api/users/${account.user_id}/reset_password/`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not reset the password');
      setIssued({ username: body.username, password: body.temporary_password, note: 'New one-time password. The old one no longer works.' });
      load(search.trim());
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="bg-main-bg flex h-full w-full flex-col overflow-y-auto">
      <div className="border-border-default border-b-[0.5px] px-6 py-4">
        <h1 className="text-lg font-semibold text-text-primary">Land owners{county ? ` · ${county}` : ''}</h1>
      </div>

      <form onSubmit={create} className="border-border-default grid gap-4 border-b-[0.5px] px-6 py-5 lg:grid-cols-5">
        {([
          ['username', 'Username', 'e.g. jane_mwangi', true],
          ['email', 'Email', 'jane@example.com', true],
          ['phone', 'Phone number', '07…', false],
          ['national_id', 'National ID', 'optional', false],
        ] as const).map(([name, label, placeholder, required]) => (
          <label key={name} className="flex flex-col gap-1 text-xs text-text-tertiary">
            {label}
            <input
              value={form[name]}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              placeholder={placeholder}
              required={required}
              type={name === 'email' ? 'email' : 'text'}
              className={field}
            />
            {errors[name] && <span className="text-red-600 dark:text-red-400">{errors[name]}</span>}
          </label>
        ))}
        <div className="flex items-end">
          <button type="submit" disabled={saving} className={primary}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create account
          </button>
        </div>
      </form>

      {issued && (
        <div className="px-6 pt-4">
          <OneTimePassword account={issued} onClose={() => setIssued(null)} />
        </div>
      )}

      <div className="flex items-center justify-between gap-3 px-6 py-3">
        <div className="relative w-72">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className={`${field} pl-9`}
          />
        </div>
        <span className="text-xs text-text-tertiary">{accounts ? `${accounts.length} shown` : 'Loading…'}</span>
      </div>

      {accounts?.length === 0 ? (
        <EmptyState icon={Users} title="No land owners yet" message="Create the first account with the form above." />
      ) : (
        <table className="w-full text-sm">
          <thead className={HEAD}>
            <tr className="border-border-default border-b-[0.5px]">
              <th className={CELL}>Name</th>
              <th className={CELL}>Phone</th>
              <th className={CELL}>Email</th>
              <th className={CELL}>National ID</th>
              <th className={CELL}>Status</th>
              <th className={CELL}>Last sign-in</th>
              <th className={CELL}></th>
            </tr>
          </thead>
          <tbody className="divide-border-default divide-y-[0.5px]">
            {(accounts ?? []).map((a) => (
              <tr key={a.user_id} className="hover:bg-hover-surface">
                <td className={`${CELL} font-medium text-text-primary`}>{a.username}</td>
                <td className={`${CELL} text-text-secondary tabular-nums`}>{a.phone || '—'}</td>
                <td className={`${CELL} text-text-secondary`}>{a.email}</td>
                <td className={`${CELL} text-text-secondary`}>{a.national_id || '—'}</td>
                <td className={`${CELL} text-text-secondary`}>
                  {!a.is_active ? 'Deactivated' : a.must_change_password ? 'Awaiting first sign-in' : 'Active'}
                </td>
                <td className={`${CELL} text-text-tertiary`}>{shortDate(a.last_login)}</td>
                <td className={CELL}>
                  <button onClick={() => resetPassword(a)} className={ghost}>
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
