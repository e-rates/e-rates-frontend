// Data access layer for querying local database
import { getDB } from './init';
import { Parcel, Payment, ActivityLog } from './schema';

export class ParcelQueries {
  static async getAll(): Promise<Parcel[]> {
    const db = await getDB();
    const parcels = await db.getAll('parcels');
    return parcels.sort((a, b) =>
      a.parcel_number.localeCompare(b.parcel_number)
    );
  }

  static async getById(id: string): Promise<Parcel | null> {
    const db = await getDB();
    const parcel = await db.get('parcels', id);
    return parcel || null;
  }

  static async getByParcelNumber(parcelNumber: string): Promise<Parcel | null> {
    const db = await getDB();
    const parcel = await db.getFromIndex(
      'parcels',
      'parcel_number',
      parcelNumber
    );
    return parcel || null;
  }

  static async search(query: string): Promise<Parcel[]> {
    const db = await getDB();
    const allParcels = await db.getAll('parcels');
    const lowerQuery = query.toLowerCase();

    return allParcels
      .filter(
        (p) =>
          p.parcel_number.toLowerCase().includes(lowerQuery) ||
          p.owner_name.toLowerCase().includes(lowerQuery) ||
          (p.owner_phone && p.owner_phone.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 100);
  }

  static async getByZone(zone: string): Promise<Parcel[]> {
    const db = await getDB();
    return db.getAllFromIndex('parcels', 'zone', zone);
  }

  static async getByStatus(status: string): Promise<Parcel[]> {
    const db = await getDB();
    return db.getAllFromIndex('parcels', 'status', status);
  }

  static async getGeoJSON(): Promise<any> {
    const db = await getDB();
    const parcels = await db.getAll('parcels');
    const parcelsWithGeo = parcels.filter((p) => p.geojson);

    return {
      type: 'FeatureCollection',
      features: parcelsWithGeo.map((p) => {
        return {
          type: 'Feature',
          id: p.id,
          geometry: p.geojson, // Already an object, no parsing needed!
          properties: p,
        };
      }),
    };
  }

  static async getStats() {
    const db = await getDB();
    const parcels = await db.getAll('parcels');

    const totalAmount = parcels.reduce(
      (sum, p) => sum + (p.total_amount || 0),
      0
    );

    const byStatus = parcels.reduce(
      (acc, p) => {
        const existing = acc.find((s) => s.status === p.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: p.status, count: 1 });
        }
        return acc;
      },
      [] as { status: string; count: number }[]
    );

    const byZone = parcels.reduce(
      (acc, p) => {
        const existing = acc.find((z) => z.zone === p.zone);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ zone: p.zone, count: 1 });
        }
        return acc;
      },
      [] as { zone: string; count: number }[]
    );

    return {
      total: parcels.length,
      totalAmount,
      byStatus,
      byZone,
    };
  }
}

export class PaymentQueries {
  static async getByParcelId(parcelId: string): Promise<Payment[]> {
    const db = await getDB();
    const payments = await db.getAllFromIndex(
      'payments',
      'parcel_id',
      parcelId
    );
    return payments.sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
  }

  static async getRecent(limit = 50): Promise<Payment[]> {
    const db = await getDB();
    const payments = await db.getAll('payments');
    return payments
      .sort(
        (a, b) =>
          new Date(b.payment_date).getTime() -
          new Date(a.payment_date).getTime()
      )
      .slice(0, limit);
  }

  static async getTotalByParcel(parcelId: string): Promise<number> {
    const db = await getDB();
    const payments = await db.getAllFromIndex(
      'payments',
      'parcel_id',
      parcelId
    );
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }

  static async getStats() {
    const db = await getDB();
    const payments = await db.getAll('payments');

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    const byMethod = payments.reduce(
      (acc, p) => {
        const existing = acc.find((m) => m.payment_method === p.payment_method);
        if (existing) {
          existing.count++;
          existing.total += p.amount;
        } else {
          acc.push({
            payment_method: p.payment_method,
            count: 1,
            total: p.amount,
          });
        }
        return acc;
      },
      [] as { payment_method: string; count: number; total: number }[]
    );

    return {
      totalAmount,
      totalCount: payments.length,
      byMethod,
    };
  }
}

export class ActivityLogQueries {
  static async log(log: Omit<ActivityLog, 'id'>): Promise<void> {
    const db = await getDB();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.add('activity_log', {
      id,
      ...log,
    } as ActivityLog);
  }

  static async getByEntity(
    entityType: string,
    entityId: string
  ): Promise<ActivityLog[]> {
    const db = await getDB();
    const logs = await db.getAllFromIndex('activity_log', 'entity', [
      entityType,
      entityId,
    ]);
    return logs.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  static async getRecent(limit = 100): Promise<ActivityLog[]> {
    const db = await getDB();
    const logs = await db.getAll('activity_log');
    return logs
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);
  }
}
