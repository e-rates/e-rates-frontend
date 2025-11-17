'use client';

import { Button } from '@/app/components/ui/button';
import { CheckCircle2, Upload, Users } from 'lucide-react';
import React from 'react';
import { UploadResult } from './UploadResultModal';

interface UploadSuccessViewProps {
  result: UploadResult;
  onUploadAnother: () => void;
  onAssignOwners: () => void;
}

export const UploadSuccessView: React.FC<UploadSuccessViewProps> = ({
  result,
  onUploadAnother,
  onAssignOwners,
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-6 px-4 py-8">
      <div className="flex flex-col items-center space-y-4">
        <CheckCircle2 className="h-20 w-20 text-green-500" />
        <h1 className="text-regular-2xl text-text-primary font-bold">
          Upload Successful!
        </h1>
        <p className="text-regular-lg text-text-secondary text-center">
          {result.message}
        </p>
      </div>

      <div className="squircle-xl bg-elevated-surface border-border-default w-full max-w-2xl border p-6">
        <h2 className="text-regular-lg text-text-primary mb-4 font-semibold">
          Upload Summary
        </h2>

        <div className="mb-6 grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-regular-sm text-text-tertiary mb-1">
              Parcels Imported
            </p>
            <p className="text-regular-2xl text-text-primary font-bold">
              {result.imported_count}
            </p>
          </div>
          <div className="text-center">
            <p className="text-regular-sm text-text-tertiary mb-1">
              Parcels Skipped
            </p>
            <p className="text-regular-2xl text-text-primary font-bold">
              {result.skipped_count}
            </p>
          </div>
          <div className="text-center">
            <p className="text-regular-sm text-text-tertiary mb-1">Errors</p>
            <p className="text-regular-2xl text-text-primary font-bold">
              {result.error_count}
            </p>
          </div>
        </div>

        {result.shapefile_info && (
          <div className="border-border-default border-t pt-4">
            <h3 className="text-regular-md text-text-primary mb-3 font-medium">
              Shapefile Details
            </h3>
            <div className="text-regular-sm grid grid-cols-2 gap-4">
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
            <h3 className="text-regular-md text-text-primary mb-2 font-medium">
              Issues Encountered
            </h3>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {result.errors.map((error, idx) => (
                <p key={idx} className="text-regular-sm text-rose-500">
                  • {error}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full max-w-2xl gap-4">
        <Button onClick={onUploadAnother} variant="outline" className="flex-1">
          <Upload className="mr-2 h-4 w-4" />
          Upload Another Parcel
        </Button>
        <Button onClick={onAssignOwners} className="flex-1 text-white">
          <Users className="mr-2 h-4 w-4" />
          Assign Parcels to Owners
        </Button>
      </div>
    </div>
  );
};
