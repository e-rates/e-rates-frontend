import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    console.log('📤 Forwarding allocation to Django:', body);

    const response = await fetch(
      'http://127.0.0.1:8000/api/parcels/allocate_parcel/',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    
    console.log('📥 Django response status:', response.status);
    console.log('📥 Django response data:', data);

    if (!response.ok) {
      console.error('❌ Django allocation failed:', data);
      return NextResponse.json(
        { error: data.error || data.detail || data.message || 'Failed to allocate parcel', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Allocate parcel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
