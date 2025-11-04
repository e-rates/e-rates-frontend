'use client';

import React from 'react';
import MapComponent from '@/app/(admin)/components/map/MapComponent';
import { BlurInLoader } from '@/app/components/blur-in-loader';

export default function ParcelsMapPage() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BlurInLoader isLoading={isLoading}>
      <div className="h-full w-full" style={{ height: 'calc(100vh - 60px)' }}>
        <MapComponent />
      </div>
    </BlurInLoader>
  );
}
