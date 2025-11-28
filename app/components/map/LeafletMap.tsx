'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

interface ParcelGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

interface ParcelProperties {
  parcel_ref: string;
  area_m2: number;
  [key: string]: any;
}

interface ParcelFeature {
  id: string;
  type: 'Feature';
  geometry: ParcelGeometry;
  properties: ParcelProperties;
}

interface ParcelGeoJSON {
  type: 'FeatureCollection';
  features: ParcelFeature[];
}

interface LeafletMapProps {
  parcelData?: ParcelGeoJSON | null;
  isLoading?: boolean;
  error?: Error | null;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  parcelData,
  isLoading = false,
  error = null,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Log parcel data for debugging
  useEffect(() => {
    console.log('🗺️ LeafletMap render:', {
      hasParcelData: !!parcelData,
      parcelCount: parcelData?.features?.length,
      isLoading,
      error: error?.message,
    });
  }, [parcelData, isLoading, error]);

  // Calculate bounds and center from parcel data
  const { center, zoom } = useMemo(() => {
    if (!parcelData?.features?.length) {
      console.log('⚠️ No parcel data, using default Nairobi center');
      return {
        center: [-1.2921, 36.8219] as [number, number],
        zoom: 12,
      };
    }

    console.log('📍 Calculating center from', parcelData.features.length, 'parcels');
    const feature = parcelData.features[0];
    const coords = feature.geometry.coordinates[0];

    // Find bounds
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    coords.forEach(([lng, lat]) => {
      if (Math.abs(lng) < 0.0001 && Math.abs(lat) < 0.0001) return;
      
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    console.log('📍 Calculated center:', centerLat, centerLng);

    // Calculate zoom
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let calculatedZoom = 18;
    if (maxDiff > 0.1) calculatedZoom = 12;
    else if (maxDiff > 0.01) calculatedZoom = 15;
    else if (maxDiff > 0.001) calculatedZoom = 17;

    return {
      center: [centerLat, centerLng] as [number, number],
      zoom: calculatedZoom,
    };
  }, [parcelData]);

  if (!isClient) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <p className="text-neutral-600 dark:text-neutral-400">Initializing map...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        key={`${center[0]}-${center[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {parcelData?.features && parcelData.features.length > 0 && (
          <GeoJSON
            key={JSON.stringify(parcelData)}
            data={parcelData as any}
            style={{
              color: '#22c55e',
              weight: 2,
              opacity: 0.8,
              fillColor: '#22c55e',
              fillOpacity: 0.2,
            }}
          />
        )}
      </MapContainer>

      {/* Info overlay - No parcels found */}
      {!isLoading && !parcelData?.features?.length && (
        <div className="absolute bottom-4 left-4 rounded-lg bg-blue-50 px-4 py-2 text-sm shadow-md dark:bg-blue-950/80">
          <span className="font-medium text-blue-900 dark:text-blue-100">
            No parcels found for this user
          </span>
        </div>
      )}

      {/* Parcel count */}
      {parcelData?.features && parcelData.features.length > 0 && (
        <div className="absolute bottom-4 left-4 rounded-lg bg-green-50 px-4 py-2 text-sm shadow-md dark:bg-green-950/80">
          <span className="font-medium text-green-900 dark:text-green-100">
            ✓ {parcelData.features.length} parcel{parcelData.features.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
