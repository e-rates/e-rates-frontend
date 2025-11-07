import { NextRequest, NextResponse } from 'next/server';

export interface HistoryRecord {
  year: number;
  amount: number;
  date: string;
  status: string;
}

export interface HistoryResponse {
  success: boolean;
  data?: HistoryRecord[];
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

    return NextResponse.json(
      {
        success: false,
        error: 'Backend API not yet implemented',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching history',
      },
      { status: 500 }
    );
  }
}
