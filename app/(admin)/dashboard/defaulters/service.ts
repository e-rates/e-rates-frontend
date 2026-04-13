import { authService } from '@/lib/auth';
import { DefaultersFilters, DefaultersResponse } from './types';

const BACKEND_URL = 'http://5.189.150.44';

/**
 * Build query string from filters object
 */
function buildQueryString(filters: DefaultersFilters): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
        }
    });

    return params.toString();
}

/**
 * Fetch defaulters from the API with optional filters
 */
export async function fetchDefaulters(
    filters: DefaultersFilters = {}
): Promise<DefaultersResponse> {
    const token = await authService.getValidAccessToken();

    if (!token) {
        throw new Error('Authentication required. Please log in to view defaulters.');
    }

    const queryString = buildQueryString(filters);
    const url = `${BACKEND_URL}/api/payments/defaulters/${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Failed to fetch defaulters: ${response.status}`
            );
        }

        const data: DefaultersResponse = await response.json();
        console.log('Defaulters API Response:', data);
        return data;
    } catch (error) {
        console.error('Error fetching defaulters:', error);
        throw error;
    }
}

/**
 * Export defaulters data as CSV
 */
export async function exportDefaulters(
    filters: DefaultersFilters = {}
): Promise<Blob> {
    const token = await authService.getValidAccessToken();

    if (!token) {
        throw new Error('Authentication required. Please log in to export defaulters.');
    }

    const queryString = buildQueryString({ ...filters, page_size: 10000 }); // Get all for export
    const url = `${BACKEND_URL}/api/payments/defaulters/${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to export defaulters: ${response.status}`);
        }

        const data: DefaultersResponse = await response.json();

        // Convert to CSV
        const csv = convertToCSV(data.results);
        return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
        console.error('Error exporting defaulters:', error);
        throw error;
    }
}

/**
 * Convert defaulters data to CSV format
 */
function convertToCSV(defaulters: any[]): string {
    if (defaulters.length === 0) return '';

    const headers = [
        'Username',
        'Email',
        'Phone',
        'Amount',
        'Currency',
        'Days Overdue',
        'Deadline',
        'Status',
        'Invoice Number',
        'Parcels',
        'County',
        'Sub County',
        'Ward',
    ];

    const rows = defaulters.map((d) => [
        d.username,
        d.email,
        d.phone,
        d.amount,
        d.currency,
        d.days_overdue,
        new Date(d.deadline).toLocaleDateString(),
        d.status,
        d.metadata?.invoice_number || '',
        d.parcels.map((p: any) => p.parcel_ref).join('; '),
        d.parcels[0]?.county || '',
        d.parcels[0]?.sub_county || '',
        d.parcels[0]?.ward || '',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
    ].join('\n');

    return csvContent;
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
