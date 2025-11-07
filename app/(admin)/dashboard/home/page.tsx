'use client';

import { BlurInLoader } from '@/app/components/blur-in-loader';
import MapComponent from '../../components/map/MapComponent';
export default function HomePage() {
  return (
    <BlurInLoader isLoading={false}>
      <div className="border-border-default/30 ml-2 flex h-full w-full flex-col gap-[px] border-l-[0.5px] py-2">
        {/* Recent Activity */}
        <div className="bg-elevated-surface border-border-default w-full">
          <div className="p-2">
            <h2 className="text-text-primary text-xl font-semibold">
              Map Overview
            </h2>
          </div>
          <div>
            <div
              className="h-full w-full"
              style={{ height: 'calc(100vh - 60px)' }}
            >
              <MapComponent />
            </div>
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
