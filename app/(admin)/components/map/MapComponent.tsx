'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import the map to avoid SSR issues
const Map = dynamic(() => import('@/app/(admin)/components/map/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
});

const MapComponent = () => {
  return (
    <div className="h-full w-full">
      <Map />
    </div>
  );
};

export default MapComponent;
