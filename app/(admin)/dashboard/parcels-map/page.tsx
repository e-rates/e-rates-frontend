'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MapComponent from '@/app/(admin)/components/map/MapComponent';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { AllocateParcel } from './AllocateParcel';
import { Map, UserPlus } from 'lucide-react';

export default function ParcelsMapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'map' | 'allocate'>('map');

  useEffect(() => {
    // Check if we should navigate to allocate tab
    const tab = searchParams.get('tab');
    if (tab === 'allocate') {
      setActiveTab('allocate');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'map' | 'allocate') => {
    setActiveTab(tab);
    // Update URL without navigation
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.replace(`/dashboard/parcels-map?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <BlurInLoader isLoading={false}>
      <div className="flex h-full w-full flex-col">
        {/* Tabs */}
        <div className="flex border-b bg-background">
          <button
            onClick={() => handleTabChange('map')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'map'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map className="h-4 w-4" />
            Map
          </button>
          <button
            onClick={() => handleTabChange('allocate')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'allocate'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Allocate Parcel
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'map' ? (
            <div className="h-full w-full">
              <MapComponent />
            </div>
          ) : (
            <AllocateParcel />
          )}
        </div>
      </div>
    </BlurInLoader>
  );
}
