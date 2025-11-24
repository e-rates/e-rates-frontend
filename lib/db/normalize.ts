// GeoJSON type definitions matching backend response
export interface BackendParcelProperties {
  id?: string;
  parcel_number: string;
  owner_name?: string;
  owner_phone?: string;
  property_type?: string;
  area?: number;
  rate_per_unit?: number;
  total_amount?: number;
  status?: string;
  zone?: string;
  owner_user?: string;
  owner_username?: string;
  parcel_ref?: string;
  area_m2?: number;
  props?: {
    area_name?: string;
    Parcel_No?: string;
    REG_SECTIO?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

export interface BackendGeoJSONFeature {
  type: 'Feature';
  id?: string;
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | 'Point';
    coordinates: any;
  };
  properties: BackendParcelProperties;
}

export interface BackendGeoJSON {
  type: 'FeatureCollection';
  features: BackendGeoJSONFeature[];
}

// Normalize backend GeoJSON to our DB schema
export function normalizeParcelFromBackend(feature: BackendGeoJSONFeature) {
  const props = feature.properties;

  // Backend uses: parcel_id, owner_username, parcel_ref, area_m2, owner_user
  return {
    id: (props as any).parcel_id || props.id || feature.id?.toString() || '',
    parcel_number: (props as any).parcel_ref || props.parcel_number || props.props?.Parcel_No || '',
    owner_name: props.owner_username || props.owner_name || (props as any).owner_email || '',
    owner_phone: props.owner_phone || '',
    property_type: props.property_type || '',
    area: props.area_m2 || props.area || 0,
    rate_per_unit: props.rate_per_unit || 0,
    total_amount: props.total_amount || 0,
    status: props.status || 'active',
    zone: props.zone || props.props?.area_name || props.props?.REG_SECTIO || '',
    coordinates: JSON.stringify(feature.geometry?.coordinates),
    centroid: props.centroid || null,
    geojson: feature.geometry,
    created_at: props.created_at ? new Date(props.created_at).getTime() : Date.now(),
    updated_at: props.updated_at ? new Date(props.updated_at).getTime() : Date.now(),
  };
}
