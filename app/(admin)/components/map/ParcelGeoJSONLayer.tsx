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

        // Fetch all parcels
        const parcelData = await parcelService.getAllParcels();

        if (!isMounted.current) return;

        console.log('📦 Parcel data received:', {
          type: parcelData?.type,
          featureCount: parcelData?.features?.length,
        });

        if (!parcelData?.features?.length) {
          toast.error('No parcels found', { id: loadingToast });
          loadingRef.current = false;
          return;
        }

        // Create GeoJSON layer
        geoJsonLayerRef.current = L.geoJSON(parcelData, {
          style: (feature) => {
            // Use ref for initial style to ensure consistency
            const isHighlighted = highlightedParcelsRef.current.includes(feature?.properties?.parcel_ref);
            return getParcelStyle(feature, isHighlighted);
          },
          onEachFeature: (feature, layer) => {
            // Handle click based on inspector mode
            layer.on('click', (e) => {
              if (showGrid && isOnSupportedRoute) {
                // In inspector mode, show details card
                L.DomEvent.stopPropagation(e);
                setSelectedParcel({
                  id: feature.id,
                  parcel_ref: feature.properties.parcel_ref,
                  owner_username: feature.properties.owner_username,
                  owner_id: feature.properties.owner_id,
                  area_m2: feature.properties.area_m2,
                  area_acres: feature.properties.area_acres,
                  status: feature.properties.status,
                  centroid: feature.properties.centroid,
                  is_paid_current_year: feature.properties.is_paid_current_year,
                  payment_status: feature.properties.payment_status,
                  paid_years: feature.properties.paid_years,
                  latest_payment_year: feature.properties.latest_payment_year,
                  custom_props: feature.properties.custom_props,
                });
              }
            });

            // Add popup using React component
            const popupNode = document.createElement('div');
            layer.bindPopup(popupNode, {
              maxWidth: 300,
              minWidth: 280,
              className: 'parcel-popup-clean',
              closeButton: true,
              autoPan: true,
              offset: [0, 0], // Bring popup closer to the point
            });

            layer.on('popupopen', () => {
              // Clear any pending unmount timeout
              if ((layer as any)._popupTimeout) {
                clearTimeout((layer as any)._popupTimeout);
                (layer as any)._popupTimeout = null;
              }

              let root = (layer as any)._popupRoot;
              if (!root) {
                root = createRoot(popupNode);
                (layer as any)._popupRoot = root;
              }
              root.render(<ParcelPopup properties={feature.properties} />);
            });

            layer.on('popupclose', () => {
              if ((layer as any)._popupRoot) {
                // Delay unmount to allow for animations, but store timeout ID
                (layer as any)._popupTimeout = setTimeout(() => {
                  if ((layer as any)._popupRoot) {
                    (layer as any)._popupRoot.unmount();
                    (layer as any)._popupRoot = null;
                  }
                  (layer as any)._popupTimeout = null;
                }, 300);
              }
            });

            // Add tooltip with parcel reference
            layer.bindTooltip(feature.properties.parcel_ref || 'Unknown', {
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
