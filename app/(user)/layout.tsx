'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Bell, FileText } from 'lucide-react';
import { ThemeToggle } from '../components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import MobileSettings from './components/settings/settings';
import Account from './components/Account/account';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import { FullPageLoader } from '../components/loading-spinner';
import { useAuth } from '@/hooks/useAuth';

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Debug logging
  console.log('UserLayout:', { pathname, isAuthenticated, isLoading });

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      pathname !== '/account' &&
      pathname !== '/account/'
    ) {
      router.push('/account');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Waivers', path: '/waivers', icon: FileText },
  ];

  const dropdownStyles = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen
      ? 'translateY(0px) scale(1)'
      : 'translateY(-10px) scale(0.95)',
    config: config.gentle,
  });

  const pageStyles = useSpring({
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: config.gentle,
    reset: true,
    key: pathname,
  });

  // Special layout for account/login page - no navigation, just show content
  if (pathname === '/account' || pathname === '/account/') {
    return (
      <div style={{ background: 'white', minHeight: '100vh' }}>{children}</div>
    );
  }

  if (isLoading) {
    return <FullPageLoader text="Authenticating..." variant="gradient" />;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ background: 'white', minHeight: '100vh' }}>
        Redirecting...
      </div>
    );
  }

  return (
    <div className="w-100vw relative m-0 min-h-screen p-0">
      {/* Backdrop blur overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-500" />
      )}

      <nav className="sticky top-0 z-50 bg-white dark:bg-neutral-900">
        <div className="flex h-[60px] w-full flex-row items-center justify-between px-2 md:justify-center md:gap-8">
          <div>
            <h1 className="text-2xl tracking-tight text-neutral-900 dark:text-neutral-100">
              E-rates
            </h1>
          </div>

          <div className="flex h-[100px] flex-row items-center justify-center px-2">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <div className="w-fit">
                {' '}
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 overflow-hidden rounded-full transition-all hover:ring-2 hover:ring-white/20">
                    <img
                      src="/avatar.svg"
                      alt="user"
                      className="h-full w-full object-cover"
                    />
                  </button>
                </DropdownMenuTrigger>
              </div>

              <DropdownMenuContent
                className="relative mt-4 mr-2 h-full w-[150px] space-y-2"
                asChild
              >
                <animated.div style={dropdownStyles}>
                  <div className="mr-2 flex h-fit w-full flex-row items-center">
                    <MobileSettings />
                  </div>
                  <div className="mr-2 flex h-fit w-full flex-row items-center">
                    <Account />
                  </div>
                  <div className="mr-2 flex h-fit w-full flex-row items-center">
                    <ThemeToggle />
                  </div>
                </animated.div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="sticky top-[60px] z-40 flex h-16 w-full items-center justify-center border-b border-neutral-200 bg-white/90 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90">
        <div
          className={`flex h-full items-center justify-center space-x-8 px-8 ${
            pathname === '/account'
              ? 'md:w-auto md:bg-white/50 md:px-12 md:backdrop-blur-sm md:dark:bg-black/20'
              : 'w-full'
          }`}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`group relative flex flex-col items-center gap-1 px-4 py-2 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                />
                <span
                  className={`text-sm font-medium transition-all duration-200 ${isActive ? 'font-semibold' : ''}`}
                >
                  {item.name}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content with animation */}
      <animated.main style={pageStyles}>{children}</animated.main>
    </div>
  );
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserAuthProvider>
      <UserLayoutContent>{children}</UserLayoutContent>
    </UserAuthProvider>
  );
}
