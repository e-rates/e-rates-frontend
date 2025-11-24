import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    // Forward the request to Django backend
    const response = await fetch(
      'http://127.0.0.1:8080/api/parcels/upload_shapefile/',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Upload failed',
          imported_count: data.imported_count || 0,
          skipped_count: data.skipped_count || 0,
          error_count: data.error_count || 1,
          errors: data.errors || [data.message || 'Upload failed'],
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Shapefile upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        imported_count: 0,
        skipped_count: 0,
        error_count: 1,
        errors: ['Internal server error'],
      },
      { status: 500 }
    );
  }
}
