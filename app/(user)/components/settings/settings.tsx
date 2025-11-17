import { Settings, Settings2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const MobileSettings = () => {
  return (
    <div className="squircle-lg bg-elevated-surface dark:border-border-default/20 flex h-full w-full flex-row items-center justify-between border-[0.5px] border-neutral-300/30 px-2 py-2">
      <Link
        href={'/settings'}
        className="flex w-full flex-row items-center gap-[3px] space-x-2 px-4"
      >
        {' '}
        <Settings2 size={15} />
        <p className="text-regular-md tracking-tight">Settings</p>
      </Link>
    </div>
  );
};

export default MobileSettings;
