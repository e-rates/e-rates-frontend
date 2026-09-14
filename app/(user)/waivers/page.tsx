'use client';

import { FileText, Plus } from 'lucide-react';

export default function WaiversPage() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-start p-4 md:p-6">
      <div className="w-full max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Waivers
        </h2>

        <div className="squircle-2xl flex flex-col items-center gap-2 border border-dashed border-neutral-200 px-6 py-14 text-center dark:border-neutral-700">
          <FileText className="h-6 w-6 text-neutral-400" />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            No waivers
          </p>
          <p className="max-w-[24rem] text-xs text-neutral-500">
            Waiver requests aren’t available online yet. Contact the county rates office to apply for a waiver.
          </p>
          <button
            disabled
            className="mt-4 flex cursor-not-allowed items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white opacity-40"
          >
            <Plus className="h-4 w-4" />
            Request New Waiver
          </button>
        </div>
      </div>
    </div>
  );
}
