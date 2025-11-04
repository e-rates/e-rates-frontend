'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BlurInLoader isLoading={isLoading}>
      <div className="h-full w-full px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-text-primary mb-2 text-3xl font-bold">
            Dashboard Overview
          </h1>
          <p className="text-text-secondary text-sm">
            Welcome back! Here's what's happening with your e-rates system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <div className="bg-card-bg border-border-default rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="bg-primary/10 text-primary rounded-lg p-3">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-text-secondary mb-1 text-sm font-medium">
              Total Revenue
            </h3>
            <p className="text-text-primary text-2xl font-bold">$45,231</p>
            <p className="text-success mt-2 text-xs">
              <TrendingUp className="mr-1 inline h-3 w-3" />
              +12.5% from last month
            </p>
          </div>

          {/* Active Parcels */}
          <div className="bg-card-bg border-border-default rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="bg-success/10 text-success rounded-lg p-3">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-text-secondary mb-1 text-sm font-medium">
              Active Parcels
            </h3>
            <p className="text-text-primary text-2xl font-bold">2,845</p>
            <p className="text-text-secondary mt-2 text-xs">Across all zones</p>
          </div>

          {/* Total Payers */}
          <div className="bg-card-bg border-border-default rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="bg-info/10 text-info rounded-lg p-3">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-text-secondary mb-1 text-sm font-medium">
              Total Payers
            </h3>
            <p className="text-text-primary text-2xl font-bold">1,923</p>
            <p className="text-text-secondary mt-2 text-xs">Registered users</p>
          </div>

          {/* Defaulters */}
          <div className="bg-card-bg border-border-default rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="bg-error/10 text-error rounded-lg p-3">
                <TrendingUp className="h-6 w-6 rotate-180" />
              </div>
            </div>
            <h3 className="text-text-secondary mb-1 text-sm font-medium">
              Defaulters
            </h3>
            <p className="text-text-primary text-2xl font-bold">156</p>
            <p className="text-error mt-2 text-xs">Requires attention</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card-bg border-border-default rounded-lg border">
          <div className="border-border-default border-b p-6">
            <h2 className="text-text-primary text-xl font-semibold">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="text-text-secondary flex h-48 items-center justify-center">
              <p className="text-sm">Activity feed coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
