import { BACKEND_URL } from '@/lib/backend';
import { NextRequest, NextResponse } from 'next/server';

export interface ShapefileUploadResponse {
  success: boolean;
  message: string;
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors: string[];
  shapefile_info?: {
    layer_name: string;
    feature_count: number;
    geometry_type: string;
    srid: number;
    fields: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          imported_count: 0,
          skipped_count: 0,
          error_count: 1,
          errors: ['No authentication token provided'],
        },
        { status: 401 }
      );
    }

    // Get the form data
    const formData = await request.formData();

    // Forward the request to the backend API
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/parcels/upload_shapefile/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Upload failed',
          imported_count: 0,
          skipped_count: 0,
          error_count: 1,
          errors: data.errors || [data.message || 'Unknown error'],
        },
        { status: backendResponse.status }
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
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
  }
}
