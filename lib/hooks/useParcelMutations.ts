import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryClient';
import axios from 'axios';
import { authService } from '../auth';
import toast from 'react-hot-toast';

interface AllocateParcelParams {
    parcel_id: string;
    user_id: string;
}

/**
 * Hook for allocating a parcel to a user
 * 
 * Features:
 * - Automatic cache invalidation after successful allocation
 * - Optimistic updates (optional)
 * - Toast notifications
 * 
 * @returns Mutation object with mutate function and loading state
 */
export function useAllocateParcel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: AllocateParcelParams) => {
            const token = await authService.getValidAccessToken();
            if (!token) throw new Error('Not authenticated');

            const response = await axios.post(
                `/api/admin/parcels/allocate_parcel`,
                params,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate all parcel queries to refetch with updated data
            queryClient.invalidateQueries({ queryKey: queryKeys.parcels.all });

            // Also invalidate available parcels
            queryClient.invalidateQueries({ queryKey: ['parcels', 'available'] });

            toast.success('Parcel allocated successfully');
        },
        onError: (error: any) => {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to allocate parcel';
            toast.error(errorMessage);
        },
    });
}
