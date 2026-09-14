import { BACKEND_URL } from '@/lib/backend';
import { proxyToBackend } from '@/lib/proxy';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Forward the request to Django backend
    const response = await fetch(`${BACKEND_URL}/api/users/me/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || 'Failed to fetch profile' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  return proxyToBackend(request, '/api/users/me/', { method: 'PATCH', body: await request.text() });
}
