'use client';

import { Button } from '@/app/components/ui/button';
import { CheckCircle2, Upload, Users, ArrowRight } from 'lucide-react';
import React from 'react';
import { UploadResult } from './UploadResultModal';

interface UploadSuccessViewProps {
  result: UploadResult;
  onUploadAnother: () => void;
  onAssignOwners: () => void;
  onSkip?: () => void;
}

export const UploadSuccessView: React.FC<UploadSuccessViewProps> = ({
  result,
  onUploadAnother,
  onAssignOwners,
  onSkip,
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-6 px-4 py-8">
      <div className="flex flex-col items-center space-y-3">
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        <h1 className="text-xl font-bold text-text-primary">
          Upload Successful
        </h1>
        <p className="text-sm text-text-secondary text-center max-w-md">
          {result.message}
        </p>
      </div>

      <div className="bg-card-bg border-border-default w-full max-w-2xl border p-6 rounded-none">
        <h2 className="text-sm font-semibold text-text-primary mb-4">
          Upload Summary
        </h2>

        <div className="mb-6 grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-xs text-text-tertiary mb-1">
              Parcels Imported
            </p>
            <p className="text-2xl font-bold text-text-primary">
              {result.imported_count}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-tertiary mb-1">
              Parcels Skipped
            </p>
            <p className="text-2xl font-bold text-text-primary">
              {result.skipped_count}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-tertiary mb-1">Errors</p>
            <p className="text-2xl font-bold text-text-primary">
              {result.error_count}
            </p>
          </div>
        </div>

        {result.shapefile_info && (
          <div className="border-border-default border-t pt-4">
            <h3 className="text-xs font-semibold text-text-primary mb-3">
              Shapefile Details
            </h3>
            <div className="text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-text-tertiary">Layer Name: </span>
                <span className="text-text-primary font-medium">
                  {result.shapefile_info.layer_name}
                </span>
              </div>
              <div>
                <span className="text-text-tertiary">Feature Count: </span>
                <span className="text-text-primary font-medium">
                  {result.shapefile_info.feature_count}
                </span>
              </div>
              <div>
                <span className="text-text-tertiary">Geometry Type: </span>
                <span className="text-text-primary font-medium">
                  {result.shapefile_info.geometry_type}
                </span>
              </div>
              <div>
                <span className="text-text-tertiary">SRID: </span>
                <span className="text-text-primary font-medium">
                  {result.shapefile_info.srid}
                </span>
              </div>
            </div>
          </div>
        )}

        {result.errors && result.errors.length > 0 && (
          <div className="border-border-default mt-4 border-t pt-4">
            <h3 className="text-xs font-semibold text-text-primary mb-2">
              Issues Encountered
            </h3>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {result.errors.map((error, idx) => (
                <p key={idx} className="text-xs text-rose-500">
                  • {error}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full max-w-2xl gap-3">
        <Button onClick={onUploadAnother} variant="outline" className="flex-1 rounded-none text-xs font-medium">
          <Upload className="mr-1.5 h-4 w-4" />
          Upload Another
        </Button>
        <Button onClick={onSkip} variant="outline" className="flex-1 rounded-none text-xs font-medium text-text-secondary hover:text-text-primary">
          <ArrowRight className="mr-1.5 h-4 w-4" />
          Skip / Assign Later
        </Button>
        <Button onClick={onAssignOwners} className="flex-1 rounded-none bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 text-xs font-semibold">
          <Users className="mr-1.5 h-4 w-4" />
          Assign to Owners
        </Button>
      </div>
    </div>
  );
};
