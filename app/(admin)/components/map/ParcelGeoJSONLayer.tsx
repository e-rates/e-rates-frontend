'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { parcelService } from '@/lib/parcelService';
import toast from 'react-hot-toast';

// Simple popup content without created/updated dates
function createPopupContent(properties: any): string {
  return `
    <div style="font-family: system-ui; min-width: 200px;">
      <div style="background: #2bc76f; color: white; padding: 4px 8px; text-align: center; font-weight: bold; margin-bottom: 8px; border-radius: 3px;">
        ${properties.status?.toUpperCase() || 'ACTIVE'}
      </div>
      
      <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
        ${properties.parcel_ref || 'Unknown Parcel'}
      </div>
      
      <div style="font-size: 12px; margin-bottom: 4px;">
        <strong>Area:</strong> ${properties.props?.area_name || 'Unknown'}
      </div>
      
      <div style="font-size: 12px; margin-bottom: 4px;">
        <strong>Owner:</strong> ${properties.owner_username || 'Unknown'}
      </div>
      
      <div style="font-size: 12px; margin-bottom: 4px;">
        <strong>Plot Number:</strong> ${properties.props?.Parcel_No || 'N/A'}
      </div>
      
      <div style="font-size: 12px;">
        <strong>Area (m²):</strong> ${properties.area_m2?.toLocaleString() || 'N/A'}
      </div>
    </div>
  `;
}

export function ParcelGeoJSONLayer() {
  const map = useMap();
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const loadParcels = async () => {
      // Prevent multiple simultaneous loads
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      const loadingToast = toast.loading('Loading parcels...');

      try {
        // Clean up existing layer
        if (geoJsonLayerRef.current) {
          map.removeLayer(geoJsonLayerRef.current);
        }

        // Fetch all parcels
        const parcelData = await parcelService.getAllParcels();

        if (!parcelData?.features?.length) {
          toast.error('No parcels found', { id: loadingToast });
          loadingRef.current = false;
          return;
        } // Create GeoJSON layer
        geoJsonLayerRef.current = L.geoJSON(parcelData, {
          style: (feature) => {
            const status = feature?.properties?.status?.toLowerCase();
            let color = '#2bc76f'; // Default green for active

            if (status === 'inactive') {
              color = '#ff6b6b'; // Red for inactive
            } else if (status === 'pending') {
              color = '#ffa726'; // Orange for pending
            }

            return {
              fillColor: color,
              fillOpacity: 0.6,
              color: color,
              weight: 2,
              opacity: 0.8,
            };
          },
          onEachFeature: (feature, layer) => {
            // Add popup
            const popupContent = createPopupContent(feature.properties);
            layer.bindPopup(popupContent, {
              maxWidth: 250,
              className: 'parcel-popup',
            });

            // Add tooltip with parcel reference
            layer.bindTooltip(feature.properties.parcel_ref || 'Unknown', {
              permanent: false,
              sticky: true,
            });

            // Hover effects
            layer.on({
              mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                  fillOpacity: 0.8,
                  weight: 3,
                });
                target.bringToFront();
              },
              mouseout: (e) => {
                if (geoJsonLayerRef.current) {
                  geoJsonLayerRef.current.resetStyle(e.target);
                }
              },
            });
          },
        });

        // Add to map
        geoJsonLayerRef.current.addTo(map);

        // Fit map to parcels
        const bounds = geoJsonLayerRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Wait for rendering to complete
        setTimeout(() => {
          loadingRef.current = false;
          toast.success(`Loaded ${parcelData.features.length} parcels`, {
            id: loadingToast,
          });
        }, 1000); // Give 1 second for rendering
      } catch (error) {
        console.error('Error loading parcels:', error);
        loadingRef.current = false;
        toast.error('Failed to load parcels', { id: loadingToast });
      }
    };

    loadParcels();

    // Cleanup on unmount
    return () => {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
      }
    };
  }, [map]);

  return null;
}
