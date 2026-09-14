'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/app/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import React from 'react';

interface AdvancedOptionsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refField: string;
  onRefFieldChange: (value: string) => void;
  clearExisting: boolean;
  onClearExistingChange: (value: boolean) => void;
  disabled?: boolean;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  isOpen,
  onOpenChange,
  refField,
  onRefFieldChange,
  clearExisting,
  onClearExistingChange,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger
          className="rounded-none bg-elevated-surface border border-border-default hover:bg-surface-secondary flex w-full items-center justify-between px-4 py-3 transition-colors cursor-pointer"
          disabled={disabled}
        >
          <span className="text-regular-md text-text-primary font-medium">
            Advanced Options
          </span>
          <ChevronDown
            className={`text-text-tertiary h-5 w-5 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="rounded-none bg-surface-secondary border border-border-default space-y-4 p-4">
            {/* Reference Field */}
            <div className="space-y-2">
              <label className="text-regular-sm text-text-primary font-medium">
                Reference Field Name
              </label>
              <input
                type="text"
                value={refField}
                onChange={(e) => onRefFieldChange(e.target.value)}
                placeholder="PARCEL_ID"
                disabled={disabled}
                className="rounded-none bg-elevated-surface border border-border-default text-regular-sm text-text-primary w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-regular-xs text-text-tertiary">
                Field in shapefile to use as parcel reference
              </p>
            </div>

            {/* Clear Existing */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="clearExisting"
                checked={clearExisting}
                onChange={(e) => onClearExistingChange(e.target.checked)}
                disabled={disabled}
                className="border-border-default h-4 w-4 rounded-none text-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <label
                htmlFor="clearExisting"
                className={`text-regular-sm text-text-primary font-medium ${
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                Clear existing parcels before upload
              </label>
            </div>
            {clearExisting && (
              <div className="rounded-none border border-rose-500/20 bg-rose-500/10 p-3">
                <p className="text-regular-xs text-rose-500">
                  ⚠️ Warning: This will delete all existing parcels in the
                  selected location before importing new ones.
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
