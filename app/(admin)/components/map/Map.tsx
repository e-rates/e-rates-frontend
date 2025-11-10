'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from 'next-themes';
import { ParcelGeoJSONLayer } from '@/app/(admin)/components/map/ParcelGeoJSONLayer';
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

  useEffect(() => {
    if (map) {
      mapRef.current = map;
      setIsMapInView(true);

      const handleResize = () => {
        map.invalidateSize();

        setTimeout(() => {
          map.invalidateSize();
        }, 50);

        setTimeout(() => {
          map.invalidateSize();
        }, 400);
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
    if (position) {
      map.flyTo(position, 15, {
        duration: 2,
      });
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker position={position}>
      <Popup>
        <div className="text-sm">
          <strong>Your Location</strong>
          <p>Latitude: {position[0].toFixed(4)}</p>
          <p>Longitude: {position[1].toFixed(4)}</p>
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

  // Default center - Harare, Zimbabwe coordinates
  const defaultCenter: [number, number] = [-17.8252, 31.0335];
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string>('');
  const hasShownToast = useRef(false);

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

  return (
    <div className="relative h-full w-full">
      {locationError && (
        <div className="absolute top-4 left-4 z-1000 rounded-lg bg-yellow-100 p-3 text-sm text-yellow-800 shadow-lg">
          <strong>Location Access:</strong> {locationError}
          <br />
          <span className="text-xs">Using default location instead</span>
        </div>
      )}

      {isMapLocked && (
        <div className="absolute top-20 right-4 z-1000 flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
          <GlobeLock size={16} />
          <span>Map Locked</span>
        </div>
      )}

      <MapContainer
        center={savedState?.center || defaultCenter}
        zoom={savedState?.zoom || 13}
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

        <ParcelGeoJSONLayer />
        <MapLockHandler isLocked={isMapLocked} />
        <LocationMarker position={userLocation} />
        <MapStateHandler />
      </MapContainer>
    </div>
  );
};

export default Map;
