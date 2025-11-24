// Simple duplicate detection for shapefile uploads
// No ML dependencies - uses basic comparison logic

export interface DuplicateMatch {
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

/**
 * Check uploaded shapefile features against backend for duplicates
 * Uses simple comparison logic - backend should be the source of truth
 */
export async function checkForDuplicates(
    uploadedFeatures: any[],
    existingParcels: any[]
): Promise<DuplicateCheckResult> {
    const duplicates: DuplicateMatch[] = [];
    const existingParcelNumbers = new Set(
        existingParcels.map((p) => p.properties?.parcel_ref || p.parcel_number)
    );

    uploadedFeatures.forEach((feature, index) => {
        const uploadedParcelNumber = feature.properties?.parcel_ref ||
            feature.properties?.Parcel_No ||
            feature.properties?.PARCEL_NO;

        // Check for exact parcel number match
        if (uploadedParcelNumber && existingParcelNumbers.has(uploadedParcelNumber)) {
            duplicates.push({
                uploadedIndex: index,
                existingParcelNumber: uploadedParcelNumber,
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
    uploadedFeatures: any[],
    duplicateIndices: number[]
): any[] {
    const duplicateSet = new Set(duplicateIndices);
    return uploadedFeatures.filter((_, index) => !duplicateSet.has(index));
}

/**
 * Validate parcel data before upload
 */
export function validateParcelData(feature: any): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check for required fields
    if (!feature.properties?.parcel_ref &&
        !feature.properties?.Parcel_No &&
        !feature.properties?.PARCEL_NO) {
        errors.push('Missing parcel number');
    }

    // Check for valid geometry
    if (!feature.geometry || !feature.geometry.coordinates) {
        errors.push('Missing or invalid geometry');
    }

    // Check geometry type
    if (feature.geometry?.type !== 'Polygon' &&
        feature.geometry?.type !== 'MultiPolygon') {
        errors.push('Geometry must be Polygon or MultiPolygon');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
