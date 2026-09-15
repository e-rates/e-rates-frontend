import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from './auth';

export type RateStatus = 'paid' | 'processing' | 'unpaid' | 'overdue' | 'not_billed';

export interface RateBill {
  payment_id: string;
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  deadline: string | null;
  days_overdue: number | null;
  receipt: string | null;
  failure_reason: string | null;
  basis: 'usv' | 'flat_area_band' | null;
  paid_at: string | null;
  explanation: string | null;
  standard_amount: string | null;
  waiver: { waiver_id: string; name: string; percent: string } | null;
}

export interface MyWaiver {
  waiver_id: string;
  county: string;
  name: string;
  legal_reference: string;
  percent: string;
  years: number[];
  starts_on: string;
  ends_on: string | null;
  status: 'active' | 'scheduled' | 'ended';
  created_at: string;
  plots: string[];
  claimed_plots: string[];
}

export interface RateParcelProperties {
  parcel_ref: string;
  owner_id: string | null;
  area_m2: number | null;
  area_acres: number | null;
  county: string;
  sub_county: string;
  ward: string | null;
  land_use: string;
  registration_section: string | null;
  map_sheet: string | null;
  payment_year: number;
  payment_status: RateStatus;
  bill: RateBill | null;
}

export interface RateParcelFeature {
  id: string;
  type: 'Feature';
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  properties: RateParcelProperties;
}

export interface RateParcelCollection {
  type: 'FeatureCollection';
  features: RateParcelFeature[];
  year: number;
}

export interface MpesaState {
  payment_id: string;
  status: RateBill['status'];
  amount: string;
  receipt: string | null;
  failure_reason: string | null;
  result_desc: string | null;
}

const NEUTRAL_BADGE = 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';

export const rateStatusMeta: Record<RateStatus, { label: string; color: string; badge: string }> = {
  paid: { label: 'Paid', color: '#16a34a', badge: NEUTRAL_BADGE },
  processing: { label: 'Confirming', color: '#2563eb', badge: NEUTRAL_BADGE },
  unpaid: { label: 'Unpaid', color: '#404040', badge: NEUTRAL_BADGE },
  overdue: { label: 'Overdue', color: '#dc2626', badge: NEUTRAL_BADGE },
  not_billed: { label: 'No bill', color: '#a3a3a3', badge: NEUTRAL_BADGE },
};

export const FIRST_RATING_YEAR = new Date().getFullYear() - 20;

export function ratingYears(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: current - FIRST_RATING_YEAR + 1 }, (_, i) => current - i);
}

export function formatKes(amount: string | number): string {
  return `KES ${Number(amount).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

export async function authedFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = await authService.getValidAccessToken();
  if (!token) throw new Error('Please log in again.');
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.detail || `Request failed (${response.status})`);
  return data as T;
}

const rateKeys = {
  parcels: (userId: string | null, year: number) => ['rate-parcels', userId, year] as const,
};

export function useMyRateParcels(year: number) {
  const userId = authService.getUserId()?.toString() ?? null;
  return useQuery({
    queryKey: rateKeys.parcels(userId, year),
    queryFn: () =>
      authedFetch<RateParcelCollection>(
        `/api/parcels/geojson?owner=${encodeURIComponent(userId as string)}&year=${year}`
      ),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export interface RatePayment {
  payment_id: string;
  parcel_ref: string | null;
  payment_year: number | null;
  amount: string;
  status: RateBill['status'];
  processor: string | null;
  processor_ref: string | null;
  deadline: string | null;
  updated_at: string;
}

export function useMyPayments() {
  const userId = authService.getUserId()?.toString() ?? null;
  return useQuery({
    queryKey: ['rate-payments', userId],
    queryFn: () =>
      authedFetch<{ results: RatePayment[] }>('/api/payments?ordering=-updated_at').then(
        (page) => page.results
      ),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export const landUseLabel: Record<string, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
  agricultural: 'Agricultural',
  institutional: 'Institutional',
  mixed: 'Mixed use',
};

export function formatArea(m2: number | null): string {
  if (!m2) return '—';
  const ha = m2 / 10000;
  return ha >= 0.1 ? `${ha.toFixed(2)} ha` : `${Math.round(m2).toLocaleString('en-KE')} m²`;
}

export function startMpesaPayment(paymentId: string, phone: string) {
  return authedFetch<MpesaState>(`/api/payments/${paymentId}/mpesa`, {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function getMpesaStatus(paymentId: string) {
  return authedFetch<MpesaState>(`/api/payments/${paymentId}/mpesa/status`);
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120000;

export function useMpesaPayment(onSettled?: (state: MpesaState) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, phone }: { paymentId: string; phone: string }) => {
      let state = await startMpesaPayment(paymentId, phone);
      const started = Date.now();
      while (state.status === 'processing' && Date.now() - started < POLL_TIMEOUT_MS) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        state = await getMpesaStatus(paymentId);
      }
      return state;
    },
    onSuccess: (state) => onSettled?.(state),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-parcels'] });
      queryClient.invalidateQueries({ queryKey: ['rate-payments'] });
    },
  });
}
