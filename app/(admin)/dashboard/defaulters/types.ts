import { ColumnDef } from '@tanstack/react-table';

// Parcel information within a defaulter record
export interface Parcel {
    parcel_ref: string;
    ward: string;
    sub_county: string;
    county: string;
    centroid: {
        lat: number;
        lon: number;
    };
}

// Main defaulter record
export interface Defaulter {
    user_id: string;
    username: string;
    email: string;
    phone: string;
    payment_id: string;
    amount: string;
    currency: string;
    deadline: string;
    days_overdue: number;
    status: string;
    created_at: string;
    metadata?: {
        invoice_number?: string;
        [key: string]: any;
    };
    parcels: Parcel[];
}

// Filter parameters for the API
export interface DefaultersFilters {
    min_days_overdue?: number;
    max_days_overdue?: number;
    currency?: string;
    min_amount?: number;
    ward?: string;
    sub_county?: string;
    county?: string;
    search?: string;
    page?: number;
    page_size?: number;
}

// API response structure
export interface DefaultersResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Defaulter[];
}

// Status badge variant type
export type StatusVariant = 'pending' | 'overdue' | 'paid' | 'default';

// Export column type for type safety
export type DefaulterColumn = ColumnDef<Defaulter>;
