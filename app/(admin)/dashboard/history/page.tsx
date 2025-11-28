'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { Clock, Filter } from 'lucide-react';

const historyLogs = [
  { id: 1, log: 'User John Doe updated Parcel 1267', time: '2 minutes ago' },
  { id: 2, log: 'Payment received for Parcel 1214', time: '15 minutes ago' },
  { id: 3, log: 'New parcel allocation: Parcel 1298', time: '1 hour ago' },
  { id: 4, log: 'User Sarah Smith logged in', time: '2 hours ago' },
  { id: 5, log: 'System backup completed successfully', time: '3 hours ago' },
];

export default function HistoryPage() {
  return (
    <BlurInLoader isLoading={false}>
      <div className="h-full w-full overflow-y-auto bg-white dark:bg-neutral-800/30 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          
          {/* Header */}
          <div>
            <h2 className="text-xl text-text-primary font-medium">History Logs</h2>
            <p className="text-text-tertiary text-sm mt-1">Track system activities and changes</p>
          </div>

          {/* Filter Section (UI only) */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-elevated-surface hover:bg-hover-surface border-[0.5px] border-border-default px-4 py-2 text-sm text-text-secondary transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>

          {/* History Table */}
          <div className="squircle-2xl border-[0.5px] border-border-default bg-elevated-surface overflow-hidden">
            <div className="w-full text-left">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 border-b-[0.5px] border-dashed border-border-default bg-hover-surface px-6 py-4 text-sm font-medium text-text-tertiary">
                <div className="col-span-8">History Log</div>
                <div className="col-span-4 text-right">Time</div>
              </div>

              {/* Table Body */}
              <div className="divide-y-[0.5px] divide-dashed divide-border-default">
                {historyLogs.length > 0 ? (
                  historyLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="group grid cursor-pointer grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-hover-surface"
                    >
                      <div className="col-span-8 flex items-center text-sm text-text-secondary group-hover:text-text-primary">
                        {log.log}
                      </div>
                      <div className="col-span-4 flex items-center justify-end text-sm text-text-tertiary">
                        {log.time}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
                    <Clock className="mb-2 h-8 w-8 opacity-20" />
                    <p>No history logs found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
