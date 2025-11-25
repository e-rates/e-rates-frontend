'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { authService } from '@/lib/auth';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Define types
interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    parcel_ref?: string;
    area_m2?: number;
    location?: string;
    owner_username?: string;
    [key: string]: unknown;
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Dynamic import of the map component to avoid SSR issues
const UserMapClient = dynamic(() => import('./UserMapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-neutral-100 dark:bg-neutral-900">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

export default function UserMap() {
  const [geojsonData, setGeojsonData] = useState<GeoJSONData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserParcels = async () => {
      try {
        setIsLoading(true);
        const token = await authService.getValidAccessToken();
        
        const response = await axios.get<GeoJSONData>('/api/user/parcels', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('🗺️ Map parcels data:', response.data);
        setGeojsonData(response.data);
      } catch (err) {
        console.error('Failed to fetch parcels for map:', err);
        setError('Failed to load map');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserParcels();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !geojsonData) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <p className="text-neutral-500">{error || 'No map data available'}</p>
      </div>
    );
  }

  return <UserMapClient geojsonData={geojsonData} />;
}
