import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await authService.getValidAccessToken();
      setIsAuthenticated(!!token);

      if (token) {
        const role = authService.getUserRole();
        setUserRole(role);
        setIsAdmin(authService.isAdmin());
      } else {
        setUserRole(null);
        setIsAdmin(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserRole(null);
    setIsAdmin(false);
  };

  return {
    isAuthenticated,
    isLoading,
    userRole,
    isAdmin,
    logout,
    checkAuth,
  };
}
