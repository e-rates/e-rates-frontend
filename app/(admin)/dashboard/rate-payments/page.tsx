'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function RatePaymentsPage() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BlurInLoader isLoading={isLoading}>
      <div className="w-full p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-text-primary mb-2 text-3xl font-bold">
                Rate Payments
              </h1>
              <p className="text-text-secondary text-sm">
                Manage and track all rate payment records
              </p>
            </div>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-card-bg border-border-default mb-6 flex gap-4 rounded-lg border p-4">
            <div className="relative flex-1">
              <Search className="text-text-tertiary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by parcel ID, owner name..."
                className="bg-main-bg border-border-default text-text-primary placeholder:text-text-tertiary focus:border-primary w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:outline-none"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Payments Table */}
          <div className="bg-card-bg border-border-default overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hover-surface border-border-default border-b">
                  <tr>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Parcel ID
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Owner
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Amount
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Status
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan={5}
                      className="text-text-secondary px-6 py-12 text-center text-sm"
                    >
                      No payment records found. Data integration coming soon...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
