'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { Clock, Filter } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function HistoryPage() {
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
          <div className="mb-8">
            <h1 className="text-text-primary mb-2 text-3xl font-bold">
              Activity History
            </h1>
            <p className="text-text-secondary text-sm">
              Audit log of all system activities and changes
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-card-bg border-border-default mb-6 flex items-center gap-4 rounded-lg border p-4">
            <div className="flex flex-1 gap-4">
              <select className="bg-main-bg border-border-default text-text-primary focus:border-primary rounded-lg border px-4 py-2 text-sm focus:outline-none">
                <option>All Activities</option>
                <option>Payments</option>
                <option>User Actions</option>
                <option>System Events</option>
              </select>
              <input
                type="date"
                className="bg-main-bg border-border-default text-text-primary focus:border-primary rounded-lg border px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Timeline */}
          <div className="bg-card-bg border-border-default rounded-lg border p-6">
            <div className="space-y-6">
              {/* Timeline Item Example */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-primary/20 text-primary rounded-full p-2">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="bg-border-default h-full w-px"></div>
                </div>
                <div className="text-text-secondary flex-1 pb-6 text-sm">
                  No activity history available yet. Actions will appear here as
                  they occur.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
