'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { useMapContext } from '../../context/MapContext';
import { usePathname } from 'next/navigation';
import { parcelService } from '@/lib/parcelService';
import { createRoot } from 'react-dom/client';
import { ParcelPopup } from './ParcelPopup';

// Helper function for parcel styling
const getParcelStyle = (feature: any, isHighlighted: boolean) => {
  const properties = feature?.properties || {};
  const status = properties.status?.toLowerCase();
  const paymentStatus = properties.payment_status;
  const isPaidCurrentYear = properties.is_paid_current_year;

  if (isHighlighted) {
    return {
      fillColor: '#FFD600',
      fillOpacity: 0.9,
      color: '#FFD600',
      weight: 5,
      opacity: 1,
    };
  }

  let color = '#2bc76f'; // Default green for active & paid

  // Priority 1: Parcel status
  if (status === 'inactive') {
    color = '#8E8E93'; // Gray for inactive
  } else if (status === 'pending') {
    color = '#ffa726'; // Orange for pending
  }
  // Priority 2: Payment status (only for active parcels)
  else if (isPaidCurrentYear) {
    color = '#34C759'; // Green for paid current year
  } else if (paymentStatus === 'partial') {
    color = '#FF9500'; // Orange for partial payment
  } else if (paymentStatus === 'unpaid' || !isPaidCurrentYear) {
    color = '#FF3B30'; // Red for unpaid
  }

  return {
    fillColor: color,
    fillOpacity: 0.6,
    color: color,
    weight: 2,
    opacity: 0.8,
  };
};

