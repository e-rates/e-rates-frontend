// TensorFlow-based duplicate detection for shapefile uploads
import * as tf from '@tensorflow/tfjs';
import { ParcelQueries } from '../db/queries';
import {
  normalizeParcelFromBackend,
  BackendGeoJSONFeature,
} from '../db/normalize';

interface DuplicateMatch {
  uploadedIndex: number;
  existingParcelNumber: string;
  similarity: number;
  matchType: 'exact' | 'high' | 'medium';
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicates: DuplicateMatch[];
  uniqueCount: number;
  duplicateCount: number;
}

// Extract features from parcel for comparison
function extractFeatures(parcel: any): number[] {
  const coords = parcel.coordinates ? JSON.parse(parcel.coordinates) : [];
  const flatCoords = coords.flat(3).slice(0, 20); // Take first 20 coordinate values

  return [
    parcel.area || 0,
    parcel.parcel_number ? hashString(parcel.parcel_number) : 0,
    parcel.zone ? hashString(parcel.zone) : 0,
    ...flatCoords.map((v: any) => Number(v) || 0),
  ].slice(0, 25); // Fixed size feature vector
}

// Simple hash for string comparison
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) / 1e9; // Normalize
}

// Pad or truncate to fixed size
function padFeatures(features: number[], size = 25): number[] {
  if (features.length >= size) return features.slice(0, size);
  return [...features, ...Array(size - features.length).fill(0)];
}

/**
 * Check uploaded shapefile features against existing database for duplicates
 * Uses TensorFlow for similarity matching
 */
export async function checkForDuplicates(
  uploadedFeatures: BackendGeoJSONFeature[],
  threshold = 0.85
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

    // Normalize uploaded features
    const normalizedUploaded = uploadedFeatures.map(normalizeParcelFromBackend);

    // Extract feature vectors
    const uploadedVectors = normalizedUploaded.map((p) =>
      padFeatures(extractFeatures(p))
    );
    const existingVectors = existingParcels.map((p) =>
      padFeatures(extractFeatures(p))
    );

    // Create tensors
    const uploadedTensor = tf.tensor2d(uploadedVectors);
    const existingTensor = tf.tensor2d(existingVectors);

    // Compute cosine similarity matrix
    const uploadedNorm = tf.norm(uploadedTensor, 'euclidean', 1, true);
    const existingNorm = tf.norm(existingTensor, 'euclidean', 1, true);

    const uploadedNormalized = tf.div(uploadedTensor, uploadedNorm.add(1e-8));
    const existingNormalized = tf.div(existingTensor, existingNorm.add(1e-8));

    // Similarity matrix: [uploaded x existing]
    const similarityMatrix = tf.matMul(
      uploadedNormalized,
      existingNormalized,
      false,
      true
    );

    // Get max similarity for each uploaded feature
    const maxSimilarities = tf.max(similarityMatrix, 1);
    const maxIndices = tf.argMax(similarityMatrix, 1);

    const similarities = (await maxSimilarities.array()) as number[];
    const indices = (await maxIndices.array()) as number[];

    // Cleanup tensors
    uploadedTensor.dispose();
    existingTensor.dispose();
    uploadedNorm.dispose();
    existingNorm.dispose();
    uploadedNormalized.dispose();
    existingNormalized.dispose();
    similarityMatrix.dispose();
    maxSimilarities.dispose();
    maxIndices.dispose();

    // Find duplicates
    const duplicates: DuplicateMatch[] = [];

    for (let i = 0; i < similarities.length; i++) {
      const similarity = similarities[i];

      if (similarity >= threshold) {
        const matchType =
          similarity >= 0.98 ? 'exact' : similarity >= 0.9 ? 'high' : 'medium';

        duplicates.push({
          uploadedIndex: i,
          existingParcelNumber: existingParcels[indices[i]].parcel_number,
          similarity,
          matchType,
        });
      }
    }

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates,
      uniqueCount: uploadedFeatures.length - duplicates.length,
      duplicateCount: duplicates.length,
    };
  } catch (error) {
    console.error('Duplicate detection failed:', error);
    // Fallback: check exact parcel numbers only
    return await fallbackDuplicateCheck(uploadedFeatures);
  }
}

// Fallback: simple exact match on parcel numbers
async function fallbackDuplicateCheck(
  uploadedFeatures: BackendGeoJSONFeature[]
): Promise<DuplicateCheckResult> {
  const existingParcels = await ParcelQueries.getAll();
  const existingNumbers = new Set(existingParcels.map((p) => p.parcel_number));

  const duplicates: DuplicateMatch[] = [];

  uploadedFeatures.forEach((feature, index) => {
    const normalized = normalizeParcelFromBackend(feature);
    if (existingNumbers.has(normalized.parcel_number)) {
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
