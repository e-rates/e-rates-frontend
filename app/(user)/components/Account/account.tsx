'use client';

import { User2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useUserAuth } from '../../context/UserAuthContext';

const Account = () => {
  const { logout } = useUserAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/account');
  };

  return (
    <div className="bg-elevated-surface dark:border-border-default/20 flex h-full w-full flex-row items-center justify-between rounded-lg border-[0.5px] border-neutral-300/30 px-2 py-2">
      <button
        onClick={handleLogout}
        className="flex w-full flex-row items-center gap-[3px] space-x-2 px-4"
      >
        <User2 size={15} />
        <p className="text-regular-md tracking-tight">Log out</p>
      </button>
    </div>
  );
};

export default Account;
