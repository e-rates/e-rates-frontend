'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { UserX, Download, Sheet } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function DefaultersPage() {
  return (
    <BlurInLoader isLoading={false}>
      <div className="w-full p-6 min-h-screen">
        <div className="mx-auto h-fit max-w-7xl border-b-[0.5px] border-neutral-200 pb-0">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between bg-amber-400">
            <div className="flex items-center gap-3 bg-indigo-300">
              <div>
                <h1 className="text-text-primary text-3xl font-bold">
                  Defaulters
                </h1>
                <p className="text-text-secondary text-sm">
                  Manage overdue payments and follow-ups
                </p>
              </div>
            </div>
            <Button className="gap-2 bg-[#007AFF] text-neutral-200 hover:bg-teal-600">
              <Sheet className='w-4 h-4 ' />
              Export Sheet
            </Button>
          </div>


        </div>
      </div>
    </BlurInLoader>
  );
}
