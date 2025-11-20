'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useMap } from 'react-leaflet';
import toast from 'react-hot-toast';
import { useMapContext } from '../../context/MapContext';
import { usePathname } from 'next/navigation';
import { ParcelDetailsCard } from './ParcelDetailsCard';

// Enhanced popup content with all relevant parcel information
function createPopupContent(properties: any): string {
  const statusColors: Record<string, string> = {
    active: '#007AFF',
    inactive: '#FF3B30',
    pending: '#FF9500',
  };

  const status = properties.status?.toLowerCase() || 'active';
  const statusColor = statusColors[status] || '#007AFF';

  // Payment status styling
  const paymentStatusColors: Record<string, string> = {
    paid: '#34C759', // Green
    unpaid: '#FF3B30', // Red
    partial: '#FF9500', // Orange
  };

  const paymentStatus = properties.payment_status || 'unpaid';
  const paymentStatusColor = paymentStatusColors[paymentStatus] || '#FF3B30';
  const isPaidCurrentYear = properties.is_paid_current_year || false;
  const paidYears = properties.paid_years || [];
  const latestPaymentYear = properties.latest_payment_year;

  // Calculate area in acres
  const areaAcres =
    properties.area_acres ||
    (properties.area_m2 ? (properties.area_m2 / 4046.86).toFixed(2) : '0.00');

  // Get custom properties
  const customProps = properties.custom_props || properties.props || {};

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; min-width: 100px; max-width: 200px;">
      <!-- Status Badge -->
      <div style="background: ${statusColor}; color: white; padding: 6px 12px; text-align: center; font-weight: 600; font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase; margin: -10px -10px 10px -10px; border-radius: 8px 8px 0 0;">
        ${status}
      </div>
      
      <!-- Parcel Reference -->
      <div style="margin-bottom: 8px;">
        <div style="font-size: 17px; font-weight: 600; color: #000; margin-bottom: 2px;">${properties.parcel_ref || 'Unknown'}</div>
        <div style="font-size: 12px; color: #8E8E93;">${customProps.area_name || customProps.AREA_NAME || 'No area name'}</div>
      </div>
      
      <!-- Details Grid -->
      <div style="font-size: 13px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span style="color: #8E8E93;">Owner</span>
          <span style="color: #000; font-weight: 500;">${properties.owner_username || 'admin'}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span style="color: #8E8E93;">Plot No</span>
          <span style="color: #000; font-weight: 500;">${customProps.Parcel_No || customProps.PARCEL_NO || 'N/A'}</span>
        </div>
        
        <!-- Payment Status -->
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E5EA;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
            <span style="color: #8E8E93;">Payment Status</span>
            <span style="background: ${paymentStatusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${paymentStatus}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span style="color: #8E8E93;">2025 Paid</span>
            <span style="color: ${isPaidCurrentYear ? '#34C759' : '#FF3B30'}; font-weight: 600;">${isPaidCurrentYear ? '✓ Yes' : '✗ No'}</span>
          </div>
          ${
            latestPaymentYear
              ? `
          <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span style="color: #8E8E93;">Latest Payment</span>
            <span style="color: #000; font-weight: 500;">${latestPaymentYear}</span>
          </div>
          `
              : ''
          }
          ${
            paidYears.length > 0
              ? `
          <div style="margin-top: 4px; padding: 4px 6px; background: #F2F2F7; border-radius: 4px;">
            <div style="font-size: 9px; color: #8E8E93; font-weight: 600; margin-bottom: 2px;">PAID YEARS</div>
            <div style="font-size: 11px; color: #000; font-weight: 500;">${paidYears.join(', ')}</div>
          </div>
          `
              : ''
          }
        </div>
        
        <!-- Area -->
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E5EA;">
          <div style="display: flex; justify-content: space-between; padding: 2px 0;">
            <span style="color: #8E8E93;">Area (m²)</span>
            <span style="color: #000; font-weight: 600;">${(properties.area_m2 || 0).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 2px 0;">
            <span style="color: #8E8E93;">Area (acres)</span>
            <span style="color: #000; font-weight: 600;">${areaAcres}</span>
          </div>
        </div>
        
        ${
          properties.centroid
            ? `
        <div style="margin-top: 6px; padding: 4px 6px; background: #F2F2F7; border-radius: 4px;">
          <div style="font-size: 9px; color: #8E8E93; font-weight: 600; margin-bottom: 1px;">CENTROID</div>
          <div style="font-size: 10px; color: #000; font-family: 'SF Mono', monospace;">${properties.centroid.lat?.toFixed(6)}, ${properties.centroid.lng?.toFixed(6)}</div>
        </div>
        `
            : ''
        }
      </div>
    </div>
  `;
}

export function ParcelGeoJSONLayer() {
  const map = useMap();
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const loadingRef = useRef(false);
  const { showGrid, selectedParcel, setSelectedParcel, highlightedParcels } = useMapContext();
  const pathname = usePathname();

  // Flash effect: highlight selected parcel with react-spring
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!selectedParcel || !geoJsonLayerRef.current) return;
    let flashLayer = null;
    geoJsonLayerRef.current.eachLayer((layer) => {
      // @ts-ignore
      if (layer.feature && (layer.feature.properties.parcel_ref === selectedParcel.properties?.parcel_ref)) {
        flashLayer = layer;
      }
    });
    if (flashLayer) {
      setFlash(true);
      flashLayer.setStyle({
        color: '#FFD600',
        fillColor: '#FFD600',
        weight: 5,
        fillOpacity: 0.9,
        opacity: 1,
      });
      setTimeout(() => {
        if (geoJsonLayerRef.current && flashLayer) {
          geoJsonLayerRef.current.resetStyle(flashLayer);
        }
        setFlash(false);
        setSelectedParcel(null);
      }, 1200);
    }
  }, [selectedParcel, setSelectedParcel]);

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

        console.log('📦 Parcel data received:', {
          type: parcelData?.type,
          featureCount: parcelData?.features?.length,
          firstFeature: parcelData?.features?.[0],
          crs: parcelData?.crs,
          firstCoordinate:
            parcelData?.features?.[0]?.geometry?.coordinates?.[0]?.[0]?.[0],
        });

        if (!parcelData?.features?.length) {
          toast.error('No parcels found', { id: loadingToast });
          loadingRef.current = false;
          return;
        }

        // Create GeoJSON layer
        geoJsonLayerRef.current = L.geoJSON(parcelData, {
          style: (feature) => {
            const status = feature?.properties?.status?.toLowerCase();
            const paymentStatus = feature?.properties?.payment_status;
            const isPaidCurrentYear = feature?.properties?.is_paid_current_year;
            const parcelRef = feature?.properties?.parcel_ref;

            // Highlight if in highlightedParcels
            if (highlightedParcels && highlightedParcels.includes(parcelRef)) {
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

            // Add popup (shown when not in inspector mode)
            const popupContent = createPopupContent(feature.properties);
            layer.bindPopup(popupContent, {
              maxWidth: 260,
              minWidth: 220,
              className: 'parcel-popup-clean',
              closeButton: true,
              autoPan: true,
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
        console.log('✅ GeoJSON layer added to map');

        // Fit map to parcels
        const bounds = geoJsonLayerRef.current.getBounds();
        console.log('🗺️ Parcel bounds:', bounds);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
          console.log('📍 Map fitted to parcel bounds');
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
  }, [map, showGrid, isOnSupportedRoute, highlightedParcels]);

  return null;
}
