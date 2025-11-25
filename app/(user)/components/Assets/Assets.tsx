'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { authService } from '@/lib/auth';
import axios from 'axios';

interface Parcel {
  parcel_id: string;
  parcel_ref: string;
  area_m2: number;
  status: string;
  props?: {
    area_name?: string;
    AREA_NAME?: string;
  };
  payment_status?: string;
}

const Assets = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserParcels = async () => {
      try {
        setIsLoading(true);
        const token = await authService.getValidAccessToken();
        
        if (!token) {
          setError('Please log in to view your parcels');
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get('/api/user/parcels', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('📥 User parcels response:', response.data);
        
        // Handle GeoJSON format
        let parcelData = response.data;
        
        if (parcelData.type === 'FeatureCollection' && parcelData.features) {
          // GeoJSON format - extract properties from features
          parcelData = parcelData.features.map((feature: any) => ({
            ...feature.properties,
            geometry: feature.geometry, // Keep geometry for map
          }));
        } else if (parcelData.results) {
          parcelData = parcelData.results; // Django pagination format
        } else if (!Array.isArray(parcelData)) {
          parcelData = []; // Not an array, default to empty
        }

        console.log('📦 Extracted parcels:', parcelData.length, 'parcels');
        setParcels(parcelData);
      } catch (err: any) {
        console.error('Failed to fetch user parcels:', err);
        setError('Failed to load your parcels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserParcels();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full space-y-4 px-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Assets
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4 px-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Assets
          </h2>
        </div>
        <div className="flex items-center justify-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (parcels.length === 0) {
    return (
      <div className="w-full space-y-4 px-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Assets
          </h2>
        </div>
        <div className="flex items-center justify-center rounded-lg border border-dashed border-neutral-300 py-8 text-neutral-500 dark:border-neutral-700">
          No parcels allocated yet
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 px-2">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Assets
        </h2>
      </div>

      {/* Grid layout - responsive */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {parcels.map((parcel) => {
          const location = parcel.props?.area_name || parcel.props?.AREA_NAME || 'Unknown location';
          const isPaid = parcel.payment_status === 'paid' || parcel.status === 'paid';
          
          return (
            <Link
              key={parcel.parcel_id}
              href={'/'}
              className="squircle-2xl group relative overflow-hidden border border-neutral-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-neutral-300 hover:shadow-lg dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:hover:border-neutral-600"
            >
              {/* Card content */}
              <div className="flex items-center justify-between p-4">
                {/* Left section - Plot info */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Plot Number
                    </span>
                    <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {parcel.parcel_ref}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      {location}
                    </span>
                  </div>
                  
                  {parcel.area_m2 && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {(parcel.area_m2 / 4046.86).toFixed(2)} acres
                    </div>
                  )}
                </div>

                {/* Right section - Status badge */}
                <div className="flex flex-col items-end gap-2">
                  {!isPaid ? (
                    <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 dark:bg-red-950/30">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">
                        Unpaid
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950/30">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        No Arrears
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtle gradient overlay on hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-neutral-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-neutral-900/0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Assets;
