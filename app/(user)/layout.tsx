'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Home, Bell, FileText, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import { FullPageLoader } from '../components/loading-spinner';
import { UserAvatar } from '../components/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Waivers', path: '/waivers', icon: FileText },
];

const iconButton =
  'flex h-9 w-9 items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white';

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { user } = useUserAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && pathname !== '/account' && pathname !== '/account/') {
      router.push('/account');
    } else if (isAuthenticated && authService.mustChangePassword()) {
      router.replace('/change-password');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const signOut = () => {
    logout();
    router.push('/account');
  };

  if (pathname === '/account' || pathname === '/account/') {
    return <div className="min-h-screen bg-white">{children}</div>;
  }
  if (isLoading) return <FullPageLoader text="Authenticating..." variant="gradient" />;
  if (!isAuthenticated) return <div className="min-h-screen bg-white">Redirecting...</div>;


  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            E-rates
          </Link>

          <nav className="hidden h-full items-center gap-1 sm:flex" aria-label="Main">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex h-full items-center gap-2 px-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                  {isActive && <span className="absolute right-3 bottom-0 left-3 h-0.5 bg-neutral-900 dark:bg-white" />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-1 sm:flex">
            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              aria-current={pathname === '/settings' ? 'page' : undefined}
              className={`${iconButton} ${pathname === '/settings' ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white' : ''}`}
            >
              <Settings className="h-[18px] w-[18px]" />
            </Link>
            <button
              onClick={signOut}
              className="ml-1 flex h-9 items-center gap-2 px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
            <span className="ml-2 h-8 w-8 overflow-hidden rounded-full" title={user?.name || user?.phonenumber}>
              <UserAvatar name={user?.name || user?.phonenumber} size={32} />
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Account menu" className="h-9 w-9 shrink-0 overflow-hidden rounded-full sm:hidden">
                <UserAvatar name={user?.name || user?.phonenumber} size={36} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-none!">
              <DropdownMenuItem onSelect={() => router.push('/settings')}>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={signOut}>
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t border-neutral-200 bg-white sm:hidden dark:border-neutral-800 dark:bg-neutral-900"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
                isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <main className="pb-16 sm:pb-0">{children}</main>
    </div>
  );
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserAuthProvider>
        <UserLayoutContent>{children}</UserLayoutContent>
      </UserAuthProvider>
    </QueryClientProvider>
  );
}
