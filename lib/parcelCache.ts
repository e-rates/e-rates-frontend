import { backendJson } from './backend';

let cache: any = null;
let request: Promise<any> | null = null;

export const cachedParcels = () => cache;

export const invalidateParcelCache = () => {
  cache = null;
};

export function getParcels(): Promise<any> {
  request ??= backendJson<any>('/api/parcels/geojson/')
    .then((data) => {
      if (data?.features?.length) cache = data;
      return data;
    })
    .finally(() => {
      request = null;
    });
  return request;
}

export const parcelsSignature = (data: any) =>
  (data?.features ?? []).map((f: any) => `${f.id}:${f.properties?.owner_user ?? ''}:${f.properties?.status ?? ''}`).join('|');
