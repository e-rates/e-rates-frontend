'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import { Map as LeafletMap } from 'leaflet';

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
}

const MapContext = createContext<MapContextType | null>(null);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const [isMapInView, setIsMapInView] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [gridRedrawTrigger, setGridRedrawTrigger] = useState(0);
  const [showBaseMap, setShowBaseMap] = useState(true);
  const [isMapLocked, setIsMapLocked] = useState(false);

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

  const triggerGridRedraw = () => {
    setGridRedrawTrigger((prev) => prev + 1);
  };

  const toggleBaseMap = () => {
    setShowBaseMap((prev) => !prev);
  };

  const toggleMapLock = () => {
    setIsMapLocked((prev) => !prev);
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
