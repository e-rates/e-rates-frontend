import { BACKEND_URL } from '@/lib/backend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const username = body?.username;
    const password = body?.password;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    let response: Response;
    try {
      response = await fetch(`${BACKEND_URL}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
    } catch (networkErr) {
      console.error('Network error connecting to backend:', networkErr);
      return NextResponse.json(
        { success: false, error: 'Cannot reach the authentication server. Please ensure the backend service is running.' },
        { status: 503 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    let data: any = null;

    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      console.warn('Backend returned non-JSON response:', response.status, text.slice(0, 120));
    }

    if (!response.ok) {
      let errorMsg = 'Invalid username or password.';
      if (data?.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      } else if (data?.error) {
        errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else if (data?.message) {
        errorMsg = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
      } else if (response.status === 401 || response.status === 400) {
        errorMsg = 'Invalid username or password.';
      } else if (response.status >= 500) {
        errorMsg = 'Authentication service is temporarily unavailable. Please try again later.';
      }

      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: response.status }
      );
    }

    if (!data?.access) {
      return NextResponse.json(
        { success: false, error: 'Sign in succeeded but no access token was returned.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        access: data.access,
        refresh: data.refresh,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during sign in. Please try again.' },
      { status: 500 }
    );
  }
}
