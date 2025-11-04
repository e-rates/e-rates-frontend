'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home when accessing /dashboard
    router.push('/dashboard/home');
  }, [router]);

  return null;
}
