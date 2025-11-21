'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { UserX, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DefaultersFiltersComponent } from './components/DefaultersFilters';
import { DefaultersTable } from './components/DefaultersTable';
import { TablePagination } from './components/TablePagination';
import { DefaultersFilters, DefaultersResponse } from './types';
import { fetchDefaulters, exportDefaulters, downloadBlob } from './service';
import toast from 'react-hot-toast';

export default function DefaultersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<DefaultersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Parse filters from URL
  const getFiltersFromURL = useCallback((): DefaultersFilters => {
    const filters: DefaultersFilters = {};

    const search = searchParams.get('search');
    const minDays = searchParams.get('min_days_overdue');
    const maxDays = searchParams.get('max_days_overdue');
    const currency = searchParams.get('currency');
    const minAmount = searchParams.get('min_amount');
    const ward = searchParams.get('ward');
    const subCounty = searchParams.get('sub_county');
    const county = searchParams.get('county');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('page_size');

    if (search) filters.search = search;
    if (minDays) filters.min_days_overdue = Number(minDays);
    if (maxDays) filters.max_days_overdue = Number(maxDays);
    if (currency) filters.currency = currency;
    if (minAmount) filters.min_amount = Number(minAmount);
    if (ward) filters.ward = ward;
    if (subCounty) filters.sub_county = subCounty;
    if (county) filters.county = county;
    if (page) filters.page = Number(page);
    if (pageSize) filters.page_size = Number(pageSize);

    // Set defaults
    if (!filters.page) filters.page = 1;
    if (!filters.page_size) filters.page_size = 25;

    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<DefaultersFilters>(getFiltersFromURL());

  // Update URL when filters change
  const updateURL = useCallback((newFilters: DefaultersFilters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  // Fetch data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchDefaulters(filters);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load defaulters';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update filters from URL on mount and when URL changes
  useEffect(() => {
    setFilters(getFiltersFromURL());
  }, [getFiltersFromURL]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: DefaultersFilters) => {
    const updatedFilters = { ...newFilters, page: 1 }; // Reset to page 1 on filter change
    setFilters(updatedFilters);
    updateURL(updatedFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: DefaultersFilters = {
      page: 1,
      page_size: filters.page_size || 25,
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
  };

  // Handle page size change
  const handlePageSizeChange = (pageSize: number) => {
    const updatedFilters = { ...filters, page_size: pageSize, page: 1 };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportDefaulters(filters);
      const filename = `defaulters_${new Date().toISOString().split('T')[0]}.csv`;
      downloadBlob(blob, filename);
      toast.success('Defaulters exported successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export defaulters';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate pagination values
  const totalPages = data ? Math.ceil((data.count || 0) / (filters.page_size || 25)) : 1;
  const currentPage = filters.page || 1;

  return (
    <BlurInLoader isLoading={false}>
      <div className="w-full p-6 min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  Defaulters
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Manage overdue payments and follow-ups
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={loadData}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || !data || !data.results || data.results.length === 0}
                className="gap-2 bg-[#007AFF] text-white hover:bg-[#0051D5]"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>

          {/* Stats */}
          {data && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Total Defaulters
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {(data.count || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Showing
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {data.results?.length || 0}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Current Page
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {currentPage} / {totalPages}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <DefaultersFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <DefaultersTable
            data={data?.results || []}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {data && data.results?.length > 0 && (
            <div className="mt-4 rounded-lg">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={filters.page_size || 25}
                totalCount={data.count || 0}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </div>
    </BlurInLoader>
  );
}
