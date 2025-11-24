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

    console.log('Forwarding shapefile upload to Django backend...');
    console.log('FormData entries:', Array.from(formData.keys()));
    console.log('source_epsg value:', formData.get('source_epsg'));

    // Forward the request to Django backend (note the trailing slash required by Django)
    let response;
    try {
      response = await fetch(
        'http://127.0.0.1:8000/api/parcels/upload_shapefile/',
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
          },
          body: formData,
        }
      );
    } catch (fetchError) {
      console.error('Failed to connect to Django backend:', fetchError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to connect to backend server. Please ensure the Django server is running on port 8000.',
          imported_count: 0,
          skipped_count: 0,
          error_count: 1,
          errors: ['Backend connection failed: ' + (fetchError instanceof Error ? fetchError.message : 'Unknown error')],
        },
        { status: 503 }
      );
    }

    console.log('Backend response status:', response.status);

    // Handle non-JSON responses (like HTML 404 pages)
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('Backend response data:', data);
    } else {
      const textResponse = await response.text();
      console.error('Backend returned non-JSON response:', textResponse.substring(0, 200));
      return NextResponse.json(
        {
          success: false,
          message: 'Backend endpoint not found or returned invalid response',
          imported_count: 0,
          skipped_count: 0,
          error_count: 1,
          errors: [`Backend returned ${response.status}: ${response.statusText}`],
        },
        { status: response.status }
      );
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
    });
    
    return NextResponse.json(
      {
        success: false,
        message: `Internal server error: ${errorMessage}`,
        imported_count: 0,
        skipped_count: 0,
        error_count: 1,
        errors: [errorMessage],
      },
      { status: 500 }
    );
  }
}
