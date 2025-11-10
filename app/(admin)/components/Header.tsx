'use client';

import Image from 'next/image';
import { ThemeToggle } from '@/app/components/theme-toggle';
import { RealTimeClock } from '@/app/components/real-time-clock';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LogOut, Crown, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { userService } from '@/lib/auth';

interface AdminProfile {
  user_id?: string;
  username?: string;
  phone_number?: string;
  role?: string;
  profile_picture?: string;
}

const Header = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success && response.data) {
          setProfile(response.data);
        } else if (response.user_id) {
          setProfile(response);
        }
      } catch (err) {
        console.error('Failed to load admin profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/admin-login';
  };

  const handleProfileClick = () => {
    router.push('/dashboard/account');
  };

  return (
    <header
      className="bg-panel-bg border-border-default sticky top-0 z-50 flex h-[60px] w-full items-center justify-between border-b-[0.5px] px-4 backdrop-blur-sm"
      role="banner"
      aria-label="Site header"
    >
      {/* Logo and Time */}
      <div
        className="flex h-[45px] w-80 items-center gap-4"
        role="group"
        aria-label="Site branding and current time"
      >
        {/* Kenya-logo */}
        <div className="h-[41.47px] w-[45px] bg-[#9e9b9b41] dark:bg-[#2E2E2E]">
          <Image
            src="/kenya-logo.png"
            alt="Republic of Kenya national emblem"
            width={45}
            height={41.47}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        {/* County Logo */}
        <div>
          <Image
            src="/NRB-logo.png"
            alt="Nairobi County government logo"
            width={45}
            height={45.47}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <div className="flex h-full w-[230px] flex-col justify-between p-0">
          <h1
            className="text-regular-lg font-bold dark:font-normal"
            id="site-title"
          >
            NAIROBI COUNTY
          </h1>
          <RealTimeClock className="text-regular-sm font-bold dark:font-normal" />
        </div>
      </div>
      {/* Controls */}
      <nav
        role="navigation"
        aria-label="User controls"
        className="flex items-center space-x-3"
      >
        {/* Admin Profile Picture */}
        <button
          onClick={handleProfileClick}
          className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="View profile"
        >
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-neutral-800">
              {profile?.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt="Admin profile"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {profile?.username || 'Admin'}
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          aria-label="Log out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
        <ThemeToggle />
      </nav>
    </header>
  );
};

export default Header;
