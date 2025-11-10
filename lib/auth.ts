import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://192.168.0.104:8001/api';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface DecodedToken {
  user_id: number;
  exp: number;
  role?: string;
  [key: string]: any;
}

const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
};

export const authService = {
  async loginWithPhone(
    phone: string,
    password: string
  ): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>(
      `${API_BASE_URL}/token/phone/`,
      {
        phone,
        password,
      }
    );

    const { access, refresh } = response.data;

    this.setTokens(access, refresh);

    return response.data;
  },

  async loginWithUsername(
    username: string,
    password: string
  ): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>(`${API_BASE_URL}/token/`, {
      username,
      password,
    });

    const { access, refresh } = response.data;

    this.setTokens(access, refresh);

    return response.data;
  },

  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<{ access: string }>(
        `${API_BASE_URL}/token/refresh/`,
        {
          refresh: refreshToken,
        }
      );

      const { access } = response.data;
      this.setAccessToken(access);

      return access;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    try {
      await axios.post(`${API_BASE_URL}/token/verify/`, {
        token,
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  setTokens(access: string, refresh: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEYS.ACCESS, access);
      localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
    }
  },

  setAccessToken(access: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    }
  },

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEYS.ACCESS);
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEYS.REFRESH);
    }
    return null;
  },

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEYS.ACCESS);
      localStorage.removeItem(TOKEN_KEYS.REFRESH);
    }
  },

  decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.role || null;
  },

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'admin';
  },

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },

  isAccessTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  },

  async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      return null;
    }

    if (!this.isTokenExpired(accessToken)) {
      return accessToken;
    }

    try {
      return await this.refreshAccessToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  },

  logout(): void {
    this.clearTokens();
  },
};

export const createAuthAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
  });

  instance.interceptors.request.use(
    async (config) => {
      const token = await authService.getValidAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await authService.refreshAccessToken();

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          authService.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/account';
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const authAxios = createAuthAxiosInstance();

// User profile service
export const userService = {
  async getProfile() {
    const response = await fetch('/api/users/me/', {
      headers: {
        Authorization: `Bearer ${await authService.getValidAccessToken()}`,
      },
    });
    const result = await response.json();
    return result;
  },
};
