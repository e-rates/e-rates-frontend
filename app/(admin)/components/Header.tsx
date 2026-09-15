'use client';

import Image from 'next/image';
import { RealTimeClock } from '@/app/components/real-time-clock';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { UserAvatar } from '@/app/components/UserAvatar';
import { useState, useEffect } from 'react';
import { userService } from '@/lib/auth';
import { backendJson } from '@/lib/backend';
import { NotificationBell } from './NotificationBell';
import { AskAiButton } from './Assistant/AskAiButton';
import { useNavCollapse } from './NavCollapse';
import { ChevronDown, ChevronUp } from 'lucide-react';

function NavCollapseToggle() {
  const { collapsed, toggle } = useNavCollapse();
  return (
    <button
      onClick={toggle}
      aria-expanded={!collapsed}
      aria-controls="admin-main-nav"
      aria-label={collapsed ? 'Show the menu' : 'Hide the menu'}
      title={collapsed ? 'Show the menu' : 'Hide the menu for more room'}
      className="squircle-lg flex cursor-pointer items-center gap-1.5 px-2.5 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      {collapsed ? 'Expand' : 'Hide'}
    </button>
  );
}

interface AdminProfile {
  user_id?: string;
  username?: string;
  phone_number?: string;
  role?: string;
  county?: string;
  profile_picture?: string;
}

/** County crests we ship; any other county falls back to its initials. */
const COUNTY_LOGOS: Record<string, string> = {
  nairobi: '/NRB-logo.png',
};

const Header = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [countyRecord, setCountyRecord] = useState<{ name: string; logo_url: string | null } | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    backendJson<{ county: { name: string; logo_url: string | null } | null }>('/api/counties/mine/')
      .then((data) => {
        setCountyRecord(data.county);
        setLogoFailed(false);
      })
      .catch(() => setCountyRecord(null));
  }, [profile?.county]);

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

  const county = profile?.county?.trim() || '';
  const isPlatformOwner = profile?.role === 'owner';
  // the crest comes from the county record the owner set up; platform owners see the product name
  const countyLogo = countyRecord?.logo_url || (county ? COUNTY_LOGOS[county.toLowerCase()] : undefined);
  const countyLabel = county ? `${county.toUpperCase()} COUNTY` : isPlatformOwner ? 'E-RATES' : 'N/A';
  const countyInitials = county ? county.slice(0, 2).toUpperCase() : isPlatformOwner ? 'ER' : 'N/A';

  return (
    <header
      className="bg-panel-bg border-border-default sticky top-0 z-[1100] flex h-[60px] w-full items-center justify-between border-b-[0.5px] px-4 backdrop-blur-sm"
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
            src="/kenya-logo.svg"
            alt="Republic of Kenya national emblem"
            width={45}
            height={41.47}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        {/* County Logo */}
        <div className="h-[45px] w-[45px] shrink-0">
          {countyLogo && !logoFailed ? (
            <Image
              src={countyLogo}
              alt={`${county} County government logo`}
              width={45}
              height={45.47}
              className="h-full w-full object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] saturate-[1.15] dark:drop-shadow-none dark:saturate-100"
              unoptimized
              priority
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200">
              {countyInitials}
            </div>
          )}
        </div>
        <div className="flex h-full w-[230px] flex-col justify-between p-0">
          <h1
            className="text-regular-lg font-bold dark:font-normal"
            id="site-title"
          >
            {countyLabel}
          </h1>
          <RealTimeClock className="text-regular-sm font-bold dark:font-normal" />
        </div>
      </div>
      {/* Controls */}
      <nav
        role="navigation"
        aria-label="User controls"
        className="flex items-center space-x-1"
      >
        <NavCollapseToggle />

        <AskAiButton />

        <NotificationBell />

        {/* Admin Profile Picture */}
        <button
          onClick={handleProfileClick}
          className="squircle-lg flex items-center space-x-2 p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="View profile"
        >
          <UserAvatar
            name={profile?.username}
            src={profile?.profile_picture}
            size={32}
          />
        </button>

        <button
          onClick={handleLogout}
          className="squircle-lg flex cursor-pointer items-center p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </nav>
    </header>
  );
};

export default Header;
