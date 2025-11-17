import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8080';

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

    console.log('Proxying to Django:', `${BACKEND_URL}/api/parcels/geojson`);

    const response = await axios.get(`${BACKEND_URL}/api/parcels/geojson`, {
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

    // Return raw GeoJSON from Django (not wrapped)
    return NextResponse.json(response.data, { status: 200 });
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
