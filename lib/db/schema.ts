// Database schema for local SQLite storage

export const SCHEMA_VERSION = 1;

export const createTables = `
-- Metadata table for sync state
CREATE TABLE IF NOT EXISTS sync_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Parcels table
CREATE TABLE IF NOT EXISTS parcels (
  id TEXT PRIMARY KEY,
  parcel_number TEXT UNIQUE NOT NULL,
  owner_name TEXT,
  owner_phone TEXT,
  property_type TEXT,
  area REAL,
  rate_per_unit REAL,
  total_amount REAL,
  status TEXT,
  zone TEXT,
  coordinates TEXT, -- Store as JSON string
  geojson TEXT, -- Store GeoJSON geometry
  created_at INTEGER,
  updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_parcels_number ON parcels(parcel_number);
CREATE INDEX IF NOT EXISTS idx_parcels_owner ON parcels(owner_name);
CREATE INDEX IF NOT EXISTS idx_parcels_zone ON parcels(zone);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  parcel_id TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_date INTEGER NOT NULL,
  payment_method TEXT,
  receipt_number TEXT,
  created_at INTEGER,
  FOREIGN KEY (parcel_id) REFERENCES parcels(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_parcel ON payments(parcel_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- History/Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id TEXT,
  data TEXT, -- JSON
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(created_at);

-- Reports cache
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON
  generated_at INTEGER NOT NULL,
  expires_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
`;

export interface SyncMetadata {
  key: string;
  value: string;
  updated_at: number;
}

export interface Parcel {
  id: string;
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
  coordinates?: string;
  centroid?: any; // Store centroid as object { type: 'Point', coordinates: [lng, lat] }
  geojson?: any; // Store as object, not string (IndexedDB supports this)
  created_at?: number;
  updated_at?: number;
}

export interface Payment {
  id: string;
  parcel_id: string;
  amount: number;
  payment_date: number;
  payment_method?: string;
  receipt_number?: string;
  created_at?: number;
}

export interface ActivityLog {
  id?: number;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id?: string;
  data?: string;
  created_at: number;
}

export interface Report {
  id: string;
  report_type: string;
  data: string;
  generated_at: number;
  expires_at?: number;
}
