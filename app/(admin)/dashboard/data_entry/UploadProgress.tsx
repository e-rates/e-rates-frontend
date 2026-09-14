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
    <div className="flex flex-col items-end gap-2 shrink-0">
      {isUploading && (
        <div className="w-48">
          <div className="mb-1 flex justify-between text-[11px] text-text-tertiary">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="rounded-none bg-surface-secondary h-1.5 w-full">
            <div
              className="rounded-none h-1.5 bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <Button
        className="min-w-[110px] text-white rounded-none cursor-pointer whitespace-nowrap"
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
