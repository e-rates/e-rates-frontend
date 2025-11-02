declare module 'shpjs' {
  interface GeoJSONFeature {
    type: 'Feature';
    geometry: any;
    properties: any;
  }

  interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
  }

  function shp(input: string | ArrayBuffer): Promise<GeoJSONFeatureCollection>;

  namespace shp {
    function parseShp(buffer: ArrayBuffer): any;
    function parseDbf(buffer: ArrayBuffer): any;
    function combine(parts: any[]): GeoJSONFeatureCollection;
  }

  export = shp;
}
