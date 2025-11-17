// Database initialization with IndexedDB (browser-native, no Node.js dependencies)
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { createTables, SCHEMA_VERSION, Parcel } from './schema';

interface ERatesDB extends DBSchema {
  parcels: {
    key: string;
    value: Parcel;
    indexes: { parcel_number: string; zone: string; status: string };
  };
  payments: {
    key: string;
    value: any;
    indexes: { parcel_id: string };
  };
  activity_log: {
    key: number;
    value: any;
    indexes: { entity: [string, string] };
  };
  sync_metadata: {
    key: string;
    value: { key: string; value: string; updated_at: number };
  };
}

let db: IDBPDatabase<ERatesDB> | null = null;

const DB_NAME = 'e-rates-db';
const DB_VERSION = 3; // Increment version to add centroid field

export async function initDB(): Promise<IDBPDatabase<ERatesDB>> {
  if (db !== null) return db;

  try {
    db = await openDB<ERatesDB>(DB_NAME, DB_VERSION, {
      upgrade(database, oldVersion, newVersion, transaction) {
        console.log(
          `🔄 Upgrading database from version ${oldVersion} to ${newVersion}`
        );

        // Clear parcels on any schema change to force re-sync with new fields
        if (
          (oldVersion === 1 && newVersion === 2) ||
          (oldVersion === 2 && newVersion === 3)
        ) {
          console.log('🗑️ Clearing parcels store for schema migration');
          if (database.objectStoreNames.contains('parcels')) {
            // Use the existing upgrade transaction, don't create a new one!
            transaction.objectStore('parcels').clear();
          }
        }

        // Create parcels store
        if (!database.objectStoreNames.contains('parcels')) {
          const parcelStore = database.createObjectStore('parcels', {
            keyPath: 'id',
          });
          parcelStore.createIndex('parcel_number', 'parcel_number', {
            unique: true,
          });
          parcelStore.createIndex('zone', 'zone');
          parcelStore.createIndex('status', 'status');
        }

        // Create payments store
        if (!database.objectStoreNames.contains('payments')) {
          const paymentStore = database.createObjectStore('payments', {
            keyPath: 'id',
          });
          paymentStore.createIndex('parcel_id', 'parcel_id');
        }

        // Create activity_log store
        if (!database.objectStoreNames.contains('activity_log')) {
          const logStore = database.createObjectStore('activity_log', {
            keyPath: 'id',
            autoIncrement: true,
          });
          logStore.createIndex('entity', ['entity_type', 'entity_id']);
        }

        // Create sync_metadata store
        if (!database.objectStoreNames.contains('sync_metadata')) {
          database.createObjectStore('sync_metadata', { keyPath: 'key' });
        }
      },
    });

    // Initialize metadata
    const version = await getMetadata('schema_version');
    if (!version) {
      await setMetadata('schema_version', SCHEMA_VERSION.toString());
      await setMetadata('last_sync', '0');
    }

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export async function getDB(): Promise<IDBPDatabase<ERatesDB>> {
  if (db === null) {
    // If DB is not initialized, initialize it
    return await initDB();
  }
  return db;
}

// Simplified query functions using IndexedDB
export async function executeSQL(
  sql: string,
  params: any[] = []
): Promise<any[]> {
  // This is a compatibility shim - IndexedDB doesn't use SQL
  // Queries are handled in queries.ts using IndexedDB API directly
  throw new Error('Use IndexedDB queries directly via ParcelQueries, etc.');
}

export async function executeSingleSQL(
  sql: string,
  params: any[] = []
): Promise<any | null> {
  throw new Error('Use IndexedDB queries directly via ParcelQueries, etc.');
}

export async function getMetadata(key: string): Promise<string | null> {
  const database = await getDB();
  const result = await database.get('sync_metadata', key);
  return result?.value || null;
}

export async function setMetadata(key: string, value: string): Promise<void> {
  const database = await getDB();
  await database.put('sync_metadata', {
    key,
    value,
    updated_at: Date.now(),
  });
}

export async function clearDatabase(): Promise<void> {
  const database = await getDB();
  await database.clear('parcels');
  await database.clear('payments');
  await database.clear('activity_log');
  await setMetadata('last_sync', '0');
}
