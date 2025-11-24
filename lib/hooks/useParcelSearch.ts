import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { queryKeys } from '../queryClient';
import axios from 'axios';
import { authService } from '../auth';

/**
 * Hook for debounced parcel search with autocomplete
 * 
 * Features:
 * - 500ms debounce to avoid excessive API calls
 * - Automatic caching of search results
 * - Only searches when query length >= 2
 * 
 * @param initialQuery - Initial search query
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 * @returns Search results and loading state
 */
export function useParcelSearch(initialQuery = '', debounceMs = 500) {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

    // Debounce the search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchQuery, debounceMs]);

    const query = useQuery({
        queryKey: queryKeys.parcels.search(debouncedQuery),
        queryFn: async () => {
            const token = await authService.getValidAccessToken();
            if (!token) throw new Error('Not authenticated');

            const response = await axios.get(
                `/api/parcels/geojson?search=${debouncedQuery}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return response.data;
        },
        enabled: debouncedQuery.length >= 2, // Only search with 2+ characters
        staleTime: 2 * 60 * 1000, // 2 minutes for search results
    });

    return {
        searchQuery,
        setSearchQuery,
        results: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
}

/**
 * Hook for searching available parcels for allocation
 */
export function useAvailableParcelSearch(searchTerm: string) {
    return useQuery({
        queryKey: ['parcels', 'available', searchTerm],
        queryFn: async () => {
            if (searchTerm.length < 3) return [];

            const token = await authService.getValidAccessToken();
            if (!token) throw new Error('Not authenticated');

            const response = await axios.get(
                `/api/admin/parcels/available_for_allocation?search=${searchTerm}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return response.data.parcels || response.data || [];
        },
        enabled: searchTerm.length >= 3,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
}
