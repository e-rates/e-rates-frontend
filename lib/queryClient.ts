import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient configuration for TanStack Query
 * 
 * Cache Strategy:
 * - staleTime: 5 minutes - data is considered fresh for 5 minutes
 * - gcTime: 10 minutes - unused data is garbage collected after 10 minutes
 * - refetchOnWindowFocus: true - refetch when user returns to tab
 * - retry: 1 - retry failed requests once
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 1,
        },
        mutations: {
            retry: 1,
        },
    },
});

/**
 * Query keys for consistent cache management
 */
export const queryKeys = {
    parcels: {
        all: ['parcels'] as const,
        lists: () => [...queryKeys.parcels.all, 'list'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.parcels.lists(), filters] as const,
        search: (query: string) =>
            [...queryKeys.parcels.all, 'search', query] as const,
    },
    users: {
        all: ['users'] as const,
        search: (query: string) =>
            [...queryKeys.users.all, 'search', query] as const,
    },
} as const;
