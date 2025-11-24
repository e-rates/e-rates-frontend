import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryClient';
import { parcelService, ParcelFilters, ParcelGeoJSON } from '../parcelService';

/**
 * Hook to fetch all parcels with optional filters
 * 
 * Features:
 * - Automatic caching (5 min stale time)
 * - Background refetching when stale
 * - Deduplication of requests
 * 
 * @param filters - Optional filters for parcels (area_name, status, search, owner_user)
 * @returns Query result with parcels data, loading state, and error
 */
export function useParcels(filters?: ParcelFilters) {
    return useQuery({
        queryKey: queryKeys.parcels.list(filters),
        queryFn: () => parcelService.getAllParcels(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to fetch parcels by area
 */
export function useParcelsByArea(areaName: string) {
    return useParcels({ area_name: areaName });
}

/**
 * Hook to fetch active parcels only
 */
export function useActiveParcels() {
    return useParcels({ status: 'active' });
}

/**
 * Hook to fetch parcels for a specific user
 */
export function useUserParcels(userId: string) {
    return useParcels({ owner_user: userId });
}
