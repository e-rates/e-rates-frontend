import { authAxios } from './auth';

export interface ParcelFilters {
  area_name?: string;
  status?: 'active' | 'inactive';
  search?: string;
  owner_user?: string;
}

export interface ParcelGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface ParcelProperties {
  owner_user: string;
  owner_username: string;
  parcel_ref: string;
  centroid: {
    type: 'Point';
    coordinates: [number, number];
  };
  area_m2: number;
  status: string;
  props: {
    area_name: string;
    Parcel_No: string;
    REG_SECTIO: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface ParcelFeature {
  id: string;
  type: 'Feature';
  geometry: ParcelGeometry;
  properties: ParcelProperties;
}

export interface ParcelGeoJSON {
  type: 'FeatureCollection';
  features: ParcelFeature[];
}

export const parcelService = {
  async getAllParcels(filters: ParcelFilters = {}): Promise<ParcelGeoJSON> {
    const params = new URLSearchParams();

    if (filters.area_name) params.set('area_name', filters.area_name);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.owner_user) params.set('owner_user', filters.owner_user);

    const queryString = params.toString();
    const url = `/api/parcels/geojson${queryString ? '?' + queryString : ''}`;

    // Get token using the auth service
    const { authService } = await import('./auth');
    const token = await authService.getValidAccessToken();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch parcels');
    }

    return result.data;
  },

  async getParcelsByArea(areaName: string): Promise<ParcelGeoJSON> {
    return this.getAllParcels({ area_name: areaName });
  },

  async getActiveparcels(): Promise<ParcelGeoJSON> {
    return this.getAllParcels({ status: 'active' });
  },

  async searchParcels(searchTerm: string): Promise<ParcelGeoJSON> {
    return this.getAllParcels({ search: searchTerm });
  },

  async getUserParcels(userId: string): Promise<ParcelGeoJSON> {
    return this.getAllParcels({ owner_user: userId });
  },
};
