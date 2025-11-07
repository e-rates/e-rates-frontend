/**
 * API service functions for fetching data
 * Use these functions in your components to replace mock data
 */

import { getAuthToken } from './api';

// User Services

export interface HistoryRecord {
  year: number;
  amount: number;
  date: string;
  status: string;
}

export async function fetchUserHistory(): Promise<HistoryRecord[]> {
  const token = getAuthToken();
  const response = await fetch('/api/user/history', {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch history');
  }

  return result.data || [];
}

// Admin Services

export interface RatePayment {
  id: number;
  parcelId: string;
  owner: string;
  location: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'partial';
  date: string;
  dueDate: string;
  outstandingAmount?: number;
}

export interface PaymentsParams {
  page?: number;
  pageSize?: number;
  status?: 'paid' | 'unpaid' | 'partial';
}

export async function fetchRatePayments(params: PaymentsParams = {}): Promise<{
  data: RatePayment[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const token = getAuthToken();
  const queryParams = new URLSearchParams({
    ...(params.page && { page: params.page.toString() }),
    ...(params.pageSize && { pageSize: params.pageSize.toString() }),
    ...(params.status && { status: params.status }),
  });

  const response = await fetch(`/api/admin/payments?${queryParams}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch payments');
  }

  return {
    data: result.data || [],
    total: result.total || 0,
    page: result.page || 1,
    pageSize: result.pageSize || 10,
  };
}

export interface Defaulter {
  id: number;
  parcelId: string;
  owner: string;
  location: string;
  coordinates: [number, number];
  totalOwed: number;
  monthsOverdue: number;
  lastPaymentDate: string;
  dueDate: string;
  contactPhone?: string;
}

export interface DefaultersParams {
  minMonthsOverdue?: number;
  location?: string;
}

export async function fetchDefaulters(
  params: DefaultersParams = {}
): Promise<Defaulter[]> {
  const token = getAuthToken();
  const queryParams = new URLSearchParams({
    ...(params.minMonthsOverdue && {
      minMonthsOverdue: params.minMonthsOverdue.toString(),
    }),
    ...(params.location && { location: params.location }),
  });

  const response = await fetch(`/api/admin/defaulters?${queryParams}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch defaulters');
  }

  return result.data || [];
}

export interface RecentPayment {
  id: number;
  landOwner: string;
  plotNumber: string;
  location: string;
  amount: number;
  date: string;
}

export async function fetchRecentPayments(
  limit: number = 10
): Promise<RecentPayment[]> {
  const token = getAuthToken();
  const response = await fetch(`/api/admin/recent-payments?limit=${limit}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch recent payments');
  }

  return result.data || [];
}

export interface Parcel {
  id: string;
  plotNumber: string;
  owner: string;
  location: string;
  coordinates: [number, number];
  area: number;
  landUse?: string;
  rateAmount: number;
  lastPaymentDate?: string;
  status: 'active' | 'inactive';
}

export interface ParcelsParams {
  page?: number;
  pageSize?: number;
  location?: string;
  owner?: string;
}

export async function fetchParcels(
  params: ParcelsParams = {}
): Promise<{ data: Parcel[]; total: number; page: number; pageSize: number }> {
  const token = getAuthToken();
  const queryParams = new URLSearchParams({
    ...(params.page && { page: params.page.toString() }),
    ...(params.pageSize && { pageSize: params.pageSize.toString() }),
    ...(params.location && { location: params.location }),
    ...(params.owner && { owner: params.owner }),
  });

  const response = await fetch(`/api/admin/parcels?${queryParams}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch parcels');
  }

  return {
    data: result.data || [],
    total: result.total || 0,
    page: result.page || 1,
    pageSize: result.pageSize || 50,
  };
}

export async function fetchParcelDetails(plotNumber: string): Promise<any> {
  const token = getAuthToken();
  const response = await fetch(`/api/admin/parcels/${plotNumber}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch parcel details');
  }

  return result.data;
}
