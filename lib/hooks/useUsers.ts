import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryClient';
import axios from 'axios';
import { authService } from '../auth';

/**
 * Hook for searching users
 * 
 * @param searchTerm - Search query (name, phone, email)
 * @returns Query result with users data
 */
export function useUserSearch(searchTerm: string) {
    return useQuery({
        queryKey: queryKeys.users.search(searchTerm),
        queryFn: async () => {
            if (searchTerm.length < 3) return [];

            const token = await authService.getValidAccessToken();
            if (!token) throw new Error('Not authenticated');

            const response = await axios.get(
                `/api/admin/parcels/available_users?search=${searchTerm}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return response.data.users || response.data || [];
        },
        enabled: searchTerm.length >= 3,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}
