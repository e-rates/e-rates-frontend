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
 * IMPORTANT: Backend may return all parcels, so we filter client-side
 */
export function useUserParcels(userId: string | null | undefined) {
    console.log('🎯 useUserParcels called with userId:', userId, 'type:', typeof userId);
    
    const shouldFetch = !!userId && userId !== 'null' && userId !== 'undefined';
    
    console.log('🎯 shouldFetch:', shouldFetch);
    
    const query = useQuery({
        queryKey: queryKeys.parcels.list({ owner_user: userId || '' }),
        queryFn: async () => {
            console.log('🚀 Query function executing for userId:', userId);
            const result = await parcelService.getAllParcels({ owner_user: userId as string });
            console.log('📦 Query result from backend:', result?.features?.length, 'parcels');
            
            // CRITICAL FIX: Filter client-side because backend returns all parcels
            if (result?.features && userId) {
                const filtered = {
                    ...result,
                    features: result.features.filter((feature: any) => {
                        // Check if parcel belongs to this user
                        const ownerUser = feature.properties?.owner_user;
                        const ownerUsername = feature.properties?.owner_username;
                        const match = ownerUser === userId || ownerUsername === userId;
                        
                        if (!match) {
                            console.log('⚠️ Filtering out parcel:', feature.id, 'owner:', ownerUser);
                        }
                        
                        return match;
                    })
                };
                
                console.log('✅ Filtered to', filtered.features.length, 'parcels for user', userId);
                return filtered;
            }
            
            return result;
        },
        staleTime: 5 * 60 * 1000,
        enabled: shouldFetch,
    });
    
    return query;
}
