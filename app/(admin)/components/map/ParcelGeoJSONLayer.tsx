'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { parcelService } from '@/lib/parcelService';
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

  // Calculate area in acres - support multiple field names
  const areaM2 = properties.area_m2 || properties.area || 0;
  const areaAcres =
    properties.area_acres ||
    (areaM2 ? (areaM2 / 4046.86).toFixed(2) : '0.00');

  // Get custom properties - support multiple structures
  const customProps = properties.custom_props || properties.props || properties || {};
  
  // Get parcel reference from multiple possible sources
  const parcelRef = properties.parcel_ref || 
                   properties.parcel_number || 
                   customProps.Parcel_No || 
                   customProps.PARCEL_NO ||
                   'Unknown';
  
  // Get owner from multiple possible sources
  const owner = properties.owner_username || 
               properties.owner_user || 
               properties.owner_name ||
               customProps.OWNER ||
               'admin';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; min-width: 100px; max-width: 200px;">
      <!-- Status Badge -->
      <div style="background: ${statusColor}; color: white; padding: 6px 12px; text-align: center; font-weight: 600; font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase; margin: -10px -10px 10px -10px; border-radius: 8px 8px 0 0;">
        ${status}
      </div>
      
      <!-- Parcel Reference -->
      <div style="margin-bottom: 8px;">
        <div style="font-size: 17px; font-weight: 600; color: #000; margin-bottom: 2px;">${parcelRef}</div>
        <div style="font-size: 12px; color: #8E8E93;">${customProps.area_name || customProps.AREA_NAME || customProps.zone || 'No area name'}</div>
      </div>
      
      <!-- Details Grid -->
      <div style="font-size: 13px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span style="color: #8E8E93;">Owner</span>
          <span style="color: #000; font-weight: 500;">${owner}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span style="color: #8E8E93;">Plot No</span>
          <span style="color: #000; font-weight: 500;">${customProps.Parcel_No || customProps.PARCEL_NO || customProps.parcel_no || parcelRef}</span>
        </div>
        
        <!-- Payment Status (only show if payment data exists) -->
        ${properties.payment_status || properties.is_paid_current_year !== undefined ? `
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
        ` : ''}
        
        <!-- Area -->
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E5EA;">
          <div style="display: flex; justify-content: space-between; padding: 2px 0;">
            <span style="color: #8E8E93;">Area (m²)</span>
            <span style="color: #000; font-weight: 600;">${areaM2.toLocaleString()}</span>
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
  const { showGrid, selectedParcel, setSelectedParcel, parcelFilters } = useMapContext();
  const pathname = usePathname();

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

        // Fetch parcels with filters applied
        const parcelData = await parcelService.getAllParcels(parcelFilters);

        console.log('📦 Parcel data received:', {
          type: parcelData?.type,
          featureCount: parcelData?.features?.length,
          firstFeature: parcelData?.features?.[0],
          firstFeatureProps: parcelData?.features?.[0]?.properties,
          firstGeometry: parcelData?.features?.[0]?.geometry,
          firstGeometryType: parcelData?.features?.[0]?.geometry?.type,
          crs: parcelData?.crs,
          firstCoordinate:
            parcelData?.features?.[0]?.geometry?.coordinates?.[0]?.[0]?.[0],
          sampleCoordinates: parcelData?.features?.[0]?.geometry?.coordinates?.[0]?.slice(0, 3),
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

        // Auto-select first parcel if search filter is active
        if (parcelFilters.search && parcelData.features.length > 0) {
          const firstFeature = parcelData.features[0];
          const props = firstFeature.properties || {};
          setSelectedParcel({
            id: firstFeature.id,
            parcel_ref: props.parcel_ref || props.parcel_number || 'Unknown',
            owner_username: props.owner_username || props.owner_user || props.owner_name || 'Unknown',
            owner_id: props.owner_id || props.owner_user || '',
            area_m2: props.area_m2 || props.area || 0,
            area_acres: props.area_acres || (props.area_m2 ? props.area_m2 / 4046.86 : 0),
            status: props.status || 'active',
            centroid: props.centroid || null,
            is_paid_current_year: props.is_paid_current_year || false,
            payment_status: props.payment_status || 'unpaid',
            paid_years: props.paid_years || [],
            latest_payment_year: props.latest_payment_year || null,
            custom_props: props.custom_props || props.props || props,
          });

          // Zoom to the selected parcel
          if (firstFeature.geometry) {
            const bounds = L.geoJSON(firstFeature).getBounds();
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
          }
        }

        // Create GeoJSON layer
        geoJsonLayerRef.current = L.geoJSON(parcelData, {
          coordsToLatLng: (coords) => {
            // Handle coordinate conversion - ensure [lng, lat] -> [lat, lng]
            return L.latLng(coords[1], coords[0]);
          },
          style: (feature) => {
            const status = feature?.properties?.status?.toLowerCase() || 'active';
            const paymentStatus = feature?.properties?.payment_status;
            const isPaidCurrentYear = feature?.properties?.is_paid_current_year;

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
            } else if (paymentStatus === 'unpaid' || isPaidCurrentYear === false) {
              color = '#FF3B30'; // Red for unpaid
            }
            // Default: Show all parcels in blue if no payment data
            else if (paymentStatus === undefined && isPaidCurrentYear === undefined) {
              color = '#007AFF'; // Blue for parcels without payment data
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
            // Handle click - always show details card (inspector logic)
            layer.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              const props = feature.properties || {};
              setSelectedParcel({
                id: feature.id,
                parcel_ref: props.parcel_ref || props.parcel_number || 'Unknown',
                owner_username: props.owner_username || props.owner_user || props.owner_name || 'Unknown',
                owner_id: props.owner_id || props.owner_user || '',
                area_m2: props.area_m2 || props.area || 0,
                area_acres: props.area_acres || (props.area_m2 ? props.area_m2 / 4046.86 : 0),
                status: props.status || 'active',
                centroid: props.centroid || null,
                is_paid_current_year: props.is_paid_current_year || false,
                payment_status: props.payment_status || 'unpaid',
                paid_years: props.paid_years || [],
                latest_payment_year: props.latest_payment_year || null,
                custom_props: props.custom_props || props.props || props,
              });
            });

            // Don't add popup - always use inspector card instead

            // Add tooltip with parcel reference
            const parcelRef = feature.properties.parcel_ref || 
                             feature.properties.parcel_number || 
                             feature.properties.props?.Parcel_No || 
                             feature.properties.props?.PARCEL_NO ||
                             'Unknown';
            layer.bindTooltip(parcelRef, {
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
        console.log('🗺️ Bounds details:', {
          isValid: bounds.isValid(),
          southWest: bounds.getSouthWest(),
          northEast: bounds.getNorthEast(),
          center: bounds.getCenter(),
        });
        
        if (bounds.isValid()) {
          try {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
            console.log('📍 Map fitted to parcel bounds');
          } catch (fitError) {
            console.error('❌ Error fitting bounds:', fitError);
            toast.error('Parcels loaded but map positioning failed');
          }
        } else {
          console.warn('⚠️ Invalid bounds - parcels may be outside visible area or have invalid coordinates');
          toast.error('Parcels loaded with invalid coordinates');
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
  }, [map, showGrid, isOnSupportedRoute, parcelFilters]);

  return null;
}
