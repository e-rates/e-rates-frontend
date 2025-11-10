import { NextRequest, NextResponse } from 'next/server';

export interface ParcelDetailsResponse {
  success: boolean;
  data?: {
    id: string;
    plotNumber: string;
    owner: string;
    location: string;
    coordinates: [number, number];
    area: number;
    landUse?: string;
    rateAmount: number;
    lastPaymentDate?: string;
    status: 'active' | 'inactive';
    paymentHistory?: Array<{
      year: number;
      amount: number;
      date: string;
      status: string;
    }>;
  };
  message?: string;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ plotnumber: string }> }
) {
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

    const { plotnumber } = await params;

    return NextResponse.json(
      {
        success: false,
        error: 'Backend API not yet implemented',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Parcel details fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching parcel details',
      },
      { status: 500 }
    );
  }
}
