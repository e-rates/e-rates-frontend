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
    // Add other properties from your shapefile
  };
}

export interface ParcelCollection {
  type: 'FeatureCollection';
  features: ParcelFeature[];
}

/**
 * Load shapefile from a zip file containing .shp, .dbf, .prj files
 * @param zipFileUrl - URL or path to the zip file
 * @returns GeoJSON FeatureCollection
 */
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

/**
 * Load shapefile from individual files (browser-based)
 * @param files - Object containing .shp, .dbf, .prj file buffers
 * @returns GeoJSON FeatureCollection
 */
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

/**
 * Style a parcel based on payment status
 * @param feature - GeoJSON feature
 * @param paymentStatus - Payment status object from your API
 * @returns Leaflet style object
 */
export function getParcelStyle(
  feature: ParcelFeature,
  paymentStatus?: { isPaid: boolean; amount?: number }
) {
  const isPaid = paymentStatus?.isPaid || false;

  return {
    fillColor: isPaid ? '#2bc76f' : '#ff4757', // Green if paid, Red if unpaid
    fillOpacity: 0.6,
    color: isPaid ? '#1fa55a' : '#d63447', // Border color
    weight: 2,
    opacity: 1,
  };
}

/**
 * Get hover/highlight style
 */
export function getHighlightStyle() {
  return {
    fillOpacity: 0.8,
    weight: 3,
    color: '#00ffd1', // Your primary color
  };
}