export function ParcelGeoJSONLayer() {
  const map = useMap();
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const loadingRef = useRef(false);
  const { showGrid, selectedParcel, setSelectedParcel, highlightedParcels } = useMapContext();
  const pathname = usePathname();

  // Keep a ref of highlighted parcels to avoid stale closures in the style function
  const highlightedParcelsRef = useRef(highlightedParcels);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Persistent highlighting: zoom to selected parcel and keep it highlighted
  useEffect(() => {
    if (!selectedParcel || !geoJsonLayerRef.current) return;

    const parcelRef = selectedParcel.properties?.parcel_ref || selectedParcel.parcel_ref;
    if (!parcelRef) return;

    // Find the layer for this parcel
    let targetLayer: any = null;
    geoJsonLayerRef.current.eachLayer((layer: any) => {
      if (layer.feature && layer.feature.properties.parcel_ref === parcelRef) {
        targetLayer = layer;
      }
    });

    if (targetLayer) {
      // Zoom to the parcel with reasonable zoom level
      const bounds = targetLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15, animate: true, duration: 0.5 });
      }
    }
  }, [selectedParcel, map]);

  // Update styles when highlightedParcels change
  useEffect(() => {
    // Update ref immediately
    highlightedParcelsRef.current = highlightedParcels;

    if (!geoJsonLayerRef.current) {
      return;
    }

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      if (layer.feature) {
        const parcelRef = layer.feature.properties.parcel_ref;
        const isHighlighted = highlightedParcels.includes(parcelRef);

        // Explicitly set style based on current state
        const style = getParcelStyle(layer.feature, isHighlighted);
        layer.setStyle(style);
      }
    });
  }, [highlightedParcels]);

  // Check if we're on home or parcels-map routes
  const isOnSupportedRoute =
    pathname?.includes('/home') || pathname?.includes('/parcels-map');

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

        // Fetch parcels (no filters needed - locateParcel handles zoom)
        const parcelData = await parcelService.getAllParcels();

        if (!isMounted.current) return;

        console.log('📦 Parcel data received:', {
          type: parcelData?.type,
          featureCount: parcelData?.features?.length,
        });

        // Validate coordinate ranges for first parcel
        if (parcelData?.features?.length > 0) {
          const firstCoords = parcelData.features[0].geometry?.coordinates;
          if (firstCoords && firstCoords[0]) {
            const samplePoint = firstCoords[0][0];
            console.log('🔍 Coordinate validation:', {
              samplePoint,
              looksLikeLatLng: samplePoint && 
                             Math.abs(samplePoint[0]) <= 180 && 
                             Math.abs(samplePoint[1]) <= 90,
              looksLikeWebMercator: samplePoint && 
                                   (Math.abs(samplePoint[0]) > 180 || 
                                    Math.abs(samplePoint[1]) > 90),
              coordinateOrder: samplePoint ? 
                             `[${samplePoint[0].toFixed(2)}, ${samplePoint[1].toFixed(2)}]` : 
                             'N/A'
            });
          }
        }

        if (!parcelData?.features?.length) {
          toast.error('No parcels found', { id: loadingToast });
          loadingRef.current = false;
          return;
        }

        // Create GeoJSON layer
        geoJsonLayerRef.current = L.geoJSON(parcelData, {
          coordsToLatLng: (coords) => {
            // Handle coordinate conversion - ensure [lng, lat] -> [lat, lng]
            return L.latLng(coords[1], coords[0]);
          },
          style: (feature) => {
            // Use ref for initial style to ensure consistency
            const isHighlighted = highlightedParcelsRef.current.includes(feature?.properties?.parcel_ref);
            return getParcelStyle(feature, isHighlighted);
          },
          onEachFeature: (feature, layer) => {
            // Handle click - always show details card (inspector logic)
            layer.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              const props = feature.properties || {};
              
              // Extract area - backend sends area_m2, local DB has area
              const area_m2 = props.area_m2 || props.area || 0;
              
              setSelectedParcel({
                id: feature.id,
                parcel_ref: props.parcel_ref || props.parcel_number || 'Unknown',
                owner_username: props.owner_username || props.owner_name || 'No owner',
                owner_id: props.owner_id || props.owner_user || '',
                area_m2: area_m2,
                area_acres: props.area_acres || (area_m2 / 4046.86),
                status: props.status || 'active',
                centroid: props.centroid || null,
                is_paid_current_year: props.is_paid_current_year || false,
                payment_status: props.payment_status || 'unpaid',
                paid_years: props.paid_years || [],
                latest_payment_year: props.latest_payment_year || null,
                custom_props: props.custom_props || props.props || props,
              });
            });

            // Don't add popup - inspector card only (per user preference)

            // Add tooltip with parcel reference
            const parcelRef = feature.properties.parcel_ref || 
                             feature.properties.parcel_number || 
                             feature.properties.props?.Parcel_No || 
                             feature.properties.props?.PARCEL_NO ||
                             'Unknown';
            layer.bindTooltip(parcelRef, {
              permanent: false,
              sticky: true,
              className: 'parcel-tooltip',
              direction: 'top',
              offset: [0, -10],
            });

            // Hover effects
            layer.on({
              click: (e) => {
                // Force popup to open at click location
                layer.openPopup(e.latlng);
                // Close tooltip to avoid clutter
                layer.closeTooltip();
              },
              mouseover: (e) => {
                const target = e.target;
                // Only apply hover effect if NOT highlighted
                const isHighlighted = highlightedParcelsRef.current.includes(feature.properties.parcel_ref);

                if (!isHighlighted) {
                  target.setStyle({
                    fillOpacity: 0.8,
                    weight: 3,
                  });
                  target.bringToFront();
                }
              },
              mouseout: (e) => {
                // Explicitly restore style using our helper, avoiding resetStyle reliance
                const isHighlighted = highlightedParcelsRef.current.includes(feature.properties.parcel_ref);
                const style = getParcelStyle(feature, isHighlighted);
                e.target.setStyle(style);
              },
            });
          },
        });

        if (!isMounted.current) return;

        // Add to map
        geoJsonLayerRef.current.addTo(map);
        console.log('✅ GeoJSON layer added to map');

        // Fit map to parcels
        const bounds = geoJsonLayerRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Wait for rendering to complete
        setTimeout(() => {
          if (isMounted.current) {
            loadingRef.current = false;
            toast.success(`Loaded ${parcelData.features.length} parcels`, {
              id: loadingToast,
            });
          }
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
  }, [map, showGrid, isOnSupportedRoute]);

  return null;
}
