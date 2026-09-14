import { BACKEND_URL } from '@/lib/backend';
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

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json().catch(() => ({ phonenumber: '', password: '' }));
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
      `${BACKEND_URL}/api/token/phone/`,
      {
        phone: phonenumber,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
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
    console.error('User login error:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot reach the authentication server. Please ensure the backend service is running.',
          },
          { status: 503 }
        );
      }

      const status = error.response?.status || 500;
      let errorMessage = 'Invalid phone number or password.';

      const respData = error.response?.data;
      if (typeof respData === 'object' && respData !== null) {
        errorMessage =
          respData.detail ||
          respData.error ||
          respData.message ||
          (status === 401 ? 'Invalid phone number or password.' : 'Sign in failed. Please check your credentials.');
      } else if (typeof respData === 'string' && !respData.includes('<!DOCTYPE') && !respData.includes('<html')) {
        errorMessage = respData;
      } else if (status >= 500) {
        errorMessage = 'Authentication service is temporarily unavailable. Please try again later.';
      }

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
        error: 'An unexpected error occurred during sign in. Please try again.',
      },
      { status: 500 }
    );
  }
}
