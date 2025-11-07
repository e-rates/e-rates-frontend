import React from 'react';
import Assets from './components/Assets/Assets';
import History from './components/History/History';
import CoordinateGrid from '@/app/components/map/CoordinateGrid';

export default function UserHome() {
  return (
    <div className="bg-elevated-surface h-screen w-full space-y-2 px-2 pt-2 md:grid md:h-[calc(100vh-124px)] md:grid-cols-2">
      {/* Map Container */}
      <div className="flex w-full flex-col items-center md:h-full">
        <div className="relative min-h-[200px] w-full max-w-5xl overflow-hidden md:h-full">
          <CoordinateGrid
            minLat={-1.3}
            maxLat={-1.25}
            minLon={36.8}
            maxLon={36.85}
            gridDivisions={5}
            gridOpacity={0.1}
            labelType="latlon"
          />
        </div>
      </div>

      <div className="md:h-full">
        {' '}
        {/* Assets */}
        <div>
          <Assets />
        </div>
        {/* History */}
        <div>
          <History />
        </div>
      </div>
    </div>
  );
}
