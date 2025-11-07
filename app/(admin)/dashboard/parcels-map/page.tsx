'use client';

import React from 'react';
import MapComponent from '@/app/(admin)/components/map/MapComponent';
import { BlurInLoader } from '@/app/components/blur-in-loader';

export default function ParcelsMapPage() {
  return (
    <BlurInLoader isLoading={false}>
      <div className="h-full w-full" style={{ height: 'calc(100vh - 60px)' }}>
        <MapComponent />
      </div>
    </BlurInLoader>
  );
}
