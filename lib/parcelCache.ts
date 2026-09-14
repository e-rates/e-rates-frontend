import { parcelService } from './parcelService';

const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { data: any; loadedAt: number } | null = null;
let request: Promise<any> | null = null;

export const isParcelCacheFresh = () =>
  !!cache && Date.now() - cache.loadedAt < CACHE_TTL_MS;

export const invalidateParcelCache = () => {
  cache = null;
  if (typeof window !== 'undefined') {
    import('./db/init')
      .then(({ getDB }) => getDB())
      .then((db) => db.clear('parcels'))
      .catch(() => {});
  }
};

export function getParcels(): Promise<any> {
  if (isParcelCacheFresh()) return Promise.resolve(cache!.data);
  request ??= parcelService
    .getAllParcels()
    .then((data) => {
      if (data?.features?.length) cache = { data, loadedAt: Date.now() };
      return data;
    })
    .finally(() => {
      request = null;
    });
  return request;
}
