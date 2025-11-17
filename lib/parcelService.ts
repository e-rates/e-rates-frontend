import { authService } from './auth';
import axios from 'axios';
import { ParcelQueries } from './db/queries';
import { syncService } from './db/sync';
import { initDB } from './db/init';

const API_BASE_URL = '/api';
const USE_LOCAL_DB = typeof window !== 'undefined';

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
    // Use local DB if available and has data
    if (USE_LOCAL_DB) {
      try {
        await initDB();

        // Return from local DB
        let parcels = await ParcelQueries.getAll();

        // If local DB is empty, fall back to API to fetch and cache
        if (parcels.length === 0) {
          console.log('📭 Local DB is empty, fetching from API...');
          // Don't return here, fall through to API call below
        } else {
          console.log(
            `📦 Found ${parcels.length} parcels in local DB - returning instantly`
          );

          // Apply filters
          if (filters.search) {
            parcels = await ParcelQueries.search(filters.search);
          } else if (filters.area_name) {
            parcels = parcels.filter((p) => p.zone === filters.area_name);
          } else if (filters.status) {
            parcels = await ParcelQueries.getByStatus(filters.status);
          } else if (filters.owner_user) {
            parcels = parcels.filter(
              (p) => p.owner_name === filters.owner_user
            );
          }

          // Convert to GeoJSON (no parsing needed - geojson is already an object!)
          return {
            type: 'FeatureCollection',
            features: parcels.map((p) => ({
              id: p.id,
              type: 'Feature',
              geometry: p.geojson || null, // Already an object, no JSON.parse needed!
              properties: {
                owner_user: p.owner_name || '',
                owner_username: p.owner_name || '',
                parcel_ref: p.parcel_number,
                centroid: p.centroid || { type: 'Point', coordinates: [0, 0] },
                area_m2: p.area || 0,
                status: p.status || 'active',
                props: {
                  area_name: p.zone || '',
                  Parcel_No: p.parcel_number,
                  REG_SECTIO: '',
                },
                created_at: new Date(p.created_at || 0).toISOString(),
                updated_at: new Date(p.updated_at || 0).toISOString(),
              },
            })),
          };
        }
      } catch (dbError) {
        console.warn('Local DB query failed, falling back to API:', dbError);
      }
    }

    // Fallback to API (or initial fetch when DB is empty)
    const params: Record<string, string> = {};

    if (filters.area_name) params.area_name = filters.area_name;
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.owner_user) params.owner_user = filters.owner_user;

    console.log(
      'Fetching parcels from /api/parcels/geojson with params:',
      params
    );

    try {
      const token = await authService.getValidAccessToken();

      console.log('🔑 Token obtained:', {
        hasToken: !!token,
        tokenStart: token?.substring(0, 20) + '...',
      });

      if (!token) {
        throw new Error('No authentication token available. Please log in.');
      }

      // Build query string
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/parcels/geojson/${queryString ? `?${queryString}` : ''}`;

      console.log('🌐 Making request to:', url);
      console.log('📍 Full URL:', window.location.origin + url);
      console.log(
        '🔐 Authorization header:',
        `Bearer ${token.substring(0, 20)}...`
      );

      // Call Next.js API route using axios (same pattern as auth.ts)
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Parcels response:', {
        type: response.data?.type,
        featureCount: response.data?.features?.length,
      });

      // Cache the response in local DB for future use
      if (USE_LOCAL_DB && response.data?.features?.length > 0) {
        console.log('💾 Caching parcels to local DB...');
        try {
          const { getDB } = await import('./db/init');
          const { normalizeParcelFromBackend } = await import('./db/normalize');
          const { setMetadata } = await import('./db/init');

          const db = await getDB();
          const tx = db.transaction('parcels', 'readwrite');

          console.log(`📝 Storing ${response.data.features.length} parcels...`);

          for (let i = 0; i < response.data.features.length; i++) {
            const feature = response.data.features[i];
            const normalized = normalizeParcelFromBackend(feature);

            if (i === 0) {
              console.log('📋 First normalized parcel:', normalized);
            }

            await tx.store.put(normalized);
          }

          await tx.done;

          // Update metadata
          await setMetadata('last_sync', Date.now().toString());
          await setMetadata(
            'parcels_count',
            response.data.features.length.toString()
          );

          console.log(
            `✅ Cached ${response.data.features.length} parcels successfully`
          );
        } catch (err) {
          console.error('⚠️ Failed to cache parcels:', err);
        }
      }

      // Response is raw GeoJSON from Django (via Next.js proxy)
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching parcels:', error);

      if (axios.isAxiosError(error)) {
        console.error('🚨 Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          code: error.code,
          url: error.config?.url,
          method: error.config?.method,
          hasResponse: !!error.response,
          responseData: error.response?.data,
        });

        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
      }

      throw error;
    }
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
