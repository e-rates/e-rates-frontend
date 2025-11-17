'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { UserX, Download } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function DefaultersPage() {
  return (
    <BlurInLoader isLoading={false}>
      <div className="w-full p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="squircle-lg bg-error/10 text-error p-3">
                <UserX className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-text-primary text-3xl font-bold">
                  Defaulters
                </h1>
                <p className="text-text-secondary text-sm">
                  Manage overdue payments and follow-ups
                </p>
              </div>
            </div>
            <Button className="gap-2 bg-teal-500 hover:bg-teal-600">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Empty State */}
          <div className="squircle-lg bg-card-bg border-border-default flex min-h-[400px] flex-col items-center justify-center border p-12">
            <div className="text-center">
              <div className="bg-error/10 text-error mx-auto mb-4 w-fit rounded-full p-4">
                <UserX className="h-8 w-8" />
              </div>
              <h3 className="text-text-primary mb-2 text-lg font-semibold">
                No Defaulter Records
              </h3>
              <p className="text-text-secondary text-sm">
                Connect to the API to view defaulter records and overdue
                payments
              </p>
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
