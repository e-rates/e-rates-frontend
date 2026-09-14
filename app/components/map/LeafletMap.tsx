'use client';

import 'leaflet/dist/leaflet.css';
import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { GeoJSON, LayersControl, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { RateParcelCollection, RateParcelFeature, RateStatus, rateStatusMeta } from '@/lib/rates';

const NAIROBI: L.LatLngTuple = [-1.2921, 36.8219];

interface LeafletMapProps {
  parcelData?: RateParcelCollection | null;
  isLoading?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  visible?: boolean;
}

function boundsOf(target: unknown): L.LatLngBounds | null {
  const bounds = L.geoJSON(target as never).getBounds();
  return bounds.isValid() ? bounds : null;
}

function FitToParcels({
  data,
  selectedId,
  visible,
}: {
  data?: RateParcelCollection | null;
  selectedId?: string | null;
  visible: boolean;
}) {
  const map = useMap();
  const parcelKey = data?.features.map((f) => f.id).join(',') ?? '';
  const lastSelected = useRef(selectedId);

  useEffect(() => {
    if (visible) map.invalidateSize({ animate: false });
  }, [map, visible]);

  useEffect(() => {
    const target = data?.features.find((f) => f.id === selectedId) ?? (data?.features.length ? data : null);
    const bounds = target && boundsOf(target);
    if (bounds) map.fitBounds(bounds, { padding: [32, 32], maxZoom: 18, animate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, parcelKey]);

  useEffect(() => {
    if (lastSelected.current === selectedId) return;
    lastSelected.current = selectedId;
    const target = data?.features.find((f) => f.id === selectedId) ?? data;
    const bounds = target && boundsOf(target);
    if (bounds) map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 18, duration: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedId]);

  return null;
}

function Legend({ statuses }: { statuses: RateStatus[] }) {
  if (!statuses.length) return null;
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-x-3 gap-y-1 bg-white/90 px-3 py-2 text-xs shadow-md backdrop-blur dark:bg-neutral-900/90">
      {statuses.map((status) => (
        <span key={status} className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-200">
          <span className="h-2.5 w-2.5" style={{ backgroundColor: rateStatusMeta[status].color }} />
          {rateStatusMeta[status].label}
        </span>
      ))}
    </div>
  );
}

const LeafletMap: React.FC<LeafletMapProps> = ({ parcelData, isLoading = false, selectedId, onSelect, visible = true }) => {
  const statuses = useMemo(
    () => [...new Set(parcelData?.features.map((f) => f.properties.payment_status) ?? [])],
    [parcelData]
  );

  const styleFor = (feature?: unknown) => {
    const parcel = feature as RateParcelFeature | undefined;
    const color = rateStatusMeta[parcel?.properties.payment_status ?? 'not_billed'].color;
    const selected = parcel?.id === selectedId;
    return { color, weight: selected ? 4 : 2, opacity: 1, fillColor: color, fillOpacity: selected ? 0.45 : 0.3 };
  };

  return (
    <div className="absolute inset-0 h-full w-full">
      <MapContainer center={NAIROBI} zoom={12} scrollWheelZoom className="square-map h-full w-full">
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked name="Satellite">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {!!parcelData?.features.length && (
          <GeoJSON
            key={`${parcelData.year}-${selectedId}-${parcelData.features.map((f) => f.properties.payment_status).join()}`}
            data={parcelData as never}
            style={styleFor}
            onEachFeature={(feature, layer) => {
              const props = (feature as RateParcelFeature).properties;
              layer.bindTooltip(`Plot ${props.parcel_ref} · ${rateStatusMeta[props.payment_status].label}`, {
                sticky: true,
              });
              layer.on('click', () => onSelect?.((feature as RateParcelFeature).id));
            }}
          />
        )}
        <FitToParcels data={parcelData} selectedId={selectedId} visible={visible} />
      </MapContainer>

      <Legend statuses={statuses} />

      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60 text-sm text-neutral-600 dark:bg-neutral-900/60 dark:text-neutral-300">
          Loading map…
        </div>
      )}
      {!isLoading && !parcelData?.features.length && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 px-3 py-2 text-xs text-neutral-700 shadow-md dark:bg-neutral-900/90 dark:text-neutral-200">
          No plots allocated to you yet
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
