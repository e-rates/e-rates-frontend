'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Loader2, MapPin, Search, UserPlus, ArrowRight, X, Check, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { backendJson } from '@/lib/backend';
import { authService } from '@/lib/auth';
import { invalidateParcelCache } from '@/lib/parcelCache';
import { refreshPaymentStatuses } from '@/lib/paymentStatuses';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '@/app/components/ui/button';

interface ParcelOption {
  parcel_id: string;
  parcel_ref: string;
  ward?: string | null;
  sub_county?: string | null;
  area_m2?: number | null;
  owner_user?: string | null;
  owner_username?: string | null;
}

interface UserOption {
  user_id: string;
  username: string;
  phone?: string | null;
  email?: string;
  national_id?: string | null;
}

const CELL = 'px-4 py-2.5 whitespace-nowrap text-xs';
const HEAD = 'bg-main-bg sticky top-0 z-10 text-left text-[11px] font-semibold tracking-wide text-text-tertiary uppercase';
const control = 'border-border-default bg-main-bg w-full border-[0.5px] py-2 pl-9 pr-3 text-xs text-text-primary rounded-none focus:outline-none focus:border-neutral-700 dark:focus:border-neutral-300';

const area = (m2?: number | null) => (!m2 ? '—' : m2 >= 10000 ? `${(m2 / 10000).toFixed(2)} ha` : `${Math.round(m2)} m²`);

