'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { UserX } from 'lucide-react';

export default function DefaultersPage() {
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
          </div>

          {/* Content Placeholder */}
          <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-neutral-500">Agent Search Interface Coming Soon...</p>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
