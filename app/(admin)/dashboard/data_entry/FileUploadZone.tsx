'use client';

import { Button } from '@/app/components/ui/button';
import { HardDriveUpload, X, CheckCircle } from 'lucide-react';
import React from 'react';

interface FileUploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onInvalidFile: () => void;
  disabled?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  files,
  onFilesChange,
  onInvalidFile,
  disabled = false,
}) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.name.endsWith('.zip')
    );

    if (droppedFiles.length > 0) {
      onFilesChange(droppedFiles);
    } else {
      onInvalidFile();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const selectedFiles = Array.from(e.target.files || []).filter((file) =>
      file.name.endsWith('.zip')
    );

    if (selectedFiles.length > 0) {
      onFilesChange(selectedFiles);
    } else {
      onInvalidFile();
    }
  };

  const handleRemoveFile = () => {
    onFilesChange([]);
  };

  return (
    <div className="w-[600px]">
      <h1 className="text-text-tertiary text-[18px] tracking-tight">
        Parcel Zip upload
      </h1>
      <p className="text-regular-sm text-text-tertiary tracking-normal">
        Only Zip formats are accepted{' '}
        <span className="font-bold text-rose-500">(confirm before upload)</span>
      </p>
      <div className="squircle-lg border-border-default mt-4 flex w-full flex-col items-start border-[0.5px] border-dashed px-2 py-2">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`w-full ${disabled ? 'cursor-not-allowed opacity-50' : files.length > 0 ? '' : 'cursor-pointer'}`}
        >
          <div className="flex w-full flex-col items-center space-y-2">
            {files.length === 0 ? (
              <>
                <HardDriveUpload className="text-text-tertiary h-10 w-10" />
                <h1 className="text-text-tertiary text-sm tracking-tight">
                  Drag File(s) to start uploading
                </h1>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={disabled}
                />
                <Button
                  className="bg-elevated-surface"
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                  type="button"
                  disabled={disabled}
                >
                  <span className="text-text-primary tracking-tight">
                    Browse Files
                  </span>
                </Button>
              </>
            ) : (
              <div className="flex w-full flex-col items-center space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h1 className="text-text-primary text-base font-medium tracking-tight">
                    File Selected
                  </h1>
                </div>
                <div className="squircle-lg bg-surface-secondary flex w-full items-center justify-between px-4 py-3">
                  <p className="text-regular-md text-text-primary font-medium">
                    {files[0].name}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={disabled}
                    className="hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
