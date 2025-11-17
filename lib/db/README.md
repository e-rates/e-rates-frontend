# Local SQLite Database Setup

## Overview

Client-side SQLite database using wa-sqlite for offline-first data management.

## Quick Start

```typescript
import { initDB, ParcelQueries, syncService } from '@/lib/db';

// Initialize (auto-called, but can force)
await initDB();

// Sync data from backend
await syncService.fullSync();

// Query parcels
const parcels = await ParcelQueries.getAll();
const parcel = await ParcelQueries.getById('parcel-123');
const results = await ParcelQueries.search('John');
```

## Features

- ✅ Offline-first with automatic sync
- ✅ Encrypted local storage (IndexedDB)
- ✅ Optimized queries with indexes
- ✅ Real-time sync status
- ✅ Perfect for TensorFlow data pipelines

## Files

- `lib/db/schema.ts` - Database tables
- `lib/db/init.ts` - DB initialization
- `lib/db/queries.ts` - Query helpers
- `lib/db/sync.ts` - Sync service
- `app/(admin)/components/SyncIndicator.tsx` - UI component

## Usage in Components

```tsx
import { SyncIndicator } from '@/app/(admin)/components/SyncIndicator';

<SyncIndicator />; // Shows sync status with manual refresh
```

## Manual Sync

```typescript
import { syncService } from '@/lib/db';

// Full sync
await syncService.fullSync(true); // force refresh

// Check if sync needed
const needsSync = await syncService.needsSync(); // checks if > 1 hour old
```

## Notes

- Auto-syncs when data is >1 hour old
- Falls back to API if DB fails
- All queries work offline after first sync
