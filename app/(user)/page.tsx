import React from 'react';
import Assets from './components/Assets/Assets';
import History from './components/History/History';
import UserMap from './components/UserMap';
import ParcelGrid from './components/ParcelGrid';

export default function UserHome() {
  return (
    <div className="bg-elevated-surface h-screen w-full space-y-2 px-2 pt-2 md:grid md:h-[calc(100vh-124px)] md:grid-cols-2">
      {/* Map Container */}
      <div className="flex w-full flex-col items-center md:h-full">
        <div className="relative min-h-[200px] w-full max-w-5xl overflow-hidden md:h-full">
          {/* Map layer (behind grid) */}
          <div className="absolute inset-0 z-0">
            <UserMap />
          </div>
          
          {/* Parcel-specific coordinate grid overlay (on top) */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <ParcelGrid
              gridDivisions={8}
              gridOpacity={0.2}
              showLabels={true}
            />
          </div>
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
