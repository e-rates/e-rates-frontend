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
  county?: string;
  sub_county?: string;
  ward?: string;
  owner_user?: string;
  owner_username?: string;
  parcel_ref?: string;
  area_m2?: number;
  centroid?: any;
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

  return {
    id: props.id || props.parcel_number || feature.id?.toString() || '',
    parcel_number:
      props.parcel_number || props.parcel_ref || props.props?.Parcel_No || '',
    owner_name: props.owner_name || props.owner_username || '',
    owner_phone: props.owner_phone || '',
    property_type: props.property_type || '',
    area: props.area || props.area_m2 || 0,
    rate_per_unit: props.rate_per_unit || 0,
    total_amount: props.total_amount || 0,
    status: props.status || 'active',
    zone: props.zone || props.props?.area_name || '',
    county: props.county || props.props?.county || '',
    sub_county: props.sub_county || props.props?.sub_county || '',
    ward: props.ward || props.props?.ward || '',
    coordinates: JSON.stringify(feature.geometry?.coordinates),
    centroid: props.centroid || null,
    geojson: feature.geometry,
    created_at: props.created_at
      ? new Date(props.created_at).getTime()
      : Date.now(),
    updated_at: props.updated_at
      ? new Date(props.updated_at).getTime()
      : Date.now(),
  };
}
