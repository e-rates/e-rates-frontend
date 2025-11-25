'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from 'next-themes';

// Define types
interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    parcel_ref?: string;
    area_m2?: number;
    location?: string;
    owner_username?: string;
    [key: string]: unknown;
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface UserMapClientProps {
  geojsonData: GeoJSONData | null;
}

function MapController({ geojsonData }: { geojsonData: GeoJSONData | null }) {
  const map = useMap();

  useEffect(() => {
    if (geojsonData && geojsonData.features && geojsonData.features.length > 0) {
      const geojsonLayer = L.geoJSON(geojsonData as never);
      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [geojsonData, map]);

  return null;
}

export default function UserMapClient({ geojsonData }: UserMapClientProps) {
  const defaultCenter: [number, number] = [-0.5, 37.0];
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  // Dark mode tiles
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  // Light mode tiles
  const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer
          url={isDark ? darkTileUrl : lightTileUrl}
        />
        
        {geojsonData && geojsonData.features && geojsonData.features.length > 0 && (
          <>
            <GeoJSON
              data={geojsonData as never}
              style={{
                fillColor: '#3b82f6',
                fillOpacity: 0.4,
                color: '#2563eb',
                weight: 2,
              }}
              onEachFeature={(feature, layer) => {
                const props = feature.properties || {};
                const parcelRef = props.parcel_ref || 'Unknown';
                const area = props.area_m2 ? `${(props.area_m2 / 4046.86).toFixed(2)} acres` : 'N/A';
                
                layer.bindPopup(`
                  <div style="padding: 8px;">
                    <h3 style="font-weight: bold; margin-bottom: 4px;">Parcel ${parcelRef}</h3>
                    <p style="margin: 0; font-size: 14px;">Area: ${area}</p>
                    ${props.location ? `<p style="margin: 0; font-size: 14px;">Location: ${props.location}</p>` : ''}
                  </div>
                `);
              }}
            />
            <MapController geojsonData={geojsonData} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
