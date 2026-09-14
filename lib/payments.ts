export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface Payment {
  payment_id: string;
  user: string;
  user_username: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  deadline: string | null;
  days_overdue: number | null;
  is_defaulter: boolean;
  created_at: string;
  updated_at: string;
  parcel_refs?: string[];
  parcel?: string | null;
  parcel_ref?: string | null;
  payment_year?: number | null;
  processor_ref?: string | null;
}

export const parcelOf = (p: Pick<Payment, 'parcel_ref' | 'parcel_refs'>): string | null =>
  p.parcel_ref ?? p.parcel_refs?.[0] ?? null;

export const paidAt = (p: Pick<Payment, 'status' | 'updated_at' | 'created_at'>): string =>
  p.status === 'completed' ? p.updated_at : p.created_at;

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const paymentStatusStyles: Record<PaymentStatus, string> = {
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  processing: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  failed: 'bg-red-500/10 text-red-700 dark:text-red-400',
  refunded: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400',
};
