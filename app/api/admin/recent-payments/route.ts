import { NextRequest, NextResponse } from 'next/server';

export interface RecentPayment {
  id: number;
  landOwner: string;
  plotNumber: string;
  location: string;
  amount: number;
  date: string;
}

export interface RecentPaymentsResponse {
  success: boolean;
  data?: RecentPayment[];
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
    const limit = parseInt(searchParams.get('limit') || '10');

    return NextResponse.json(
      {
        success: false,
        error: 'Backend API not yet implemented',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Recent payments fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching recent payments',
      },
      { status: 500 }
    );
  }
}
