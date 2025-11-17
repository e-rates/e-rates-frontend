'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { Download } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function RatePaymentsPage() {
  return (
    <BlurInLoader isLoading={false}>
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
            <Button className="gap-2 bg-teal-500 hover:bg-teal-600">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Empty State */}
          <div className="squircle-lg bg-card-bg border-border-default flex min-h-[400px] flex-col items-center justify-center border p-12">
            <div className="text-center">
              <h3 className="text-text-primary mb-2 text-lg font-semibold">
                No Payment Records
              </h3>
              <p className="text-text-secondary text-sm">
                Connect to the API to view rate payment records
              </p>
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
