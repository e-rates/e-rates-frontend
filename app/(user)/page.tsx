'use client';

import React, { useEffect, useState } from 'react';
import Assets from './components/Assets/Assets';
import LeafletMap from '@/app/components/map/LeafletMap';
import { authService } from '@/lib/auth';
import { useUserParcels } from '@/lib/hooks/useParcels';

export default function UserHome() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID from token
    const id = authService.getUserId();
    console.log('🔑 User ID from token:', id);
    if (id) {
      setUserId(id.toString());
    }
  }, []);

  // Fetch user's parcels - only when userId is available (pass null if not available)
  const { data: parcelData, isLoading, error } = useUserParcels(userId as string);

  // Debug logging
  useEffect(() => {
    console.log('🗺️ Map data state:', {
      userId,
      hasData: !!parcelData,
      parcelCount: parcelData?.features?.length || 0,
      isLoading,
      error: error?.message,
    });
  }, [userId, parcelData, isLoading, error]);

  return (
    <div className="bg-elevated-surface h-screen w-full space-y-2 px-2 pt-2 md:grid md:h-[calc(100vh-124px)] md:grid-cols-2">
      {/* Map Container */}
      <div className="flex w-full flex-col items-center gap-2 md:h-full">
        <div className="relative min-h-[400px] w-full max-w-5xl overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 md:h-full md:min-h-[200px]">
          <LeafletMap
            parcelData={parcelData}
            isLoading={isLoading}
            error={error as Error | null}
          />
        </div>
      </div>

      <div className="md:h-full">
        {/* Assets */}
        <div>
          <Assets />
        </div>
      </div>
    </div>
  );
}
