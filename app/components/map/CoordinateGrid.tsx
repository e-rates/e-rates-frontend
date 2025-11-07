'use client';

import React from 'react';

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
}

const CoordinateGrid: React.FC<CoordinateGridProps> = ({
  minLat = -1.3,
  maxLat = -1.25,
  minLon = 36.8,
  maxLon = 36.85,
  gridColor = '#888888',
  gridOpacity = 0.4,
  gridDivisions = 10,
  labelType = 'latlon',
}) => {
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

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-white dark:bg-neutral-950">
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

        {/* Center info */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white/70 px-2 py-1 dark:bg-neutral-900/70">
            <p className="font-mono text-[9px] text-neutral-400 dark:text-neutral-600">
              Ready for shapefile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinateGrid;
