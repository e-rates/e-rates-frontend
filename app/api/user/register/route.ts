import { NextRequest, NextResponse } from 'next/server';

export interface RegisterRequest {
  phonenumber: string;
  password: string;
  name: string;
  email?: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      phonenumber: string;
      name: string;
      email?: string;
    };
    token: string;
  };
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { phonenumber, password, name, email } = body;

    // Validate input
    if (!phonenumber || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number, password, and name are required',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Backend API not yet implemented',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during registration',
      },
      { status: 500 }
    );
  }
}
