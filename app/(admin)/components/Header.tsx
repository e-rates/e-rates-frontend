import Image from 'next/image';
import { ThemeToggle } from '@/app/components/theme-toggle';
import { RealTimeClock } from '@/app/components/real-time-clock';

const Header = () => {
  return (
    <header
      className="bg-panel-bg border-border-default sticky top-0 z-50 flex h-[60px] w-full items-center justify-between border-b-[0.5px] px-4"
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
      <nav role="navigation" aria-label="User controls">
        <ThemeToggle />
      </nav>
    </header>
  );
};

export default Header;
