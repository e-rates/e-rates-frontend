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
    user: {
      id: string;
      phonenumber: string;
      name?: string;
    };
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
      'http://127.0.0.1:8000/api/token/phone/',
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

    // Fetch user data using the access token
    const userResponse = await axios.get(
      'http://127.0.0.1:8000/api/users/me/',
      {
        headers: {
          Authorization: `Bearer ${response.data.access}`,
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          access: response.data.access,
          refresh: response.data.refresh,
          user: {
            id: userResponse.data.id,
            phonenumber: userResponse.data.phonenumber || phonenumber,
            name: userResponse.data.name || userResponse.data.username,
          },
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
