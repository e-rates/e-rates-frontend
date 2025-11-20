import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const county = searchParams.get('county');
    const sub_county = searchParams.get('sub_county');
    const ward = searchParams.get('ward');

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (county) params.append('county', county);
    if (sub_county) params.append('sub_county', sub_county);
    if (ward) params.append('ward', ward);

    const queryString = params.toString();
    const url = `http://127.0.0.1:8080/api/parcels/available_for_allocation/${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch available parcels' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Available parcels error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
