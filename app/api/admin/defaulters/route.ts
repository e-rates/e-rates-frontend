import { NextRequest, NextResponse } from 'next/server';

export interface Defaulter {
  id: number;
  parcelId: string;
  owner: string;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  totalOwed: number;
  monthsOverdue: number;
  lastPaymentDate: string;
  dueDate: string;
  contactPhone?: string;
}

export interface DefaultersResponse {
  success: boolean;
  data?: Defaulter[];
  total?: number;
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
    const minMonthsOverdue = searchParams.get('minMonthsOverdue');
    const location = searchParams.get('location');

    return NextResponse.json(
      {
        success: false,
        error: 'Backend API not yet implemented',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Defaulters fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching defaulters',
      },
      { status: 500 }
    );
  }
}
