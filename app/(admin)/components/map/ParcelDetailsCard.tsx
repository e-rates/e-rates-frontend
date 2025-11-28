'use client';

import { X, User } from 'lucide-react';
import { useEffect } from 'react';

interface ParcelDetails {
  id: string;
  parcel_ref: string;
  owner_username: string;
  owner_id: string;
  area_m2: number;
  area_acres: number;
  area?: number;
  status: string;
  centroid: {
    lat: number;
    lng: number;
  } | {
    type: 'Point';
    coordinates: [number, number];
  };
  is_paid_current_year?: boolean;
  payment_status?: string;
  paid_years?: number[];
  latest_payment_year?: number | null;
  custom_props?: any;
}

interface ParcelDetailsCardProps {
  parcel: ParcelDetails | null;
  onClose: () => void;
}

export function ParcelDetailsCard({ parcel, onClose }: ParcelDetailsCardProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (parcel) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [parcel, onClose]);

  if (!parcel) return null;

  // Helper to extract coordinates from different centroid formats
  const getCentroid = () => {
    if (!parcel.centroid) return { lat: 0, lng: 0 };

    // Format 1: { lat, lng }
    if ('lat' in parcel.centroid) {
      return { lat: parcel.centroid.lat, lng: parcel.centroid.lng };
    }

    // Format 2: { type: 'Point', coordinates: [lng, lat] }
    if (
      'type' in parcel.centroid &&
      parcel.centroid.type === 'Point' &&
      'coordinates' in parcel.centroid &&
      Array.isArray(parcel.centroid.coordinates)
    ) {
      return {
        lat: parcel.centroid.coordinates[1],
        lng: parcel.centroid.coordinates[0],
      };
    }

    return { lat: 0, lng: 0 };
  };

  const centroid = getCentroid();

  // Calculate area values with fallback
  const area_m2 = parcel.area_m2 || parcel.area || 0;
  const area_acres = parcel.area_acres || area_m2 / 4046.86;
  const area_ha = area_m2 / 10000; // Convert m² to hectares

  // Convert area to hectares (1 hectare = 10,000 m²)
  const areaHectares = (parcel.area_m2 / 10000).toFixed(2);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-800 bg-[#1c1c1e] shadow-lg">
      {/* Header with Owner Info */}
      <div className="relative bg-linear-to-br from-gray-800 to-gray-900 p-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-lg bg-black/30 p-1.5 text-gray-300 transition-colors hover:bg-black/50 hover:text-white"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          {/* Avatar Placeholder */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-700">
            <User size={24} className="text-gray-400" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-white">
              {parcel.owner_username || 'Unknown Owner'}
            </h3>
            <p className="truncate text-xs text-gray-400">
              {parcel.custom_props?.area_name ||
                parcel.custom_props?.AREA_NAME ||
                'Kimathi Ward'}
            </p>
          </div>
        </div>

        {/* Parcel Number Badge */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-1.5">
          <span className="text-xs font-medium text-gray-400">Parcel No</span>
          <span className="text-sm font-bold text-blue-400">
            {parcel.parcel_ref}
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-3 p-4">
        {/* Coordinates */}
        <div className="space-y-2 rounded-xl bg-gray-800/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">lat:</span>
            <span className="font-mono text-sm font-semibold text-white">
              {centroid.lat.toFixed(6)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">long:</span>
            <span className="font-mono text-sm font-semibold text-white">
              {centroid.lng.toFixed(6)}
            </span>
          </div>
        </div>

        {/* Acreage */}
        <div className="rounded-xl bg-gray-800/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Area</span>
            <span className="text-base font-bold text-white">
              {area_ha.toFixed(2)} Ha
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">Acres</span>
            <span className="font-mono text-xs text-gray-400">
              {area_acres.toFixed(2)} ac
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Square meters</span>
            <span className="font-mono text-xs text-gray-400">
              {area_m2.toLocaleString()} m²
            </span>
          </div>
        </div>

        {/* Status
        <div className="rounded-xl bg-gray-800/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">
              Parcel Status
            </span>
            <span
              className={`rounded px-2 py-1 text-xs font-bold uppercase ${
                parcel.status === 'active'
                  ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
                  : parcel.status === 'inactive'
                    ? 'border border-gray-500/30 bg-gray-500/20 text-gray-400'
                    : 'border border-orange-500/30 bg-orange-500/20 text-orange-400'
              }`}
            >
              {parcel.status}
            </span>
          </div>
        </div> */}

        {/* Additional Info
        {parcel.custom_props && (
          <div className="space-y-2 rounded-xl bg-gray-800/50 p-3">
            <div className="mb-2 text-xs font-medium text-gray-500">
              Additional Details
            </div>
            {parcel.custom_props.PARCEL_nO && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Plot Number</span>
                <span className="font-mono text-xs text-gray-300">
                  {parcel.custom_props.PARCEL_nO}
                </span>
              </div>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}
