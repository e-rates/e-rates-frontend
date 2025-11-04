'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { UserX, AlertCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function DefaultersPage() {
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
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-error/10 text-error rounded-lg p-3">
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
          </div>

          {/* Alert Banner */}
          <div className="bg-error/10 border-error/20 mb-6 flex items-start gap-3 rounded-lg border p-4">
            <AlertCircle className="text-error h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-error mb-1 text-sm font-semibold">
                156 Accounts Overdue
              </h3>
              <p className="text-text-secondary text-xs">
                Total outstanding amount: $23,450. Last updated 2 hours ago.
              </p>
            </div>
            <Button size="sm" variant="outline">
              Send Reminders
            </Button>
          </div>

          {/* Defaulters List */}
          <div className="bg-card-bg border-border-default overflow-hidden rounded-lg border">
            <div className="border-border-default border-b p-6">
              <h2 className="text-text-primary text-xl font-semibold">
                Overdue Accounts
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hover-surface border-border-default border-b">
                  <tr>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Owner
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Parcel ID
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Amount Due
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Days Overdue
                    </th>
                    <th className="text-text-secondary px-6 py-3 text-left text-xs font-medium uppercase">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan={5}
                      className="text-text-secondary px-6 py-12 text-center text-sm"
                    >
                      No defaulter records found. Data integration coming
                      soon...
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
