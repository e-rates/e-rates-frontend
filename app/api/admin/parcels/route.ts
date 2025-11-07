import { NextRequest, NextResponse } from 'next/server';

export interface Parcel {
  id: string;
  plotNumber: string;
  owner: string;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  area: number; // in square meters
  landUse?: string;
  rateAmount: number;
  lastPaymentDate?: string;
  status: 'active' | 'inactive';
}

export interface ParcelsResponse {
  success: boolean;
  data?: Parcel[];
  total?: number;
  page?: number;
  pageSize?: number;
  message?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const location = searchParams.get('location');
    const owner = searchParams.get('owner');

    const response: ParcelsResponse = {
      success: true,
      data: [],
      total: 0,
      page,
      pageSize,
      message: 'Parcels retrieved successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Parcels fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching parcels',
      },
      { status: 500 }
    );
  }
}
