import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export interface LoginRequest {
  phonenumber: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    access: string;
    refresh: string;
  };
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { phonenumber, password } = body;

    if (!phonenumber || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number and password are required',
        },
        { status: 400 }
      );
    }

    const response = await axios.post<TokenResponse>(
      'http://16.16.75.175/api/token/phone/',
      {
        phone: phonenumber,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          access: response.data.access,
          refresh: response.data.refresh,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Invalid credentials';

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}
