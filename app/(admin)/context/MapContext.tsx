'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import { Map as LeafletMap } from 'leaflet';
import toast from 'react-hot-toast';

interface MapContextType {
  mapRef: React.MutableRefObject<LeafletMap | null>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  isMapInView: boolean;
  setIsMapInView: (inView: boolean) => void;
  showGrid: boolean;
  toggleGrid: () => void;
  triggerGridRedraw: () => void;
  showBaseMap: boolean;
  toggleBaseMap: () => void;
  isMapLocked: boolean;
  toggleMapLock: () => void;
  showParcels: boolean;
  toggleParcels: () => void;
  selectedParcel: any | null;
  setSelectedParcel: (parcel: any | null) => void;
  parcelFilters: {
    area_name?: string;
    status?: 'active' | 'inactive';
    search?: string;
    owner_user?: string;
  };
  setParcelFilters: (filters: {
    area_name?: string;
    status?: 'active' | 'inactive';
    search?: string;
    owner_user?: string;
  }) => void;
  locateParcel: (parcelRef: string) => Promise<void>;
  highlightedParcels: string[];
  setHighlightedParcels: (refs: string[]) => void;
  clearHighlights: () => void;
}

const MapContext = createContext<MapContextType | null>(null);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const [isMapInView, setIsMapInView] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [gridRedrawTrigger, setGridRedrawTrigger] = useState(0);
  const [showBaseMap, setShowBaseMap] = useState(true);
  const toggleBaseMap = () => {
    setShowBaseMap((prev) => !prev);
  };
  const [isMapLocked, setIsMapLocked] = useState(false);
  const [showParcels, setShowParcels] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);
  const [parcelFilters, setParcelFilters] = useState<{
    area_name?: string;
    status?: 'active' | 'inactive';
    search?: string;
    owner_user?: string;
  }>({});
  const [highlightedParcels, setHighlightedParcels] = useState<string[]>([]);
  const clearHighlights = () => setHighlightedParcels([]);

  const zoomIn = () => {
    if (mapRef.current && isMapInView) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current && isMapInView) {
      mapRef.current.zoomOut();
    }
  };

  const resetZoom = () => {
    if (mapRef.current && isMapInView) {
      mapRef.current.setZoom(13); // Reset to default zoom level
    }
  };

  const toggleGrid = () => {
    setShowGrid((prev) => !prev);
  };

  // Show toast when grid is enabled
  React.useEffect(() => {
    if (showGrid) {
      toast(
        'Parcel Inspector Mode: Click any parcel to view technical details',
        {
          icon: '🔍',
          duration: 4000,
        }
      );
    }
  }, [showGrid]);

  const triggerGridRedraw = () => {
    setGridRedrawTrigger((prev) => prev + 1);
  };
  const toggleMapLock = () => {
    setIsMapLocked((prev) => !prev);
  };

  const toggleParcels = () => {
    setShowParcels((prev) => !prev);
  };

  const locateParcel = async (parcelRef: string) => {
    try {
      // Try local DB first
    const clearHighlights = () => setHighlightedParcels([]);
      const { ParcelQueries } = await import('@/lib/db/queries');
      let parcels = await ParcelQueries.search(parcelRef);
      let feature = null;
      if (parcels && parcels.length > 0) {
        // Use local DB geometry
        const p = parcels[0];
        feature = {
          id: p.id,
          type: 'Feature',
          geometry: p.geojson,
          properties: {
            owner_user: p.owner_name || '',
            owner_username: p.owner_name || '',
            parcel_ref: p.parcel_number,
            centroid: p.centroid || { type: 'Point', coordinates: [0, 0] },
            area_m2: p.area || 0,
            status: p.status || 'active',
            ...p,
          },
        };
      } else {
        // fallback to backend
        const axios = (await import('axios')).default;
        const { authService } = await import('@/lib/auth');
        const token = await authService.getValidAccessToken();
        if (!token) {
          toast.error('Please log in to search parcels');
          return;
        }
        const response = await axios.get(`http://127.0.0.1:8080/api/parcels/geojson/?search=${encodeURIComponent(parcelRef)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const geojson = response.data;
        if (!geojson.features || geojson.features.length === 0) {
          toast.error(`Parcel "${parcelRef}" not found`);
          return;
        }
        feature = geojson.features.find((f: any) => 
          f.properties.parcel_ref === parcelRef || 
          f.properties.owner_username?.toLowerCase().includes(parcelRef.toLowerCase())
        ) || geojson.features[0];
      }
      if (feature) {
        setSelectedParcel(feature);
        toast.success(`Parcel ${feature.properties.parcel_ref} - Owner: ${feature.properties.owner_username || 'Unknown'}`, {
          duration: 3000,
        });
      } else {
        toast.error('Could not determine parcel location');
      }
    } catch (error) {
      console.error('Error locating parcel:', error);
      toast.error('Failed to locate parcel');
    }
  };

  return (
    <MapContext.Provider
      value={{
        mapRef,
        zoomIn,
        zoomOut,
        resetZoom,
        isMapInView,
        setIsMapInView,
        showGrid,
        toggleGrid,
        triggerGridRedraw,
        showBaseMap,
        toggleBaseMap,
        isMapLocked,
        toggleMapLock,
        showParcels,
        toggleParcels,
        selectedParcel,
        setSelectedParcel,
        parcelFilters,
        setParcelFilters,
        locateParcel,
        highlightedParcels,
        setHighlightedParcels,
        clearHighlights,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within MapProvider');
  }
  return context;
};
