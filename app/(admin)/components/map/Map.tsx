'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from 'next-themes';
import { ParcelGeoJSONLayer } from '@/app/(admin)/components/map/ParcelGeoJSONLayer';
import GridOverlay from '@/app/(admin)/components/map/GridOverlay';
import toast from 'react-hot-toast';
import { useMapContext } from '../../context/MapContext';
import { GlobeLock } from 'lucide-react';

// Leaflet icon fix for Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = icon;

function LocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const { mapRef, setIsMapInView } = useMapContext();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (map) {
      mapRef.current = map;
      setIsMapInView(true);

      const handleResize = () => {
        // Single invalidateSize call with animation disabled
        setTimeout(() => {
          map.invalidateSize({ animate: false, pan: false });
        }, 100);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        setIsMapInView(false);
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      setIsMapInView(false);
    };
  }, [map, mapRef, setIsMapInView]);

  useEffect(() => {
    if (position && !hasCenteredRef.current) {
      // Use setView instead of flyTo to avoid animation
      map.setView(position, 15, { animate: false });
      hasCenteredRef.current = true;
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker position={position}>
      <Popup>
        <div className="p-2">
          <p className="font-semibold">Your Location</p>
          <p className="text-xs text-gray-600">
            Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

function MapLockHandler({ isLocked }: { isLocked: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (isLocked) {
      // Disable dragging
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if ((map as any).tap) (map as any).tap.disable();
    } else {
      // Enable dragging
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if ((map as any).tap) (map as any).tap.enable();
    }
  }, [isLocked, map]);

  return null;
}

function MapStateHandler() {
  const map = useMap();

  useEffect(() => {
    const saveMapState = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();

      const mapState = {
        center: [center.lat, center.lng],
        zoom: zoom,
      };

      localStorage.setItem('mapState', JSON.stringify(mapState));
    };

    // Save state when map moves or zooms
    map.on('moveend', saveMapState);
    map.on('zoomend', saveMapState);

    // Cleanup listeners
    return () => {
      map.off('moveend', saveMapState);
      map.off('zoomend', saveMapState);
    };
  }, [map]);

  return null;
}

const Map = () => {
  const { theme } = useTheme();
  const { showGrid, showBaseMap, isMapLocked } = useMapContext();
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Add key to force remount if needed

  // Default center - Harare, Zimbabwe coordinates
  const defaultCenter: [number, number] = [-17.8252, 31.0335];
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string>('');
  const hasShownToast = useRef(false);

  // Ensure component is mounted before rendering map
  useEffect(() => {
    setIsMounted(true);

    // Cleanup: increment key to force new map instance on remount
    return () => {
      setMapKey((prev) => prev + 1);
    };
  }, []);

  // Load saved map state from localStorage
  const getSavedMapState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mapState');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved map state:', e);
        }
      }
    }
    return null;
  };

  const savedState = getSavedMapState();

  const mapTiles = {
    light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  };

  const tileAttributions = {
    light:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    dark: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };

  const isDark = theme === 'dark';
  const tileUrl = isDark ? mapTiles.dark : mapTiles.light;
  const attribution = isDark ? tileAttributions.dark : tileAttributions.light;

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);

          if (!hasShownToast.current) {
            toast.success('Location set successfully');
            hasShownToast.current = true;
          }
        },
        (error) => {
          setLocationError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }
  }, []);

  const center = userLocation || defaultCenter;
  const zoom = userLocation ? 15 : 13;

  // Don't render map until mounted (prevents SSR issues)
  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Location access popup removed as requested */}
      {isMapLocked && (
        <div className="squircle-lg absolute top-20 right-4 z-1000 flex items-center gap-2 bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
          <GlobeLock size={16} />
          <span>Map Locked</span>
        </div>
      )}

      <MapContainer
        key={`map-${mapKey}`}
        center={userLocation || savedState?.center || defaultCenter}
        zoom={userLocation ? 15 : savedState?.zoom || 13}
        className="h-full w-full"
        style={{ zIndex: 1 }}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump={true}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1.0}
        minZoom={2}
        maxZoom={20}
      >
        {showBaseMap && (
          <TileLayer
            key={`base-${theme}`}
            attribution={attribution}
            url={tileUrl}
          />
        )}

        {/* GridOverlay disabled - using Inspector mode instead */}
        {/* <GridOverlay visible={showGrid} /> */}
        <ParcelGeoJSONLayer />
        <MapLockHandler isLocked={isMapLocked} />
        <LocationMarker position={userLocation} />
        <MapStateHandler />
      </MapContainer>
    </div>
  );
};

export default Map;
