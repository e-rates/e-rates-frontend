'use client';

import { useState } from 'react';
import { DuplicateCheckResult } from '@/lib/ml/duplicateDetection';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface Props {
  result: DuplicateCheckResult;
  onContinueWithDuplicates: () => void;
  onStripDuplicates: () => void;
  onCancel: () => void;
}

export function DuplicateWarningModal({
  result,
  onContinueWithDuplicates,
  onStripDuplicates,
  onCancel,
}: Props) {
  if (!result.hasDuplicates) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold">
              Duplicate Records Detected
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(80vh-200px)] overflow-y-auto p-6">
          <div className="mb-4">
            <p className="mb-2 text-gray-700 dark:text-gray-300">
              The shapefile you uploaded contains{' '}
              <span className="font-bold text-orange-600">
                {result.duplicateCount} duplicate record(s)
              </span>{' '}
              that match existing parcels in the database.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {result.uniqueCount} unique record(s) detected.
            </p>
          </div>

          <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Duplicate Matches:
            </h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {result.duplicates.slice(0, 10).map((dup, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded bg-white px-3 py-2 text-sm dark:bg-gray-800"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    Parcel #{dup.existingParcelNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        dup.matchType === 'exact'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : dup.matchType === 'high'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {dup.matchType} ({(dup.similarity * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
              {result.duplicates.length > 10 && (
                <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  ... and {result.duplicates.length - 10} more
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Uploading duplicates may cause data
              conflicts. We recommend removing them before proceeding.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
          <Button variant="outline" onClick={onCancel}>
            Cancel Upload
          </Button>
          <Button variant="outline" onClick={onContinueWithDuplicates}>
            Continue Anyway
          </Button>
          <Button
            onClick={onStripDuplicates}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Remove Duplicates & Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
