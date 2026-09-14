'use client';

import React from 'react';

export const INPUT =
  'h-10 w-full rounded-none border border-border-default bg-white px-3 text-sm text-text-primary focus:border-text-tertiary focus:outline-none disabled:bg-hover-surface disabled:text-text-tertiary';

/** Fixed-width control for a right-hand slot, so labels keep their space. */
export const SELECT =
  'h-10 w-44 shrink-0 rounded-none border border-border-default bg-white px-3 text-sm text-text-primary focus:border-text-tertiary focus:outline-none';

export const BUTTON =
  'h-10 rounded-none border border-border-default px-4 text-sm text-text-primary transition-colors hover:bg-hover-surface disabled:cursor-not-allowed disabled:opacity-40';

export const PRIMARY_BUTTON =
  'h-10 rounded-none bg-text-primary px-4 text-sm font-medium text-main-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30';

/** Label and description on the left, controls on the right. */
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border-default grid gap-4 border-b-[0.5px] py-8 last:border-0 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-text-primary text-sm font-semibold">{title}</h2>
        <p className="text-text-tertiary mt-1 text-sm">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** A read-only fact: label left, value right. */
export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-border-default flex items-baseline justify-between gap-4 border-b-[0.5px] py-3 last:border-0">
      <dt className="text-text-tertiary text-sm">{label}</dt>
      <dd className="text-text-primary text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

/** A labelled control with optional hint or error. */
export function Field({
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
      <label htmlFor={id} className="text-text-secondary block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-700">{error}</p>
      ) : (
        hint && <p className="text-text-tertiary text-xs">{hint}</p>
      )}
    </div>
  );
}

/** Name and hint on the left, one control on the right. Every settings row uses this. */
export function ControlRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border-default flex items-center justify-between gap-8 border-b-[0.5px] py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-text-primary text-sm font-medium">{label}</p>
        <p className="text-text-tertiary mt-0.5 text-xs">{hint}</p>
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  );
}

/** A switch row: name and hint left, checkbox right. */
export function ToggleRow({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="border-border-default flex items-center justify-between gap-8 border-b-[0.5px] py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-text-primary text-sm font-medium">{label}</p>
        <p className="text-text-tertiary mt-0.5 text-xs">{hint}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="h-4 w-4 shrink-0 rounded-none accent-neutral-900 disabled:opacity-40"
      />
    </div>
  );
}
