'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import shp from 'shpjs';

interface ParcelLayerProps {
  shapefileUrl: string; // URL to your shapefile zip
}

// Generate color based on payment status (simulated)
function getParcelColor(isPaid: boolean): string {
  // Paid parcels - Green
  if (isPaid) {
    return '#2bc76f';
  }

  // Unpaid parcels - Red
  return '#ff4757';
}

// Format popup content with better organization
function createPopupContent(properties: any, isPaid: boolean): string {
  let content = '<div class="p-2" style="min-width: 200px;">';

  // Payment status badge
  const statusColor = isPaid ? '#2bc76f' : '#ff4757';
  const statusText = isPaid ? 'PAID' : 'UNPAID';
  content += `
    <div class="mb-2 px-2 py-1 rounded" style="background: ${statusColor}; color: white; font-weight: bold; text-align: center; font-size: 11px;">
      ${statusText}
    </div>
  `;

  content += '<div style="font-size: 11px;">';

  // Only show fields that have actual values
  Object.entries(properties).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      content += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 2px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 500; color: #666;">${key}:</span>
          <span style="color: #000; margin-left: 10px;">${value}</span>
        </div>
      `;
    }
  });

  content += '</div></div>';
  return content;
}

export function ParcelLayer({ shapefileUrl }: ParcelLayerProps) {
  const map = useMap();
  const [parcelCount, setParcelCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let geoJsonLayer: L.GeoJSON | null = null;
    let legendControl: L.Control | null = null;
    let errorControl: L.Control | null = null;

    const loadParcels = async () => {
      try {
        setError(null);
        // Load the shapefile and convert to GeoJSON
        const geojson = await shp(shapefileUrl);

        // Count parcels
        const count = geojson.features?.length || 0;
        setParcelCount(count);

        // Simulate payment status (randomly mark ~30% as unpaid for demo)
        let paidCount = 0;
        let unpaidCount = 0;

        // Create a GeoJSON layer with enhanced styling
        geoJsonLayer = L.geoJSON(geojson, {
          style: (feature) => {
            // Simulate payment status - 70% paid, 30% unpaid
            const isPaid = Math.random() > 0.3;
            if (isPaid) paidCount++;
            else unpaidCount++;

            const color = getParcelColor(isPaid);
            return {
              fillColor: color,
              fillOpacity: 0.5,
              color: color,
              weight: 1.5,
              opacity: 0.8,
            };
          },
          onEachFeature: (feature, layer) => {
            // Simulate same payment status for popup
            const isPaid = Math.random() > 0.3;

            // Add enhanced popup
            if (feature.properties) {
              const popupContent = createPopupContent(
                feature.properties,
                isPaid
              );
              layer.bindPopup(popupContent, {
                maxWidth: 250,
                minWidth: 200,
                className: 'custom-popup',
              });
            }

            // Add tooltip with parcel ID on hover
            const parcelId =
              feature.properties?.PARCEL_ID ||
              feature.properties?.parcel_id ||
              feature.properties?.ID ||
              feature.properties?.id ||
              'Unknown';

            layer.bindTooltip(`Parcel: ${parcelId}`, {
              permanent: false,
              sticky: true,
              className: 'parcel-tooltip',
            });

            // Enhanced hover effects
            layer.on({
              mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                  fillOpacity: 0.7,
                  weight: 3,
                  color: '#ffffff',
                });
                target.bringToFront();
              },
              mouseout: (e) => {
                if (geoJsonLayer) {
                  geoJsonLayer.resetStyle(e.target);
                }
              },
              click: (e) => {
                map.fitBounds(e.target.getBounds(), {
                  padding: [50, 50],
                  maxZoom: 18,
                });
              },
            });
          },
        });

        // Add layer to map
        geoJsonLayer.addTo(map);

        // Remove any existing legends first
        const existingLegends = document.querySelectorAll('.info.legend');
        existingLegends.forEach((legend) => legend.remove());

        // Add legend
        const Legend = L.Control.extend({
          options: { position: 'bottomright' },
          onAdd: function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.cssText = `
              background: white;
              padding: 10px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-size: 12px;
            `;

            div.innerHTML = `
              <div style="font-weight: bold; margin-bottom: 8px;">Payment Status</div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 20px; height: 15px; background: #2bc76f; margin-right: 8px; border: 1px solid #999;"></div>
                <span>Paid</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 20px; height: 15px; background: #ff4757; margin-right: 8px; border: 1px solid #999;"></div>
                <span>Unpaid</span>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd; font-weight: bold;">
                Total Parcels: ${count}
              </div>
            `;
            return div;
          },
        });

        legendControl = new Legend();
        legendControl.addTo(map);

        // Fit map to show all parcels
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error('Error loading shapefile:', error);

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);

        // Show error on map
        const ErrorControl = L.Control.extend({
          options: { position: 'topright' },
          onAdd: function () {
            const div = L.DomUtil.create('div', 'info error-message');
            div.style.cssText = `
              background: #fee;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              font-size: 13px;
              max-width: 300px;
              border-left: 4px solid #f44;
            `;

            div.innerHTML = `
              <div style="font-weight: bold; color: #c00; margin-bottom: 8px;">
                ⚠️ Error Loading Parcels
              </div>
              <div style="color: #666; font-size: 12px; margin-bottom: 8px;">
                ${
                  errorMessage.includes('404') ||
                  errorMessage.includes('Not Found')
                    ? 'The shapefile was not found. Please ensure the file exists at:'
                    : 'Failed to load shapefile:'
                }
              </div>
              <div style="font-family: monospace; font-size: 11px; background: #fff; padding: 6px; border-radius: 4px; word-break: break-all;">
                ${shapefileUrl}
              </div>
              <div style="color: #888; font-size: 11px; margin-top: 8px;">
                Expected location: <code>public${shapefileUrl}</code>
              </div>
            `;
            return div;
          },
        });

        errorControl = new ErrorControl();
        errorControl.addTo(map);
      }
    };

    loadParcels();

    // Cleanup on unmount
    return () => {
      if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
      }
      if (legendControl) {
        map.removeControl(legendControl);
      }
      if (errorControl) {
        map.removeControl(errorControl);
      }
    };
  }, [map, shapefileUrl]);

  return null;
}