function useSearch<T>(endpoint: string, key: 'parcels' | 'users') {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [searching, setSearching] = useState(false);

  const run = useCallback(
    async (value: string) => {
      setSearching(true);
      try {
        const data = await backendJson<Record<string, T[]>>(`${endpoint}?search=${encodeURIComponent(value)}`);
        setResults(data[key] ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [endpoint, key]
  );

  useEffect(() => {
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => run(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term, run]);

  return { term, setTerm, results, searching };
}

export default function AllocationsPage() {
  const router = useRouter();
  const parcelSearch = useSearch<ParcelOption>('/api/admin/parcels/available_for_allocation/', 'parcels');
  const userSearch = useSearch<UserOption>('/api/admin/parcels/available_users/', 'users');
  const [parcel, setParcel] = useState<ParcelOption | null>(null);
  const [owner, setOwner] = useState<UserOption | null>(null);
  const [unassigned, setUnassigned] = useState<ParcelOption[] | null>(null);
  const [allocatedList, setAllocatedList] = useState<ParcelOption[] | null>(null);
  const [activeTab, setActiveTab] = useState<'unallocated' | 'allocated'>('unallocated');
  const [allocating, setAllocating] = useState(false);
  const [tableFilter, setTableFilter] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [unData, alData] = await Promise.all([
        backendJson<{ results?: ParcelOption[]; parcels?: ParcelOption[] }>('/api/admin/parcels/unassigned/').catch(() => ({})),
        backendJson<{ results?: ParcelOption[]; parcels?: ParcelOption[] }>('/api/admin/parcels/allocated/').catch(() => ({})),
      ]);
      setUnassigned(unData.results ?? unData.parcels ?? []);
      setAllocatedList(alData.results ?? alData.parcels ?? []);
    } catch {
      setUnassigned([]);
      setAllocatedList([]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentList = activeTab === 'unallocated' ? unassigned : allocatedList;

  const filteredList = useMemo(() => {
    if (!currentList) return [];
    if (!tableFilter.trim()) return currentList;
    const q = tableFilter.toLowerCase().trim();
    return currentList.filter(
      (p) =>
        p.parcel_ref.toLowerCase().includes(q) ||
        (p.ward && p.ward.toLowerCase().includes(q)) ||
        (p.sub_county && p.sub_county.toLowerCase().includes(q)) ||
        (p.owner_username && p.owner_username.toLowerCase().includes(q)) ||
        (p.owner_user && p.owner_user.toLowerCase().includes(q))
    );
  }, [currentList, tableFilter]);

  const allocate = async () => {
    if (!parcel || !owner) return;
    setAllocating(true);
    try {
      const token = await authService.getValidAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}/api/admin/parcels/allocate_parcel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ parcel_id: parcel.parcel_id, user_id: owner.user_id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || body.message || `Allocation failed (${response.status})`);
      toast.success(`Plot ${parcel.parcel_ref} allocated to ${owner.username}`);
      setParcel(null);
      setOwner(null);
      parcelSearch.setTerm('');
      userSearch.setTerm('');
      invalidateParcelCache();
      refreshPaymentStatuses();
      loadData();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setAllocating(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard/home');
  };

  return (
    <div className="bg-main-bg flex h-full w-full flex-col overflow-y-auto">
      {/* Top Header */}
      <div className="border-border-default flex items-center justify-between border-b-[0.5px] px-6 py-3.5">
        <div>
          <h1 className="text-base font-bold text-text-primary tracking-tight">Plot Allocation</h1>
          <p className="text-xs text-text-tertiary">Assign registered parcels to verified land owners</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="rounded-none text-xs font-medium h-8 text-text-secondary hover:text-text-primary"
          >
            <span>Skip / Assign Later</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 items-start flex-1">
        
        {/* Left Column (4 cols): Allocation Form & Controls */}
        <div className="xl:col-span-4 bg-card-bg border-r border-border-default p-5 flex flex-col gap-5 border-b xl:border-b-0">
          
          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 gap-2 border-b border-border-default pb-3 text-xs">
            <div className="flex flex-col">
              <span className="text-text-tertiary">Unallocated</span>
              <span className="text-sm font-bold text-text-primary">
                {unassigned === null ? '…' : unassigned.length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-tertiary">Allocated</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {allocatedList === null ? '…' : allocatedList.length}
              </span>
            </div>
          </div>

          {/* Step 1: Select Plot */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary" htmlFor="plot-search">
                1. Select Plot
              </label>
              {parcel && (
                <button
                  onClick={() => {
                    setParcel(null);
                    parcelSearch.setTerm('');
                  }}
                  className="text-[11px] text-text-tertiary hover:text-text-primary flex items-center gap-0.5"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {parcel ? (
              <div className="border border-neutral-200 bg-neutral-50/70 dark:border-neutral-700 dark:bg-neutral-800/40 p-3 rounded-none">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">{parcel.parcel_ref}</span>
                  <span className="text-[11px] text-text-tertiary">{area(parcel.area_m2)}</span>
                </div>
                <p className="mt-1 text-[11px] text-text-secondary capitalize">
                  {parcel.ward || 'No ward'} · {parcel.sub_county || 'No sub-county'}
                </p>
              </div>
            ) : (
              <div className="relative">
                <MapPin className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="plot-search"
                  value={parcelSearch.term}
                  onChange={(e) => parcelSearch.setTerm(e.target.value)}
                  placeholder="Type plot number (or pick from table)"
                  className={control}
                />
                {parcelSearch.searching && (
                  <Loader2 className="absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-text-tertiary" />
                )}

                {/* Autocomplete dropdown */}
                {parcelSearch.results.length > 0 && (
                  <ul className="border-border-default divide-border-default absolute left-0 top-full z-20 mt-1 max-h-52 w-full divide-y-[0.5px] overflow-y-auto border bg-main-bg shadow-md rounded-none">
                    {parcelSearch.results.map((p) => (
                      <li key={p.parcel_id}>
                        <button
                          onClick={() => {
                            setParcel(p);
                            parcelSearch.setTerm(p.parcel_ref);
                          }}
                          className="hover:bg-hover-surface w-full px-3 py-2 text-left text-xs"
                        >
                          <span className="font-semibold text-text-primary">{p.parcel_ref}</span>
                          <span className="text-text-tertiary ml-2">
                            {p.ward || p.sub_county || '—'} · {area(p.area_m2)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Select Land Owner */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary" htmlFor="owner-search">
                2. Select Land Owner
              </label>
              {owner && (
                <button
                  onClick={() => {
                    setOwner(null);
                    userSearch.setTerm('');
                  }}
                  className="text-[11px] text-text-tertiary hover:text-text-primary flex items-center gap-0.5"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {owner ? (
              <div className="border border-neutral-200 bg-neutral-50/70 dark:border-neutral-700 dark:bg-neutral-800/40 p-3 rounded-none">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">{owner.username}</span>
                  {owner.national_id && (
                    <span className="text-[11px] text-text-tertiary">ID: {owner.national_id}</span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-text-secondary">
                  {owner.phone || owner.email || 'No contact details'}
                </p>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="owner-search"
                  value={userSearch.term}
                  onChange={(e) => userSearch.setTerm(e.target.value)}
                  placeholder="Search owner by name, phone, or email"
                  className={control}
                />
                {userSearch.searching && (
                  <Loader2 className="absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-text-tertiary" />
                )}

                {/* Autocomplete dropdown */}
                {userSearch.results.length > 0 && (
                  <ul className="border-border-default divide-border-default absolute left-0 top-full z-20 mt-1 max-h-52 w-full divide-y-[0.5px] overflow-y-auto border bg-main-bg shadow-md rounded-none">
                    {userSearch.results.map((u) => (
                      <li key={u.user_id}>
                        <button
                          onClick={() => {
                            setOwner(u);
                            userSearch.setTerm(u.username);
                          }}
                          className="hover:bg-hover-surface w-full px-3 py-2 text-left text-xs"
                        >
                          <span className="font-semibold text-text-primary">{u.username}</span>
                          <span className="text-text-tertiary ml-2">{u.phone || u.email || ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Allocation Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border-default">
            <button
              onClick={allocate}
              disabled={!parcel || !owner || allocating}
              className="w-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-none transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {allocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              <span>{allocating ? 'Allocating…' : 'Allocate Plot'}</span>
            </button>

            <Button
              onClick={handleSkip}
              variant="outline"
              className="w-full rounded-none text-xs font-medium h-9 text-text-secondary hover:text-text-primary"
            >
              <span>Skip / Assign Later</span>
            </Button>
          </div>
        </div>

        {/* Right Column (8 cols): Plots Table with Unallocated & Allocated Tabs */}
        <div className="xl:col-span-8 p-5 flex flex-col gap-3">
          
          {/* Tabs + Search Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-default">
            <div className="flex items-center gap-1 border-b sm:border-b-0 border-border-default pb-1 sm:pb-0">
              <button
                onClick={() => { setActiveTab('unallocated'); setTableFilter(''); }}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'unallocated'
                    ? 'border-b-2 border-text-primary font-semibold text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                Unallocated ({unassigned?.length ?? 0})
              </button>
              <button
                onClick={() => { setActiveTab('allocated'); setTableFilter(''); }}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'allocated'
                    ? 'border-b-2 border-text-primary font-semibold text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                Allocated ({allocatedList?.length ?? 0})
              </button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <input
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                placeholder="Filter by plot, ward, owner…"
                className="border-border-default bg-main-bg w-full border-[0.5px] py-1.5 pl-8 pr-3 text-xs text-text-primary rounded-none focus:outline-none"
              />
              {tableFilter && (
                <button
                  onClick={() => setTableFilter('')}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Table Body */}
          {currentList === null ? (
            <div className="flex items-center justify-center py-16 text-text-tertiary text-xs">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading plots…
            </div>
          ) : filteredList.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title={tableFilter ? 'No matching plots' : activeTab === 'unallocated' ? 'Every plot is allocated' : 'No plots allocated yet'}
              message={tableFilter ? 'Try searching for a different plot or ward.' : activeTab === 'unallocated' ? 'All plots have been assigned to owners.' : 'Assigned plots will appear here.'}
            />
          ) : (
            <div className="border border-border-default rounded-none overflow-hidden max-h-[calc(100vh-230px)] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className={HEAD}>
                  <tr className="border-border-default border-b-[0.5px]">
                    <th className={CELL}>Plot Reference</th>
                    <th className={CELL}>Sub-County</th>
                    <th className={CELL}>Ward</th>
                    {activeTab === 'allocated' && <th className={CELL}>Owner</th>}
                    <th className={`${CELL} text-right`}>Area</th>
                    <th className={`${CELL} text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-border-default divide-y-[0.5px]">
                  {filteredList.slice(0, 200).map((p) => {
                    const isSelected = parcel?.parcel_id === p.parcel_id;
                    const ownerName = p.owner_username || p.owner_user || '';
                    return (
                      <tr
                        key={p.parcel_id}
                        className={`hover:bg-hover-surface transition-colors ${
                          isSelected ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                        }`}
                      >
                        <td className={`${CELL} font-semibold text-text-primary`}>
                          {p.parcel_ref}
                        </td>
                        <td className={`${CELL} text-text-secondary capitalize`}>
                          {p.sub_county || '—'}
                        </td>
                        <td className={`${CELL} text-text-secondary capitalize`}>
                          {p.ward || '—'}
                        </td>
                        {activeTab === 'allocated' && (
                          <td className={`${CELL} font-medium text-emerald-700 dark:text-emerald-400`}>
                            {ownerName || 'Assigned'}
                          </td>
                        )}
                        <td className={`${CELL} text-right text-text-secondary tabular-nums`}>
                          {area(p.area_m2)}
                        </td>
                        <td className={`${CELL} text-right`}>
                          <button
                            onClick={() => {
                              setParcel(p);
                              parcelSearch.setTerm(p.parcel_ref);
                            }}
                            className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'border border-border-default text-text-primary hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                          >
                            {isSelected ? 'Selected' : activeTab === 'allocated' ? 'Reassign' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
