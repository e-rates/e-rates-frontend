'use client';

import React from 'react';
import Link from 'next/link';
import MapComponent from '@/app/(admin)/components/map/MapComponent';
import { UserPlus } from 'lucide-react';

export default function ParcelsMapPage() {
  return (
    <div className="relative flex h-full w-full flex-col">
      <Link
        href="/dashboard/allocations"
        className="border-border-default bg-main-bg hover:bg-hover-surface absolute top-3 right-3 z-[1000] flex items-center gap-2 border-[0.5px] px-3 py-1.5 text-sm text-text-primary"
      >
        <UserPlus className="h-4 w-4" />
        Allocate a plot
      </Link>
      <div className="h-full w-full">
        <MapComponent />
      </div>
    </div>
  );
}
