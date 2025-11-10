'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '../components/theme-toggle';
import Header from './components/Header';
import { useAuth } from '@/hooks/useAuth';
import { FullPageLoader } from '../components/loading-spinner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        if (pathname !== '/admin-login') {
          router.push('/admin-login');
        }
      } else if (pathname === '/admin-login') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, pathname, router]);

  if (isLoading) {
    return <FullPageLoader text="Authenticating..." variant="gradient" />;
  }

  if (pathname === '/admin-login') {
    return <>{children}</>;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="bg-main-bg mx-auto min-h-screen w-full max-w-[1366px] px-2">
      <Header />
      <div>{children}</div>
    </div>
  );
}
