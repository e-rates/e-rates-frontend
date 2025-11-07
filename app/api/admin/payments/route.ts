import { NextRequest, NextResponse } from 'next/server';

export interface RatePayment {
  id: number;
  parcelId: string;
  owner: string;
  location: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'partial';
  date: string;
  dueDate: string;
  outstandingAmount?: number;
}

export interface PaymentsResponse {
  success: boolean;
  data?: RatePayment[];
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
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');

    return NextResponse.json(
      {
        success: false,
        error: 'Backend API not yet implemented',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Payments fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching payments',
      },
      { status: 500 }
    );
  }
}
