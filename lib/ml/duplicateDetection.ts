// Simple duplicate detection for shapefile uploads (Parcel Number Match Only)
import { ParcelQueries } from '../db/queries';
import {
  normalizeParcelFromBackend,
  BackendGeoJSONFeature,
} from '../db/normalize';

interface DuplicateMatch {
  uploadedIndex: number;
  existingParcelNumber: string;
  similarity: number;
  matchType: 'exact';
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicates: DuplicateMatch[];
  uniqueCount: number;
  duplicateCount: number;
}

/**
 * Check uploaded shapefile features against existing database for duplicates
 * Uses simple exact match on parcel numbers as requested.
 */
export async function checkForDuplicates(
  uploadedFeatures: BackendGeoJSONFeature[]
): Promise<DuplicateCheckResult> {
  try {
    // Get existing parcels from database
    const existingParcels = await ParcelQueries.getAll();

    if (existingParcels.length === 0) {
      return {
        hasDuplicates: false,
        duplicates: [],
        uniqueCount: uploadedFeatures.length,
        duplicateCount: 0,
      };
    }

    // Create a Set of existing parcel numbers for O(1) lookup
    // Normalize to lowercase for case-insensitive comparison
    const existingNumbers = new Set(
      existingParcels.map((p) => p.parcel_number.toLowerCase().trim())
    );

    const duplicates: DuplicateMatch[] = [];

    uploadedFeatures.forEach((feature, index) => {
      const normalized = normalizeParcelFromBackend(feature);
      const parcelNumber = normalized.parcel_number.toLowerCase().trim();

      if (existingNumbers.has(parcelNumber)) {
        duplicates.push({
          uploadedIndex: index,
          existingParcelNumber: normalized.parcel_number,
          similarity: 1.0,
          matchType: 'exact',
        });
      }
    });

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates,
      uniqueCount: uploadedFeatures.length - duplicates.length,
      duplicateCount: duplicates.length,
    };
  } catch (error) {
    console.error('Duplicate detection failed:', error);
    // If check fails, assume no duplicates and let backend handle it
    return {
      hasDuplicates: false,
      duplicates: [],
      uniqueCount: uploadedFeatures.length,
      duplicateCount: 0,
    };
  }
}

/**
 * Remove duplicates from uploaded features
 */
export function stripDuplicates(
  uploadedFeatures: BackendGeoJSONFeature[],
  duplicateIndices: number[]
): BackendGeoJSONFeature[] {
  const duplicateSet = new Set(duplicateIndices);
  return uploadedFeatures.filter((_, index) => !duplicateSet.has(index));
}
