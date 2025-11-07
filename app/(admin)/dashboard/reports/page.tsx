'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function ReportsPage() {
  return (
    <BlurInLoader isLoading={false}>
      <div className="box-border h-full w-full max-w-full overflow-x-hidden p-6">
        <div className="box-border w-full max-w-full">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-text-primary mb-2 text-3xl font-bold">
                Reports & Analytics
              </h1>
              <p className="text-text-secondary text-sm">
                Generate insights and export data
              </p>
            </div>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>

          {/* Report Categories Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Financial Reports */}
            <div className="bg-card-bg border-border-default hover:border-primary group cursor-pointer rounded-lg border p-6 transition-all">
              <div className="bg-primary/10 text-primary mb-4 inline-flex rounded-lg p-3">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-text-primary mb-2 text-lg font-semibold">
                Financial Reports
              </h3>
              <p className="text-text-secondary mb-4 text-sm">
                Revenue, collections, and payment trends
              </p>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </div>

            {/* Parcel Reports */}
            <div className="bg-card-bg border-border-default hover:border-primary group cursor-pointer rounded-lg border p-6 transition-all">
              <div className="bg-success/10 text-success mb-4 inline-flex rounded-lg p-3">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-text-primary mb-2 text-lg font-semibold">
                Parcel Reports
              </h3>
              <p className="text-text-secondary mb-4 text-sm">
                Property distribution and zone analysis
              </p>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </div>

            {/* Compliance Reports */}
            <div className="bg-card-bg border-border-default hover:border-primary group cursor-pointer rounded-lg border p-6 transition-all">
              <div className="bg-info/10 text-info mb-4 inline-flex rounded-lg p-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-text-primary mb-2 text-lg font-semibold">
                Compliance Reports
              </h3>
              <p className="text-text-secondary mb-4 text-sm">
                Audit trails and regulatory compliance
              </p>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-card-bg border-border-default rounded-lg border">
            <div className="border-border-default border-b p-6">
              <h2 className="text-text-primary text-xl font-semibold">
                Recent Reports
              </h2>
            </div>
            <div className="p-6">
              <div className="text-text-secondary flex h-48 items-center justify-center">
                <p className="text-sm">
                  No recent reports. Generate your first report above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
