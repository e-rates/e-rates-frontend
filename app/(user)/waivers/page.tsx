'use client';

import { CheckCircle2, Clock, Plus } from 'lucide-react';

export default function WaiversPage() {
  const activeWaivers = [
    {
      id: 1,
      title: 'Late Payment Waiver',
      plot: '#12345',
      validUntil: 'Dec 31, 2025',
      status: 'approved',
    },
  ];

  const pendingRequests = [
    {
      id: 1,
      title: 'Penalty Waiver Request',
      plot: '#67890',
      submitted: 'Nov 5, 2025',
      status: 'pending',
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-start p-4 md:p-6">
      <div className="w-full max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Waivers
        </h2>

        <div className="space-y-8">
          {/* Active Waivers */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-neutral-700 dark:text-neutral-300">
              Active Waivers
            </h3>
            <div className="space-y-3">
              {activeWaivers.map((waiver) => (
                <div
                  key={waiver.id}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-neutral-300 hover:shadow-lg dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:hover:border-neutral-600"
                >
                  <div className="flex items-center justify-between p-4">
                    {/* Left section */}
                    <div className="flex flex-col gap-2">
                      <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {waiver.title}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Plot {waiver.plot} • Valid until {waiver.validUntil}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950/30">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Approved
                      </span>
                    </div>
                  </div>

                  {/* Subtle gradient overlay on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-neutral-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-neutral-900/0" />
                </div>
              ))}
            </div>
          </div>

          {/* Pending Requests */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-neutral-700 dark:text-neutral-300">
              Pending Requests
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-neutral-300 hover:shadow-lg dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:hover:border-neutral-600"
                >
                  <div className="flex items-center justify-between p-4">
                    {/* Left section */}
                    <div className="flex flex-col gap-2">
                      <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {request.title}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Plot {request.plot} • Submitted {request.submitted}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 dark:bg-amber-950/30">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Pending
                      </span>
                    </div>
                  </div>

                  {/* Subtle gradient overlay on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-neutral-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-neutral-900/0" />
                </div>
              ))}
            </div>
          </div>

          {/* Request New Waiver Button */}
          <div className="flex justify-center md:justify-start">
            <button className="group flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-xl dark:bg-blue-500 dark:hover:bg-blue-600">
              <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              Request New Waiver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
