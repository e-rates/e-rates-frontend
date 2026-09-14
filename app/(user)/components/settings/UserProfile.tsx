'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { authService } from '@/lib/auth';

interface Profile {
  user_id: string;
  username: string;
  email: string;
  phone: string | null;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
}

type FieldErrors = Record<string, string>;

const PRIMARY =
  'h-10 rounded-none! bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200';
const INPUT = 'h-10 rounded-none! bg-white dark:bg-neutral-950';
const dateFmt = (iso: string) => new Date(iso).toLocaleDateString('en-KE', { dateStyle: 'long' });

async function send(url: string, method: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const token = await authService.getValidAccessToken();
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

function toFieldErrors(data: Record<string, unknown>): FieldErrors {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? String(value[0]) : String(value)])
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-b border-neutral-200 py-8 last:border-0 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10 dark:border-neutral-800">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
      ) : (
        hint && <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      )}
    </div>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const dirty = email !== profile.email || phone !== (profile.phone ?? '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const { ok, data } = await send('/api/users/me', 'PATCH', { email, phone });
    setSaving(false);
    if (!ok) {
      setErrors(toFieldErrors(data));
      return;
    }
    queryClient.setQueryData(['profile'], data);
    toast.success(phone !== (profile.phone ?? '') ? 'Saved. Log in with your new number next time.' : 'Profile saved');
  };

  return (
    <form onSubmit={submit} className="max-w-md space-y-5">
      <Field id="username" label="Username" hint="Assigned by the county. Contact the rates office to change it.">
        <Input id="username" value={profile.username} disabled className={INPUT} />
      </Field>
      <Field id="email" label="Email" error={errors.email} hint="Changing your email marks it unverified.">
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={INPUT} />
      </Field>
      <Field id="phone" label="Phone number" error={errors.phone} hint="You log in with this number. It is also used for M-Pesa prompts.">
        <Input id="phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={!dirty || saving} className={PRIMARY}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        {dirty && !saving && (
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-none!"
            onClick={() => {
              setEmail(profile.email);
              setPhone(profile.phone ?? '');
              setErrors({});
            }}
          >
            Discard
          </Button>
        )}
      </div>
    </form>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ current_password: '', new_password: '', new_password_confirm: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const { ok, data } = await send('/api/users/change-password', 'POST', form);
    setSaving(false);
    if (!ok) {
      setErrors(toFieldErrors(data));
      return;
    }
    setForm({ current_password: '', new_password: '', new_password_confirm: '' });
    toast.success('Password updated');
  };

  return (
    <form onSubmit={submit} className="max-w-md space-y-5">
      <Field id="current_password" label="Current password" error={errors.current_password}>
        <Input id="current_password" type="password" autoComplete="current-password" value={form.current_password} onChange={set('current_password')} required className={INPUT} />
      </Field>
      <Field id="new_password" label="New password" error={errors.new_password} hint="At least 8 characters. Avoid common words.">
        <Input id="new_password" type="password" autoComplete="new-password" value={form.new_password} onChange={set('new_password')} required className={INPUT} />
      </Field>
      <Field id="new_password_confirm" label="Confirm new password" error={errors.new_password_confirm ?? errors.non_field_errors}>
        <Input id="new_password_confirm" type="password" autoComplete="new-password" value={form.new_password_confirm} onChange={set('new_password_confirm')} required className={INPUT} />
      </Field>
      <Button type="submit" disabled={saving || !form.current_password || !form.new_password} className={PRIMARY}>
        {saving ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}


function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-neutral-100 py-3 last:border-0 dark:border-neutral-800">
      <dt className="text-sm text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-neutral-900 dark:text-white">{value}</dd>
    </div>
  );
}

const UserSettings = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const token = await authService.getValidAccessToken();
      const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error || 'Could not load your profile');
      return body.data as Profile;
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">Settings</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your contact details, password and display.</p>

      {isLoading && <p className="py-10 text-sm text-neutral-500">Loading…</p>}
      {error && <p className="py-10 text-sm text-red-700">{(error as Error).message}</p>}

      {profile && (
        <div className="mt-4">
          <Section title="Profile" description="How the county reaches you about your rates.">
            <ProfileForm key={`${profile.email}-${profile.phone}`} profile={profile} />
          </Section>
          <Section title="Password" description="Use a password you don't use anywhere else.">
            <PasswordForm />
          </Section>
          <Section title="Account" description="Your account status with the county.">
            <dl className="max-w-md">
              <Row
                label="Email verification"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: profile.is_verified ? '#16a34a' : '#a3a3a3' }} />
                    {profile.is_verified ? 'Verified' : 'Not verified'}
                  </span>
                }
              />
              <Row label="Member since" value={dateFmt(profile.created_at)} />
              <Row label="Last sign-in" value={profile.last_login ? dateFmt(profile.last_login) : '—'} />
            </dl>
          </Section>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
