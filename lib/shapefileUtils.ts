import shp from 'shpjs';

export interface ParcelFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: {
    [key: string]: any;
    parcelId?: string;
    ownerId?: string;
  };
}

export interface ParcelCollection {
  type: 'FeatureCollection';
  features: ParcelFeature[];
}

export async function loadShapefile(
  zipFileUrl: string
): Promise<ParcelCollection> {
  try {
    const geojson = await shp(zipFileUrl);
    return geojson as ParcelCollection;
  } catch (error) {
    console.error('Error loading shapefile:', error);
    throw error;
  }
}

export async function loadShapefileFromFiles(files: {
  shp: ArrayBuffer;
  dbf: ArrayBuffer;
  prj?: ArrayBuffer;
}): Promise<ParcelCollection> {
  try {
    const geojson = await shp.combine([
      shp.parseShp(files.shp),
      shp.parseDbf(files.dbf),
    ]);
    return geojson as ParcelCollection;
  } catch (error) {
    console.error('Error loading shapefile from files:', error);
    throw error;
  }
}

export function getParcelStyle(
  feature: ParcelFeature,
  paymentStatus?: { isPaid: boolean; amount?: number }
) {
  const isPaid = paymentStatus?.isPaid || false;

  return {
    fillColor: isPaid ? '#2bc76f' : '#ff4757',
    fillOpacity: 0.6,
    color: isPaid ? '#1fa55a' : '#d63447',
    weight: 2,
    opacity: 1,
  };
}

export function getHighlightStyle() {
  return {
    fillOpacity: 0.8,
    weight: 3,
    color: '#00ffd1',
  };
}
