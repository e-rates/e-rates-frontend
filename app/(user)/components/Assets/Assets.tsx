import Link from 'next/link';
import React from 'react';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

const Assets = () => {
  const assets = [
    {
      plotNumber: '420',
      location: 'Kabiruini',
      status: 'unpaid',
      statusLabel: 'Unpaid',
    },
    {
      plotNumber: '679',
      location: 'Mugunda',
      status: 'paid',
      statusLabel: 'No Arrears',
    },
  ];

  return (
    <div className="w-full space-y-4 px-2">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Assets
        </h2>
      </div>

      {/* Grid layout - responsive */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {assets.map((asset) => (
          <Link
            key={asset.plotNumber}
            href={'/'}
            className="squircle-2xl group relative overflow-hidden border border-neutral-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-neutral-300 hover:shadow-lg dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:hover:border-neutral-600"
          >
            {/* Card content */}
            <div className="flex items-center justify-between p-4">
              {/* Left section - Plot info */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Plot Number
                  </span>
                  <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {asset.plotNumber}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    {asset.location}
                  </span>
                </div>
              </div>

              {/* Right section - Status badge */}
              <div className="flex flex-col items-end gap-2">
                {asset.status === 'unpaid' ? (
                  <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 dark:bg-red-950/30">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">
                      {asset.statusLabel}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {asset.statusLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle gradient overlay on hover */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-neutral-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-neutral-900/0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Assets;
