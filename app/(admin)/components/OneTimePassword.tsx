'use client';

import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';

export interface IssuedAccount {
  username: string;
  password: string;
  note?: string;
}

export function OneTimePassword({ account, onClose }: { account: IssuedAccount; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Username: ${account.username}\nPassword: ${account.password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="border-border-default bg-hover-surface border-[0.5px] px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-text-primary">Account created</p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {account.note ?? 'Give these details to the person. They must choose a new password at first sign-in.'}
          </p>
        </div>
        <button onClick={onClose} aria-label="Dismiss" className="text-text-tertiary hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>
      <dl className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
        <div>
          <dt className="text-[11px] text-text-tertiary">Username</dt>
          <dd className="font-mono text-text-primary">{account.username}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-text-tertiary">One-time password</dt>
          <dd className="font-mono text-text-primary">{account.password}</dd>
        </div>
        <button
          onClick={copy}
          className="border-border-default hover:bg-main-bg flex items-center gap-2 border-[0.5px] px-3 py-1.5 text-xs text-text-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </dl>
      <p className="mt-3 text-[11px] text-text-tertiary">This password is shown once. If it is lost, issue a new one from the list below.</p>
    </div>
  );
}
