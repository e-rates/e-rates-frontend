'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from 'next-themes';
import { ParcelLayer } from '@/app/(admin)/components/map/ParcelLayer';
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
      map.scrollWheelZoom.enable(); // Keep scroll zoom enabled
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      // Enable all interactions
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [isLocked, map]);

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
        <div className="absolute top-4 right-4 z-1000 flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
          <GlobeLock size={16} />
          <span>Map Locked</span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="border-default z-0 bg-rose-300"
      >
        {showBaseMap && (
          <TileLayer
            key={`base-${theme}`}
            attribution={attribution}
            url={tileUrl}
          />
        )}

        <GridOverlay visible={showGrid} />
        <MapLockHandler isLocked={isMapLocked} />
        <LocationMarker position={userLocation} />
      </MapContainer>
    </div>
  );
};

export default Map;
