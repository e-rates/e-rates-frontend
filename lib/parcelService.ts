import { authService } from './auth';
import axios from 'axios';
import { ParcelQueries } from './db/queries';
import { syncService } from './db/sync';
import { initDB, getDB, getMetadata, setMetadata } from './db/init';
import { normalizeParcelFromBackend } from './db/normalize';

const API_BASE_URL = '/api';
const USE_LOCAL_DB = typeof window !== 'undefined';
const SYNC_CHECK_INTERVAL = 5000; // Check backend every 5 seconds

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
    // Use local DB if available and has data, but verify with backend periodically
    if (USE_LOCAL_DB) {
      try {
        await initDB();

        // Get local data
        const localParcels = await ParcelQueries.getAll();
        const cachedCount = await getMetadata('parcels_count');
        const lastSyncStr = await getMetadata('last_sync');
        const lastSync = lastSyncStr ? parseInt(lastSyncStr) : 0;
        const timeSinceSync = Date.now() - lastSync;

        console.log(`💾 Local DB has ${localParcels.length} parcels (cached: ${cachedCount}, last sync: ${timeSinceSync}ms ago)`);

        // Only check backend if:
        // 1. Cache is empty, OR
        // 2. More than SYNC_CHECK_INTERVAL has passed since last check
        const shouldCheckBackend = localParcels.length === 0 || timeSinceSync > SYNC_CHECK_INTERVAL;

        if (!shouldCheckBackend && localParcels.length > 0) {
          console.log('⚡ Using cached data (sync check skipped)');

          // Apply filters client-side
          let parcels = localParcels;
          if (filters.search) {
            parcels = await ParcelQueries.search(filters.search);
          } else if (filters.area_name) {
            parcels = parcels.filter((p) => p.zone === filters.area_name);
          } else if (filters.status) {
            parcels = await ParcelQueries.getByStatus(filters.status);
          } else if (filters.owner_user) {
            // Filter by owner_user - check both owner_name and owner_user fields
            parcels = parcels.filter((p) => 
              p.owner_name === filters.owner_user || 
              (p as any).owner_user === filters.owner_user
            );
          }

          // Convert to GeoJSON
          return {
            type: 'FeatureCollection',
            features: parcels.map((p) => ({
              id: p.id,
              type: 'Feature',
              geometry: p.geojson || null,
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

        // Check backend for changes
        const token = await authService.getValidAccessToken();
        if (!token) {
          throw new Error('No authentication token available. Please log in.');
        }

        // Build params for backend check
        const params: Record<string, string> = {};
        if (filters.area_name) params.area_name = filters.area_name;
        if (filters.status) params.status = filters.status;
        if (filters.search) params.search = filters.search;
        if (filters.owner_user) params.owner_user = filters.owner_user;

        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/parcels/geojson/${queryString ? `?${queryString}` : ''}`;

        console.log('🔍 Checking backend for data changes...');
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const backendCount = response.data?.features?.length || 0;
        console.log(`🌐 Backend: ${backendCount} parcels`);

        // Update last sync timestamp
        await setMetadata('last_sync', Date.now().toString());

        // If counts match and we have local data and no filters, use cache
        if (localParcels.length > 0 && localParcels.length === backendCount && Object.keys(params).length === 0) {
          console.log('✅ Cache is up-to-date, using local data');

          // Convert to GeoJSON
          return {
            type: 'FeatureCollection',
            features: localParcels.map((p) => ({
              id: p.id,
              type: 'Feature',
              geometry: p.geojson || null,
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
        } else {
          console.log('🔄 Cache outdated or filters applied, updating from backend');
          
          // Update cache with new data
          if (backendCount > 0) {
            console.log('💾 Updating local cache...');
            const db = await getDB();
            
            // Clear old data if count changed
            if (localParcels.length !== backendCount) {
              await db.clear('parcels');
            }
            
            const tx = db.transaction('parcels', 'readwrite');
            for (const feature of response.data.features) {
              const normalized = normalizeParcelFromBackend(feature);
              await tx.store.put(normalized);
            }
            await tx.done;
            
            await setMetadata('parcels_count', backendCount.toString());
            console.log(`✅ Cache updated with ${backendCount} parcels`);
          } else if (backendCount === 0 && localParcels.length > 0) {
            // Backend has no data, clear local cache
            console.log('🗑️ Backend is empty, clearing local cache');
            const db = await getDB();
            await db.clear('parcels');
            await setMetadata('parcels_count', '0');
          }
          
          // Return backend data
          return response.data;
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
