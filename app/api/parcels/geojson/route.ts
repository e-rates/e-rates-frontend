import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = 'http://5.189.150.44';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('📡 API Route - Proxying to Django with params:', params);
    console.log('📡 API Route - Full URL:', `${BACKEND_URL}/api/parcels/geojson/`);

    const response = await axios.get(`${BACKEND_URL}/api/parcels/geojson/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    console.log('Django response:', {
      status: response.status,
      type: response.data?.type,
      count: response.data?.features?.length,
    });

    // Return raw GeoJSON from Django (not wrapped) with no-cache headers
    return NextResponse.json(response.data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.detail || error.message },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
