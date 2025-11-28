'use client';

import React from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { useSpring, animated } from '@react-spring/web';

const ReportCard = ({ title, description, delay }: { title: string, description: string, delay: number }) => {
  const props = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay,
    config: { tension: 280, friction: 20 },
  });

  return (
    <animated.div style={props} className="group squircle-2xl relative cursor-pointer border-[0.5px] border-border-default bg-elevated-surface p-6 transition-all hover:bg-hover-surface hover:border-border-hover">
      <h3 className="text-lg font-medium text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-tertiary">
        {description}
      </p>
    </animated.div>
  );
};

export default function ReportsPage() {
  return (
    <BlurInLoader isLoading={false}>
      <div className="h-full w-full overflow-y-auto bg-white dark:bg-neutral-800/30 p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl text-regular-lg text-text-primary">Reports and Analytics</h1>
            <p className="text-muted-foreground text-regular-md mt-1">
              Generate insights and export data
            </p>
          </div>

          {/* Time-based Reports */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ReportCard 
              title="Daily Report" 
              description="View detailed transaction and activity logs for today."
              delay={100}
            />
            <ReportCard 
              title="Weekly Report" 
              description="Analyze performance and trends over the last 7 days."
              delay={200}
            />
            <ReportCard 
              title="Monthly Reports" 
              description="Comprehensive summary of monthly activities and stats."
              delay={300}
            />
          </div>

          {/* Dashed Separator */}
          <div className="border-b-[0.5px] border-dashed border-border-default"></div>

          {/* Special Reports */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ReportCard 
              title="Defaulters Reports" 
              description="Identify and track accounts with outstanding payments."
              delay={400}
            />
            <ReportCard 
              title="Rate Payment Reports" 
              description="Monitor payment collection and revenue trends."
              delay={500}
            />
          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
