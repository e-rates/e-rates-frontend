import { BACKEND_URL } from '@/lib/backend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { refresh } = await request.json();

    if (!refresh) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Token refresh failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      access: data.access,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
