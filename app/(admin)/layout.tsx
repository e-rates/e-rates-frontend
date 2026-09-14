'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './components/Header';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { FullPageLoader } from '../components/loading-spinner';
import { isRouteAllowed } from './components/menu/menuData';
import { NavCollapseProvider } from './components/NavCollapse';
import { IdleTimeout } from './components/IdleTimeout';
import { AiPanelProvider } from './components/Assistant/AskAiButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, userRole } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        if (pathname !== '/admin-login' && pathname !== '/admin-login/') {
          router.push('/admin-login');
        }
      } else if (authService.mustChangePassword()) {
        router.replace('/change-password');
      } else if (pathname === '/admin-login' || pathname === '/admin-login/') {
        router.push('/dashboard');
      } else if (!isRouteAllowed(userRole, pathname)) {
        router.replace('/dashboard/home');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, userRole, pathname, router]);

  if (pathname === '/admin-login' || pathname === '/admin-login/') {
    return (
      <div style={{ background: 'white', minHeight: '100vh' }}>{children}</div>
    );
  }

  if (isLoading) {
    return <FullPageLoader text="Authenticating..." variant="gradient" />;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div style={{ background: 'white', minHeight: '100vh' }}>
        Redirecting...
      </div>
    );
  }

  return (
    <NavCollapseProvider>
      <AiPanelProvider>
        <div className="bg-white dark:bg-neutral-800/30 mx-auto min-h-screen w-full max-w-[1366px] px-2">
          <IdleTimeout />
          <Header />
          <div>{children}</div>
        </div>
      </AiPanelProvider>
    </NavCollapseProvider>
  );
}
