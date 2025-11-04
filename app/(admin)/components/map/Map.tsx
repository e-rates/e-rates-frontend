'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from 'next-themes';
import { ParcelLayer } from '@/app/(admin)/components/map/ParcelLayer';
import toast from 'react-hot-toast';
import { useMapContext } from '../../context/MapContext';

// Fix for default marker icons in Next.js
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

// Component to update map view when location changes
function LocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const { mapRef, setIsMapInView } = useMapContext();

  useEffect(() => {
    if (map) {
      mapRef.current = map;
      setIsMapInView(true);
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

const Map = () => {
  const { theme } = useTheme();
  // Default center - Harare, Zimbabwe coordinates
  const defaultCenter: [number, number] = [-17.8252, 31.0335];
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string>('');

  // Track if we've already shown the location toast to prevent duplicates
  const hasShownLocationToast = useRef(false);

  // Map tile URLs for light and dark themes
  const tileUrls = {
    light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  };

  const tileAttributions = {
    light:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    dark: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };

  const isDark = theme === 'dark';
  const tileUrl = isDark ? tileUrls.dark : tileUrls.light;
  const attribution = isDark ? tileAttributions.dark : tileAttributions.light;

  useEffect(() => {
    // Get user's current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);

          // Only show toast once, even in React Strict Mode
          if (!hasShownLocationToast.current) {
            toast.success('Location set successfully');
            hasShownLocationToast.current = true;
          }
        },
        (error) => {
          // Error is already displayed via locationError state
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

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="border-default z-0 bg-rose-300"
      >
        {/* Map tiles that change with theme */}
        <TileLayer
          key={`base-${theme}`} // Force re-render when theme changes
          attribution={attribution}
          url={tileUrl}
        />

        {/* Grid overlay */}

        {/* Load and display parcels from shapefile */}
        {/* <ParcelLayer shapefileUrl="/data/parcels.zip" /> */}

        {/* User location marker with auto-zoom */}
        <LocationMarker position={userLocation} />
      </MapContainer>
    </div>
  );
};

export default Map;
