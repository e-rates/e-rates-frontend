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
import Image from 'next/image';
import React from 'react';

interface LocationOption {
  value: string;
  label: string;
}

interface LocationSelectorProps {
  county: string;
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
  subCounty,
  ward,
  subCounties,
  wards,
  onSubCountyChange,
  onWardChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center px-4">
      <div className="flex h-full w-full flex-col items-center space-y-2">
        <div className="squircle-xl bg-elevated-surface border-border-default flex flex-row items-center space-x-2 border px-3 py-2">
          <Image
            src="/NRB-logo.png"
            alt="Nairobi County government logo"
            width={18.5}
            height={18.73}
            className="h-auto w-auto"
            priority
          />
          <h1 className="text-regular-lg text-text-tertiary">
            {county} County
          </h1>
        </div>
      </div>
      <div className="flex w-[600px] flex-row justify-between">
        <div className="flex flex-col space-y-2">
          <h1 className="text-regular-md text-text-tertiary">
            Please select a sub-county
          </h1>
          <Select
            value={subCounty}
            onValueChange={onSubCountyChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="sub-counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-regular-sm tracking-tight">
                  sub-county
                </SelectLabel>
                {subCounties.map((sc) => (
                  <SelectItem key={sc.value} value={sc.value}>
                    {sc.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col space-y-2">
          <h1 className="text-regular-md text-text-tertiary">
            Please select a ward (optional)
          </h1>
          <Select value={ward} onValueChange={onWardChange} disabled={disabled}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Electoral Ward" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-regular-sm tracking-tight">
                  Ward
                </SelectLabel>
                {wards.map((w) => (
                  <SelectItem key={w.value} value={w.value}>
                    {w.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
