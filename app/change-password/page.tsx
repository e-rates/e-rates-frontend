'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';
import { authService } from '@/lib/auth';

const field =
  'w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ current_password: '', new_password: '', new_password_confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authService.isAccessTokenValid()) router.replace('/account');
    else setReady(true);
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const token = await authService.getValidAccessToken();
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(Object.fromEntries(Object.entries(body).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)])));
        return;
      }
      // the flag lives in the token, so start a fresh session with the new password
      authService.clearTokens();
      router.replace('/account');
    } catch (error) {
      setErrors({ new_password: (error as Error).message });
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-neutral-950">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 border border-neutral-200 p-6 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-neutral-500" />
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Choose your own password</h1>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          You signed in with a one-time password. Pick a new one to continue.
        </p>

        {([
          ['current_password', 'One-time password', 'current-password'],
          ['new_password', 'New password', 'new-password'],
          ['new_password_confirm', 'Confirm new password', 'new-password'],
        ] as const).map(([name, label, autoComplete]) => (
          <label key={name} className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
            <input
              type="password"
              autoComplete={autoComplete}
              value={form[name]}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              required
              className={field}
            />
            {errors[name] && <span className="block text-xs text-red-700 dark:text-red-400">{errors[name]}</span>}
          </label>
        ))}
        {errors.detail && <p className="text-xs text-red-700 dark:text-red-400">{errors.detail}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Set password and sign in again
        </button>
      </form>
    </div>
  );
}
