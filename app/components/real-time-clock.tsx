'use client';

import { useEffect, useState } from 'react';

interface RealTimeClockProps {
  className?: string;
}

export function RealTimeClock({ className = '' }: RealTimeClockProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);

    // Update time immediately when component mounts
    setCurrentTime(new Date());

    // Update every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Prevent hydration mismatch by not rendering on server
  if (!mounted) {
    return <time className={className}>Loading...</time>;
  }

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    const timeString = date.toLocaleString('en-US', options);
    // Add spaces around colons for better visual spacing
    return timeString.replace(/:/g, ' : ');
  };

  return (
    <time
      className={className}
      dateTime={currentTime.toISOString()}
      suppressHydrationWarning
    >
      {formatTime(currentTime)}
    </time>
  );
}
