'use client';

import React, { useEffect, useState } from 'react';
import { authService } from '@/lib/auth';
import axios from 'axios';

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    parcel_ref?: string;
    [key: string]: unknown;
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface ParcelGridProps {
  gridColor?: string;
  gridOpacity?: number;
  gridDivisions?: number;
  labelType?: 'latlon' | 'eastings';
  showLabels?: boolean;
}

const ParcelGrid: React.FC<ParcelGridProps> = ({
  gridColor = '#888888',
  gridOpacity = 0.3,
  gridDivisions = 8,
  showLabels = true,
}) => {
  const [bounds, setBounds] = useState<{
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  } | null>(null);

  useEffect(() => {
    const fetchParcelBounds = async () => {
      try {
        const token = await authService.getValidAccessToken();
        const response = await axios.get<GeoJSONData>('/api/user/parcels', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.features && response.data.features.length > 0) {
          const feature = response.data.features[0];

          // Extract bounds from geometry
          const coords = feature.geometry.coordinates;
          let allCoords: number[][] = [];

          // Flatten coordinates based on geometry type
          if (feature.geometry.type === 'Polygon') {
            allCoords = coords[0] as number[][];
          } else if (feature.geometry.type === 'MultiPolygon') {
            allCoords = (coords as unknown as number[][][][]).flat(2);
          }

          if (allCoords.length > 0) {
            const lons = allCoords.map((c) => c[0]);
            const lats = allCoords.map((c) => c[1]);

            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);

            // Add padding (10% on each side)
            const lonPadding = (maxLon - minLon) * 0.1;
            const latPadding = (maxLat - minLat) * 0.1;

            setBounds({
              minLon: minLon - lonPadding,
              maxLon: maxLon + lonPadding,
              minLat: minLat - latPadding,
              maxLat: maxLat + latPadding,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch parcel bounds:', err);
      }
    };

    fetchParcelBounds();
  }, []);

  if (!bounds) {
    return null;
  }

  // Calculate step sizes
  const latStep = (bounds.maxLat - bounds.minLat) / gridDivisions;
  const lonStep = (bounds.maxLon - bounds.minLon) / gridDivisions;

  // Generate latitude lines (horizontal) and labels
  const latLines = Array.from({ length: gridDivisions + 1 }, (_, i) => ({
    position: (i / gridDivisions) * 100,
    value: bounds.minLat + i * latStep,
  }));

  // Generate longitude lines (vertical) and labels
  const lonLines = Array.from({ length: gridDivisions + 1 }, (_, i) => ({
    position: (i / gridDivisions) * 100,
    value: bounds.minLon + i * lonStep,
  }));

  const formatCoordinate = (value: number, decimals: number = 5) => {
    return value.toFixed(decimals);
  };

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none">
      {/* Grid SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 1 }}
      >
        {/* Longitude lines (vertical) */}
        {lonLines.map((line, i) => (
          <line
            key={`lon-${i}`}
            x1={`${line.position}%`}
            y1="0%"
            x2={`${line.position}%`}
            y2="100%"
            stroke={gridColor}
            strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
            opacity={gridOpacity}
          />
        ))}

        {/* Latitude lines (horizontal) */}
        {latLines.map((line, i) => (
          <line
            key={`lat-${i}`}
            x1="0%"
            y1={`${100 - line.position}%`}
            x2="100%"
            y2={`${100 - line.position}%`}
            stroke={gridColor}
            strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
            opacity={gridOpacity}
          />
        ))}
      </svg>

      {/* Coordinate Labels */}
      {showLabels && (
        <div
          className="absolute inset-0"
          style={{ zIndex: 2 }}
        >
          {/* Corner labels only */}
          {/* Top Left */}
          <div className="absolute top-2 left-2">
            <span className="bg-white/90 px-2 py-1 rounded shadow font-mono text-[11px] text-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-300">
              {formatCoordinate(bounds.maxLat, 4)}°S, {formatCoordinate(bounds.minLon, 4)}°E
            </span>
          </div>

          {/* Top Right */}
          <div className="absolute top-2 right-2">
            <span className="bg-white/90 px-2 py-1 rounded shadow font-mono text-[11px] text-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-300">
              {formatCoordinate(bounds.maxLat, 4)}°S, {formatCoordinate(bounds.maxLon, 4)}°E
            </span>
          </div>

          {/* Bottom Left */}
          <div className="absolute bottom-2 left-2">
            <span className="bg-white/90 px-2 py-1 rounded shadow font-mono text-[11px] text-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-300">
              {formatCoordinate(bounds.minLat, 4)}°S, {formatCoordinate(bounds.minLon, 4)}°E
            </span>
          </div>

          {/* Bottom Right */}
          <div className="absolute bottom-2 right-2">
            <span className="bg-white/90 px-2 py-1 rounded shadow font-mono text-[11px] text-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-300">
              {formatCoordinate(bounds.minLat, 4)}°S, {formatCoordinate(bounds.maxLon, 4)}°E
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default ParcelGrid;
