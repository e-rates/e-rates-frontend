// Sync service for managing data synchronization between backend and local DB
import { getDB, getMetadata, setMetadata, initDB } from './init';
import { normalizeParcelFromBackend, BackendGeoJSON } from './normalize';
import api, { getAuthToken } from '../api';
import { backendJson } from '../backend';
import type { Paginated } from '../payments';

/** What the API returns for a payment, as opposed to the local IndexedDB row. */
interface BackendPayment {
  payment_id: string;
  parcel_ref?: string | null;
  parcel_refs?: string[] | null;
  amount: string | number;
  status: string;
  processor_ref?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSync: number;
  progress: number;
  error?: string;
}

class SyncService {
  private syncInProgress = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeDB();
    }
  }

  private async initializeDB() {
    try {
      await initDB();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  subscribe(callback: (status: SyncStatus) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(status: SyncStatus) {
    this.listeners.forEach((cb) => cb(status));
  }

  async getLastSync(): Promise<number> {
    const lastSync = await getMetadata('last_sync');
    return lastSync ? parseInt(lastSync) : 0;
  }

  async syncParcels(force = false): Promise<void> {
    if (this.syncInProgress) return;

    // Check authentication first
    const token = getAuthToken();
    if (!token) {
      console.log('Skipping sync: user not authenticated');
      return;
    }

    try {
      this.syncInProgress = true;
      this.notifyListeners({
        isSyncing: true,
        lastSync: await this.getLastSync(),
        progress: 0,
      });

      const lastSync = force ? 0 : await this.getLastSync();

      // Fetch parcels from backend

      const response = await api.get<BackendGeoJSON>(
        '/api/parcels/geojson',
        token
      );
      const parcels = response.features || [];

      this.notifyListeners({ isSyncing: true, lastSync, progress: 30 });

      // Bulk insert/update parcels using IndexedDB transaction
      const db = await getDB();
      const tx = db.transaction('parcels', 'readwrite');

      console.log(`📝 Starting to store ${parcels.length} parcels...`);

      for (let i = 0; i < parcels.length; i++) {
        const feature = parcels[i];
        const normalized = normalizeParcelFromBackend(feature);

        if (i === 0) {
          console.log('📋 First normalized parcel:', normalized);
        }

        try {
          await tx.store.put(normalized);
        } catch (err) {
          console.error(`❌ Failed to store parcel ${i}:`, err, normalized);
          throw err;
        }

        if (i % 100 === 0) {
          const progress = 30 + Math.floor((i / parcels.length) * 40);
          this.notifyListeners({ isSyncing: true, lastSync, progress });
        }
      }

      await tx.done;
      console.log(`✅ Stored ${parcels.length} parcels successfully`);

      this.notifyListeners({ isSyncing: true, lastSync, progress: 80 });

      await setMetadata('last_sync', Date.now().toString());
      await setMetadata('parcels_count', parcels.length.toString());

      this.notifyListeners({
        isSyncing: false,
        lastSync: Date.now(),
        progress: 100,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Sync failed';
      this.notifyListeners({
        isSyncing: false,
        lastSync: await this.getLastSync(),
        progress: 0,
        error: errorMsg,
      });
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncPayments(): Promise<void> {
    // Check authentication first
    const token = getAuthToken();
    if (!token) {
      console.log('Skipping payment sync: user not authenticated');
      return;
    }

    try {
      const page = await backendJson<Paginated<BackendPayment>>(
        '/api/payments/?ordering=-created_at'
      );

      const db = await getDB();
      const tx = db.transaction('payments', 'readwrite');

      for (const payment of page.results) {
        await tx.store.put({
          id: payment.payment_id,
          parcel_id: payment.parcel_ref ?? payment.parcel_refs?.[0] ?? '',
          amount: Number(payment.amount),
          payment_date: new Date(payment.status === 'completed' ? payment.updated_at : payment.created_at).getTime(),
          payment_method: 'online',
          receipt_number: payment.processor_ref ?? payment.payment_id,
          created_at: Date.now(),
        } as any);
      }

      await tx.done;
    } catch (error) {
      throw error;
    }
  }

  async fullSync(force = false): Promise<void> {
    await this.syncParcels(force);
    await this.syncPayments();
  }

  async needsSync(): Promise<boolean> {
    const lastSync = await this.getLastSync();
    const oneHour = 60 * 60 * 1000;
    return Date.now() - lastSync > oneHour;
  }
}

export const syncService = new SyncService();
