'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { useMapContext } from '../../context/MapContext';
import { usePathname } from 'next/navigation';
import { cachedParcels, getParcels, parcelsSignature } from '@/lib/parcelCache';
import { paymentStatusOf, subscribePaymentStatuses, watchPaymentStatuses } from '@/lib/paymentStatuses';

export const PAYMENT_COLORS: Record<string, { color: string; edge: string; label: string }> = {
  paid: { color: '#34c759', edge: '#248a3d', label: 'Paid' },
  processing: { color: '#007aff', edge: '#0040dd', label: 'Confirming' },
  unpaid: { color: '#ff6961', edge: '#d70015', label: 'Unpaid' },
  overdue: { color: '#ff3b30', edge: '#a50011', label: 'Overdue' },
  not_billed: { color: '#aeaeb2', edge: '#636366', label: 'No bill' },
};

const INACTIVE = { color: '#d4d4d4', edge: '#a3a3a3', label: 'Inactive' };

/** Selected and highlighted parcels keep their payment colour, deepened, so state stays readable. */
const getParcelStyle = (
  feature: any,
  isHighlighted: boolean,
  isSelected = false,
  paymentStatus?: string
) => {
  const inactive = feature?.properties?.status?.toLowerCase() === 'inactive';
  const { color, edge } = inactive ? INACTIVE : PAYMENT_COLORS[paymentStatus ?? 'not_billed'];
  if (isHighlighted) {
    return { fillColor: color, fillOpacity: 0.95, color: edge, weight: 4, opacity: 1 };
  }
  if (isSelected) {
    return { fillColor: color, fillOpacity: 0.85, color: edge, weight: 3, opacity: 1, dashArray: '4 3' };
  }
  return { fillColor: color, fillOpacity: 0.55, color, weight: 1.5, opacity: 0.9 };
};

const PARCELS_TOAST_ID = 'parcels-loading';

export function ParcelGeoJSONLayer() {
  const map = useMap();
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { showGrid, selectedParcel, setSelectedParcel, highlightedParcels } = useMapContext();
  const pathname = usePathname();

  // Keep a ref of highlighted parcels to avoid stale closures in the style function
  const highlightedParcelsRef = useRef(highlightedParcels);
  const selectedRefRef = useRef<string | null>(null);
  const parcelClickRef = useRef(false);
  const statusOf = (ref: string) => paymentStatusOf(ref);

  const restyle = () => {
    geoJsonLayerRef.current?.eachLayer((layer: any) => {
      if (!layer.feature) return;
      const ref = layer.feature.properties.parcel_ref;
      layer.setStyle(
        getParcelStyle(
          layer.feature,
          highlightedParcelsRef.current.includes(ref),
          ref === selectedRefRef.current,
          statusOf(ref)
        )
      );
    });
  };

  useEffect(() => {
    const deselect = () => {
      if (parcelClickRef.current) {
        parcelClickRef.current = false;
        return;
      }
      setSelectedParcel(null);
    };
    map.on('click', deselect);
    return () => {
      map.off('click', deselect);
    };
  }, [map, setSelectedParcel]);
  useEffect(() => () => {
    toast.dismiss(PARCELS_TOAST_ID);
  }, []);

  // Persistent highlighting: zoom to selected parcel and keep it highlighted
  useEffect(() => {
    const parcelRef =
      selectedParcel?.properties?.parcel_ref || selectedParcel?.parcel_ref || null;
    selectedRefRef.current = parcelRef;
    restyle();
    if (!parcelRef || !geoJsonLayerRef.current || selectedParcel?.source === 'map') return;

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

    restyle();
  }, [highlightedParcels]);

  useEffect(() => {
    watchPaymentStatuses();
    return subscribePaymentStatuses(restyle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if we're on home or parcels-map routes
  const isOnSupportedRoute =
    pathname?.includes('/home') || pathname?.includes('/parcels-map');

  useEffect(() => {
    let cancelled = false;

    const buildLayer = (parcelData: any, fitToBounds: boolean) => {
        geoJsonLayerRef.current = L.geoJSON(parcelData, {
          style: (feature) => {
            // Use ref for initial style to ensure consistency
            const ref = feature?.properties?.parcel_ref;
            return getParcelStyle(
              feature,
              highlightedParcelsRef.current.includes(ref),
              ref === selectedRefRef.current,
              statusOf(ref)
            );
          },
          onEachFeature: (feature, layer) => {
            const ref = feature.properties.parcel_ref;

            layer.bindTooltip(() => {
              const status = PAYMENT_COLORS[statusOf(ref) ?? 'not_billed'];
              return `${ref || 'Unknown'} · ${status.label}`;
            }, {
              permanent: false,
              sticky: true,
              className: 'parcel-tooltip',
              direction: 'top',
              offset: [0, -10],
            });

            layer.on({
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                parcelClickRef.current = true;
                setTimeout(() => {
                  parcelClickRef.current = false;
                }, 0);
                layer.closeTooltip();
                (layer as L.Path).bringToFront();
                setSelectedParcel({
                  ...feature.properties,
                  id: feature.id,
                  source: 'map',
                });
              },
              mouseover: (e) => {
                const isEmphasised =
                  highlightedParcelsRef.current.includes(ref) ||
                  ref === selectedRefRef.current;
                if (!isEmphasised) {
                  e.target.setStyle({ fillOpacity: 0.8, weight: 3 });
                }
              },
              mouseout: (e) => {
                e.target.setStyle(
                  getParcelStyle(
                    feature,
                    highlightedParcelsRef.current.includes(ref),
                    ref === selectedRefRef.current,
                    statusOf(ref)
                  )
                );
              },
            });
          },
        });

        geoJsonLayerRef.current.addTo(map);

        if (fitToBounds) {
          const bounds = geoJsonLayerRef.current.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
    };

    const loadParcels = async () => {
      const cached = cachedParcels();
      if (cached) buildLayer(cached, false);
      else toast.loading('Loading parcels...', { id: PARCELS_TOAST_ID });
      try {
        const parcelData = await getParcels();
        if (cancelled) return;

        if (!parcelData?.features?.length) {
          if (!cached) toast.error('No parcels found', { id: PARCELS_TOAST_ID });
          return;
        }
        if (cached && parcelsSignature(cached) === parcelsSignature(parcelData)) return;

        if (geoJsonLayerRef.current) map.removeLayer(geoJsonLayerRef.current);
        buildLayer(parcelData, !cached);
        if (!cached) toast.dismiss(PARCELS_TOAST_ID);
      } catch (error) {
        console.error('Error loading parcels:', error);
        if (!cancelled && !cached) {
          toast.error('Failed to load parcels', { id: PARCELS_TOAST_ID });
        }
      }
    };

    loadParcels();

    return () => {
      cancelled = true;
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
    };
  }, [map]);

  return null;
}
