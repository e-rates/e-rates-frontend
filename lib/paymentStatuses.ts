'use client';

import { useSyncExternalStore } from 'react';
import { backendJson } from './backend';

type Statuses = Record<string, string>;

const REFRESH_MS = 60_000;
let statuses: Statuses = {};
let loadedYear: number | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

async function load(year: number) {
  try {
    const data = await backendJson<{ statuses: Statuses }>(`/api/parcels/payment-statuses/?year=${year}`);
    if (data?.statuses) {
      statuses = data.statuses;
      loadedYear = year;
      listeners.forEach((notify) => notify());
    }
  } catch {
    // Suppress console error to avoid Next.js dev overlay
  }
}

export function watchPaymentStatuses(year = new Date().getFullYear()) {
  if (loadedYear !== year) load(year);
  if (timer) clearInterval(timer);
  timer = setInterval(() => load(year), REFRESH_MS);
}

export function refreshPaymentStatuses() {
  return load(loadedYear ?? new Date().getFullYear());
}

export function subscribePaymentStatuses(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

export const paymentStatusOf = (parcelRef?: string | null) => (parcelRef ? statuses[parcelRef] : undefined) ?? 'not_billed';

export function usePaymentStatus(parcelRef?: string | null) {
  return useSyncExternalStore(
    subscribePaymentStatuses,
    () => paymentStatusOf(parcelRef),
    () => 'not_billed'
  );
}
