'use client';

import React, { useMemo } from 'react';

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

interface CoordinateGridProps {
  // Bounding box coordinates (lat/lon or eastings/northings)
  minLat?: number;
  maxLat?: number;
  minLon?: number;
  maxLon?: number;
  // Visual options
  gridColor?: string;
  gridOpacity?: number;
  gridDivisions?: number; // Number of grid divisions
  labelType?: 'latlon' | 'eastings'; // Type of labels to display
  // Parcel data
  parcelData?: ParcelGeoJSON | null;
  isLoading?: boolean;
  error?: Error | null;
  showBasemap?: boolean;
}


const CoordinateGrid: React.FC<CoordinateGridProps> = ({
  minLat: defaultMinLat = -1.3,
  maxLat: defaultMaxLat = -1.25,
  minLon: defaultMinLon = 36.8,
  maxLon: defaultMaxLon = 36.85,
  gridColor = '#888888',
  gridOpacity = 0.4,
  gridDivisions = 10,
  labelType = 'latlon',
  parcelData,
  isLoading = false,
  error = null,
  showBasemap = false,
}) => {
  // Calculate bounds from parcel data if available, always centered on parcel
  const { minLat, maxLat, minLon, maxLon, centerLat, centerLon } = useMemo(() => {
    if (!parcelData?.features?.length) {
      return {
        minLat: defaultMinLat,
        maxLat: defaultMaxLat,
        minLon: defaultMinLon,
        maxLon: defaultMaxLon,
        centerLat: (defaultMinLat + defaultMaxLat) / 2,
        centerLon: (defaultMinLon + defaultMaxLon) / 2,
      };
    }

    // Get first parcel's coordinates
    const feature = parcelData.features[0];
    const coords = feature.geometry.coordinates[0]; // First ring of polygon

    // Find bounds
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLt = Infinity;
    let maxLt = -Infinity;
    let validPoints = 0;

    coords.forEach(([lng, lat]) => {
      // Filter out invalid points (0,0) which are common artifacts
      if (Math.abs(lng) < 0.0001 && Math.abs(lat) < 0.0001) return;
      
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLt = Math.min(minLt, lat);
      maxLt = Math.max(maxLt, lat);
      validPoints++;
    });

    // If no valid points, fall back to defaults
    if (validPoints === 0) {
      return {
        minLat: defaultMinLat,
        maxLat: defaultMaxLat,
        minLon: defaultMinLon,
        maxLon: defaultMaxLon,
        centerLat: (defaultMinLat + defaultMaxLat) / 2,
        centerLon: (defaultMinLon + defaultMaxLon) / 2,
      };
    }

    // Calculate center of parcel
    const centerLt = (minLt + maxLt) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate the range needed to show the parcel
    const latRange = maxLt - minLt;
    const lngRange = maxLng - minLng;
    
    // Use the larger range to maintain aspect ratio and add padding
    // Use a minimum range to prevent zooming in too far on single points or tiny parcels
    const maxRange = Math.max(latRange, lngRange, 0.001); 
    const paddedRange = maxRange * 1.5; // 50% padding on all sides

    // Center the view on the parcel with equal padding on all sides
    return {
      minLat: centerLt - paddedRange / 2,
      maxLat: centerLt + paddedRange / 2,
      minLon: centerLng - paddedRange / 2,
      maxLon: centerLng + paddedRange / 2,
      centerLat: centerLt,
      centerLon: centerLng,
    };
  }, [parcelData, defaultMinLat, defaultMaxLat, defaultMinLon, defaultMaxLon]);

  // Calculate step sizes
  const latStep = (maxLat - minLat) / gridDivisions;
  const lonStep = (maxLon - minLon) / gridDivisions;

  // Generate latitude lines (horizontal - Northings) and labels
  const latLines = Array.from({ length: gridDivisions + 1 }, (_, i) => ({
    position: (i / gridDivisions) * 100,
    value: minLat + i * latStep,
  }));

  // Generate longitude lines (vertical - Eastings) and labels
  const lonLines = Array.from({ length: gridDivisions + 1 }, (_, i) => ({
    position: (i / gridDivisions) * 100,
    value: minLon + i * lonStep,
  }));

  const formatCoordinate = (value: number, decimals: number = 4) => {
    return value.toFixed(decimals);
  };

  // Convert parcel coordinates to SVG path
  const parcelPath = useMemo(() => {
    if (!parcelData?.features?.length) return null;

    const feature = parcelData.features[0];
    const coords = feature.geometry.coordinates[0];

    // Convert lat/lon to percentage position
    const points = coords.map(([lng, lat]) => {
      const x = ((lng - minLon) / (maxLon - minLon)) * 100;
      const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // Invert Y
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')} Z`;
  }, [parcelData, minLat, maxLat, minLon, maxLon]);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-white dark:bg-neutral-950">
      {/* Basemap overlay */}
      {showBasemap && centerLat && centerLon && (
        <div 
          className="absolute inset-0"
          style={{ 
            zIndex: 0,
            backgroundImage: `url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/17/${Math.floor((centerLat + 90) / 180 * Math.pow(2, 17))}/${Math.floor((centerLon + 180) / 360 * Math.pow(2, 17))})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.7,
          }}
        >
          {/* OpenStreetMap attribution */}
          <div className="absolute right-2 bottom-2 bg-white/80 px-2 py-1 text-[8px] text-neutral-600 dark:bg-neutral-900/80 dark:text-neutral-400">
            © Esri, Maxar, Earthstar Geographics
          </div>
        </div>
      )}

      {/* Grid SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 1 }}
      >
        {/* Longitude lines (vertical - Eastings) */}
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

        {/* Latitude lines (horizontal - Northings) */}
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

        {/* Parcel polygon */}
        {parcelPath && (
          <path
            d={parcelPath}
            fill="rgba(34, 197, 94, 0.2)"
            stroke="rgba(34, 197, 94, 0.8)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Coordinate Labels */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 2 }}
      >
        {/* Top - Longitude/Easting labels */}
        <div className="absolute top-1 right-0 left-0 flex h-8">
          {lonLines.map((line, i) => {
            // Skip first and last to prevent cutoff at edges
            if (i === 0 || i === lonLines.length - 1) return null;
            return (
              <div
                key={`lon-label-${i}`}
                className="absolute -translate-x-1/2"
                style={{ left: `${line.position}%` }}
              >
                <span className="bg-white/60 px-1 font-mono text-[9px] text-neutral-400 dark:bg-neutral-950/60 dark:text-neutral-600">
                  {labelType === 'latlon'
                    ? `${formatCoordinate(line.value)}°E`
                    : `${Math.round(line.value)} E`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Left - Latitude/Northing labels */}
        <div className="absolute top-0 bottom-0 left-1 flex w-16 flex-col">
          {latLines.map((line, i) => {
            // Skip first and last to prevent cutoff at edges
            if (i === 0 || i === latLines.length - 1) return null;
            return (
              <div
                key={`lat-label-${i}`}
                className="absolute -translate-y-1/2"
                style={{ top: `${100 - line.position}%` }}
              >
                <span className="bg-white/60 px-1 font-mono text-[9px] text-neutral-400 dark:bg-neutral-950/60 dark:text-neutral-600">
                  {labelType === 'latlon'
                    ? `${formatCoordinate(line.value)}°S`
                    : `${Math.round(line.value)} N`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom - Longitude/Easting labels (repeated for clarity) */}
        <div className="absolute right-0 bottom-1 left-0 flex h-8">
          {lonLines.map((line, i) => {
            // Skip first and last to prevent cutoff at edges
            if (i === 0 || i === lonLines.length - 1) return null;
            return (
              <div
                key={`lon-label-bottom-${i}`}
                className="absolute -translate-x-1/2"
                style={{ left: `${line.position}%` }}
              >
                <span className="bg-white/60 px-1 font-mono text-[9px] text-neutral-400 dark:bg-neutral-950/60 dark:text-neutral-600">
                  {labelType === 'latlon'
                    ? `${formatCoordinate(line.value)}°E`
                    : `${Math.round(line.value)} E`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right - Latitude/Northing labels (repeated for clarity) */}
        <div className="absolute top-0 right-1 bottom-0 flex w-16 flex-col">
          {latLines.map((line, i) => {
            // Skip first and last to prevent cutoff at edges
            if (i === 0 || i === latLines.length - 1) return null;
            return (
              <div
                key={`lat-label-right-${i}`}
                className="absolute -translate-y-1/2"
                style={{ top: `${100 - line.position}%` }}
              >
                <span className="bg-white/60 px-1 font-mono text-[9px] text-neutral-400 dark:bg-neutral-950/60 dark:text-neutral-600">
                  {labelType === 'latlon'
                    ? `${formatCoordinate(line.value)}°S`
                    : `${Math.round(line.value)} N`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoordinateGrid;
