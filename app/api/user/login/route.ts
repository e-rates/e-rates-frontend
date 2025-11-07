import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export interface LoginRequest {
  phonenumber: string;
  password: string;
}

export interface LoginResponse {
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
    const body: LoginRequest = await request.json();
    const { phonenumber, password } = body;

    // Validate input
    if (!phonenumber || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number and password are required',
        },
        { status: 400 }
      );
    }

    // Make API call to your backend
    const backendUrl =
      process.env.BACKEND_API_URL || 'http://localhost:8000/api';
    const response = await axios.post(
      `${backendUrl}/auth/login`,
      {
        phonenumber,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Return the backend response to the frontend
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Login error:', error);

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'An error occurred during login';

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}
