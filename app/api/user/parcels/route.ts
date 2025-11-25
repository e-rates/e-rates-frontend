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

    console.log('📤 Fetching current user info...');

    // First, get the current user's ID
    const userResponse = await fetch('http://127.0.0.1:8000/api/users/me/', {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!userResponse.ok) {
      console.error('❌ Failed to get user info');
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.user_id || userData.id;
    
    console.log('📤 Fetching parcels for user:', userId);

    // Fetch user's parcels with GeoJSON using owner filter
    const response = await fetch(
      `http://127.0.0.1:8000/api/parcels/geojson/?owner=${userId}`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    console.log('📥 Django response status:', response.status);

    let data;
    try {
      data = await response.json();
      console.log('📥 Django response data:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse Django response as JSON');
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('❌ Django error:', data);
      return NextResponse.json(
        { error: data.detail || data.error || 'Failed to fetch user parcels', details: data },
        { status: response.status }
      );
    }

    console.log('✅ Returning user parcels:', Array.isArray(data) ? `${data.length} parcels` : 'response object');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ User parcels fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
