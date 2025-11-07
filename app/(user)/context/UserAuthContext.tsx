'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface UserAuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (userData: UserData, token: string) => void;
  logout: () => void;
  loading: boolean;
}

interface UserData {
  id: string;
  phonenumber: string;
  name?: string;
  // Add other user fields as needed
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

const USER_TOKEN_COOKIE = 'user_auth_token';
const USER_DATA_COOKIE = 'user_data';

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const token = Cookies.get(USER_TOKEN_COOKIE);
    const userData = Cookies.get(USER_DATA_COOKIE);

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        // Clear invalid cookies
        Cookies.remove(USER_TOKEN_COOKIE);
        Cookies.remove(USER_DATA_COOKIE);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: UserData, token: string) => {
    // Set cookies with 7 days expiration
    Cookies.set(USER_TOKEN_COOKIE, token, { expires: 7 });
    Cookies.set(USER_DATA_COOKIE, JSON.stringify(userData), { expires: 7 });

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Remove cookies
    Cookies.remove(USER_TOKEN_COOKIE);
    Cookies.remove(USER_DATA_COOKIE);

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserAuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}
