'use client';

import { Button } from '@/app/components/ui/button';
import { AlertCircle } from 'lucide-react';
import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center duration-200">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="squircle-xl bg-elevated-surface border-border-default animate-in zoom-in-95 relative max-w-md border px-8 py-6 shadow-2xl duration-200">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-16 w-16 text-rose-500" />
          <p className="text-regular-lg text-text-primary text-center">
            {message}
          </p>
          <Button onClick={onClose} className="w-full" variant="destructive">
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};
