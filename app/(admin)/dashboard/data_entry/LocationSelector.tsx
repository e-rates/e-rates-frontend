'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import React from 'react';

export interface LocationOption {
  value: string;
  label: string;
}

interface LocationSelectorProps {
  county: string;
  countyLogo?: string | null;
  countyInitials?: string;
  subCounty: string;
  ward: string;
  subCounties: LocationOption[];
  wards: LocationOption[];
  onSubCountyChange: (value: string) => void;
  onWardChange: (value: string) => void;
  disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  county,
  countyLogo,
  countyInitials,
  subCounty,
  ward,
  subCounties,
  wards,
  onSubCountyChange,
  onWardChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col w-full gap-2.5">
      <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-text-secondary">Sub-County</label>
        <Select value={subCounty} onValueChange={onSubCountyChange} disabled={disabled}>
          <SelectTrigger className="w-full rounded-none border-border-default">
            <SelectValue placeholder="Select sub-county" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-border-default">
            <SelectGroup>
              <SelectLabel className="text-regular-sm tracking-tight">Sub-County</SelectLabel>
              {subCounties.map((sc) => (
                <SelectItem key={sc.value} value={sc.value} className="rounded-none">
                  {sc.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-text-secondary">Electoral Ward (optional)</label>
        <Select value={ward} onValueChange={onWardChange} disabled={disabled}>
          <SelectTrigger className="w-full rounded-none border-border-default">
            <SelectValue placeholder="Select ward" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-border-default">
            <SelectGroup>
              <SelectLabel className="text-regular-sm tracking-tight">Ward</SelectLabel>
              {wards.map((w) => (
                <SelectItem key={w.value} value={w.value} className="rounded-none">
                  {w.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
