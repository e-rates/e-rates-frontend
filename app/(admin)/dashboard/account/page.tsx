'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BUTTON, Field, INPUT, PRIMARY_BUTTON, Row, Section } from '../../components/forms/Section';
import { backendFetch, backendJson } from '@/lib/backend';

interface Profile {
  user_id: string;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  county: string;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
}

type FieldErrors = Record<string, string>;

const ROLE_LABELS: Record<string, string> = {
  owner: 'Platform owner',
  admin: 'County official',
  auditor: 'Auditor',
  user: 'Land owner',
};

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-KE', { dateStyle: 'long' });

function toFieldErrors(body: Record<string, unknown>): FieldErrors {
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key, Array.isArray(value) ? String(value[0]) : String(value)])
  );
}

function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const dirty = email !== profile.email || phone !== (profile.phone ?? '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const response = await backendFetch('/api/users/me/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(toFieldErrors(body));
        return;
      }
      onSaved(body as Profile);
      toast.success(
        phone !== (profile.phone ?? '')
          ? 'Saved. Sign in with the new number next time.'
          : 'Profile saved.'
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <Field id="username" label="Username" hint="Assigned by the county.">
          <input id="username" value={profile.username} disabled className={INPUT} />
        </Field>
        <Field id="email" label="Email" error={errors.email} hint="Changing this marks the address unverified.">
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={INPUT} />
        </Field>
        <Field id="phone" label="Phone number" error={errors.phone} hint="Used for sign-in and M-Pesa prompts.">
          <input id="phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
        </Field>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={!dirty || saving} className={PRIMARY_BUTTON}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {dirty && !saving && (
          <button
            type="button"
            className={BUTTON}
            onClick={() => {
              setEmail(profile.email);
              setPhone(profile.phone ?? '');
              setErrors({});
            }}
          >
            Discard
          </button>
        )}
      </div>
    </form>
  );
}

function PasswordForm() {
  const empty = { current_password: '', new_password: '', new_password_confirm: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const response = await backendFetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(toFieldErrors(body));
        return;
      }
      setForm(empty);
      toast.success('Password updated.');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <Field id="current_password" label="Current password" error={errors.current_password}>
          <input id="current_password" type="password" autoComplete="current-password" value={form.current_password} onChange={set('current_password')} required className={INPUT} />
        </Field>
        <Field id="new_password" label="New password" error={errors.new_password} hint="At least 8 characters.">
          <input id="new_password" type="password" autoComplete="new-password" value={form.new_password} onChange={set('new_password')} required className={INPUT} />
        </Field>
        <Field id="new_password_confirm" label="Confirm new password" error={errors.new_password_confirm ?? errors.non_field_errors}>
          <input id="new_password_confirm" type="password" autoComplete="new-password" value={form.new_password_confirm} onChange={set('new_password_confirm')} required className={INPUT} />
        </Field>
      </div>
      <button type="submit" disabled={saving || !form.current_password || !form.new_password} className={PRIMARY_BUTTON}>
        {saving ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    backendJson<Profile>('/api/users/me/')
      .then(setProfile)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto px-6 pb-10">
      <div className="border-border-default border-b-[0.5px] py-6">
        <h1 className="text-text-primary text-2xl font-semibold">Account</h1>
        <p className="text-text-tertiary mt-1 text-sm">Your details in the rates office.</p>
      </div>

      {error && <p className="py-8 text-sm text-red-700">{error}</p>}
      {!error && !profile && <p className="text-text-tertiary py-8 text-sm">Loading…</p>}

      {profile && (
        <>
          <Section title="Your details" description="Email and phone number are yours to change.">
            <ProfileForm profile={profile} onSaved={setProfile} />
          </Section>

          <Section title="Password" description="Change the password you sign in with.">
            <PasswordForm />
          </Section>

          <Section title="Role and access" description="Set by whoever created this account.">
            <dl className="grid gap-x-10 lg:grid-cols-2">
              <Row label="Role" value={ROLE_LABELS[profile.role] ?? profile.role} />
              <Row label="County" value={profile.county || 'All counties'} />
              <Row label="Email verified" value={profile.is_verified ? 'Yes' : 'No'} />
              <Row label="Account created" value={longDate(profile.created_at)} />
              <Row
                label="Last sign-in"
                value={profile.last_login ? new Date(profile.last_login).toLocaleString('en-KE') : '—'}
              />
            </dl>
          </Section>
        </>
      )}
    </div>
  );
}
