'use client';

import { Button } from '@/app/components/ui/button';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
  onUpload: () => void;
  disabled?: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  progress,
  onUpload,
  disabled = false,
}) => {
  return (
    <div className="w-[600px] space-y-3">
      {isUploading && (
        <div className="w-full">
          <div className="mb-2 flex justify-between">
            <span className="text-regular-sm text-text-tertiary">
              Uploading...
            </span>
            <span className="text-regular-sm text-text-tertiary">
              {progress}%
            </span>
          </div>
          <div className="squircle-full bg-surface-secondary h-2 w-full">
            <div
              className="squircle-full h-2 bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <Button
        className="w-full text-white"
        onClick={onUpload}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </div>
  );
};
