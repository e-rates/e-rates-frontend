'use client';

import { Button } from '@/app/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import React from 'react';

export interface UploadResult {
  success: boolean;
  message: string;
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors: string[];
  shapefile_info?: {
    layer_name: string;
    feature_count: number;
    geometry_type: string;
    srid: number;
    fields: string[];
  };
}

interface UploadResultModalProps {
  isOpen: boolean;
  result: UploadResult | null;
  onClose: () => void;
}

export const UploadResultModal: React.FC<UploadResultModalProps> = ({
  isOpen,
  result,
  onClose,
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center duration-200">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="squircle-xl bg-elevated-surface border-border-default animate-in zoom-in-95 relative max-w-2xl border px-8 py-6 shadow-2xl duration-200">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            {result.success ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-rose-500" />
            )}
            <div>
              <h2 className="text-regular-xl text-text-primary font-semibold">
                {result.success ? 'Upload Successful' : 'Upload Failed'}
              </h2>
              <p className="text-regular-md text-text-secondary">
                {result.message}
              </p>
            </div>
          </div>

          <div className="squircle-lg bg-surface-secondary space-y-2 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-regular-sm text-text-tertiary">Imported</p>
                <p className="text-regular-lg text-text-primary font-semibold">
                  {result.imported_count}
                </p>
              </div>
              <div>
                <p className="text-regular-sm text-text-tertiary">Skipped</p>
                <p className="text-regular-lg text-text-primary font-semibold">
                  {result.skipped_count}
                </p>
              </div>
              <div>
                <p className="text-regular-sm text-text-tertiary">Errors</p>
                <p className="text-regular-lg text-text-primary font-semibold">
                  {result.error_count}
                </p>
              </div>
            </div>

            {result.shapefile_info && (
              <div className="border-border-default mt-4 border-t pt-4">
                <p className="text-regular-sm text-text-tertiary mb-2">
                  Shapefile Info:
                </p>
                <div className="text-regular-sm text-text-secondary space-y-1">
                  <p>Layer: {result.shapefile_info.layer_name}</p>
                  <p>Features: {result.shapefile_info.feature_count}</p>
                  <p>Geometry: {result.shapefile_info.geometry_type}</p>
                  <p>SRID: {result.shapefile_info.srid}</p>
                </div>
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="border-border-default mt-4 border-t pt-4">
                <p className="text-regular-sm text-text-tertiary mb-2">
                  Errors:
                </p>
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

          <Button
            onClick={onClose}
            className="w-full"
            variant={result.success ? 'default' : 'destructive'}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
