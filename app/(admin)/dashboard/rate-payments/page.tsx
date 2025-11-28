'use client';

import React, { useState } from 'react';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { Download } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
import { AreaChart } from './AreaChart';
import { LineChart } from './LineChart';
import { dailyData, weeklyData, monthlyData } from './data';

const paymentData = [
  { id: 1, name: 'John Doe', parcel: 'Parcel 1267', amount: '$500', date: 'Jan 15, 2024', status: 'Paid' },
  { id: 2, name: 'Sarah Smith', parcel: 'Parcel 1214', amount: '$750', date: 'Jan 14, 2024', status: 'Paid' },
  { id: 3, name: 'Mike Johnson', parcel: 'Parcel 1298', amount: '$1,200', date: 'Jan 12, 2024', status: 'Paid' },
  { id: 4, name: 'Emily Brown', parcel: 'Parcel 1240', amount: '$350', date: 'Jan 10, 2024', status: 'Pending' },
  { id: 5, name: 'David Wilson', parcel: 'Parcel 1207', amount: '$900', date: 'Jan 08, 2024', status: 'Paid' },
];

export default function RatePaymentsPage() {
  const [activeTab, setActiveTab] = useState<'tables' | 'area' | 'line'>('tables');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const indicatorProps = useSpring({
    left: activeTab === 'tables' ? '0px' : activeTab === 'area' ? '82px' : '194px',
    width: activeTab === 'tables' ? '50px' : activeTab === 'area' ? '80px' : '75px',
    config: { tension: 300, friction: 30 },
  });

  const getChartData = () => {
    switch (timeframe) {
      case 'daily': return dailyData;
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      default: return dailyData;
    }
  };

  return (
    <BlurInLoader isLoading={false}>
      <div className="w-full h-full overflow-hidden flex flex-col bg-white dark:bg-neutral-800/30">
        
        {/* Tabs */}
        <div className="w-full border-b border-border-default bg-elevated-surface px-6 pt-3">
          <div className="relative flex gap-8 max-w-5xl mx-auto">
            <button
              onClick={() => setActiveTab('tables')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'tables' ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Tables
            </button>
            <button
              onClick={() => setActiveTab('area')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'area' ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Area Graph
            </button>
            <button
              onClick={() => setActiveTab('line')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'line' ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Line Graph
            </button>
            <animated.div 
              style={indicatorProps}
              className="absolute bottom-0 h-[2px] bg-blue-600 dark:bg-white"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            
            {activeTab === 'tables' ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl text-text-primary font-medium">Rate Payment Records</h2>
                    <p className="text-text-tertiary text-sm mt-1">Track and manage all rate payments</p>
                  </div>
                  <button className="flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 px-4 py-2 text-sm text-white transition-colors">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>

                {/* Payments Table */}
                <div className="squircle-2xl border-[0.5px] border-border-default bg-elevated-surface overflow-hidden">
                  <div className="w-full text-left">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 border-b-[0.5px] border-dashed border-border-default bg-hover-surface px-6 py-4 text-sm font-medium text-text-tertiary">
                      <div className="col-span-3">Name</div>
                      <div className="col-span-2">Parcel</div>
                      <div className="col-span-2">Amount</div>
                      <div className="col-span-3">Date</div>
                      <div className="col-span-2 text-right">Status</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y-[0.5px] divide-dashed divide-border-default">
                      {paymentData.length > 0 ? (
                        paymentData.map((payment) => (
                          <div 
                            key={payment.id} 
                            className="group grid cursor-pointer grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-hover-surface"
                          >
                            <div className="col-span-3 flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${
                                payment.status === 'Paid' ? 'bg-green-500/50' : 'bg-yellow-500/50'
                              }`}></div>
                              <span className="text-sm text-text-secondary group-hover:text-text-primary">
                                {payment.name}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center text-sm text-text-tertiary">
                              {payment.parcel}
                            </div>
                            <div className="col-span-2 flex items-center text-sm text-text-primary font-medium">
                              {payment.amount}
                            </div>
                            <div className="col-span-3 flex items-center text-sm text-text-tertiary">
                              {payment.date}
                            </div>
                            <div className="col-span-2 flex items-center justify-end">
                              <span className={`text-sm px-2 py-1 rounded-full ${
                                payment.status === 'Paid' 
                                  ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                                  : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
                          <Download className="mb-2 h-8 w-8 opacity-20" />
                          <p>No payment records found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : activeTab === 'area' ? (
              /* Area Graph View */
              <div className="space-y-6">
                {/* Header with Timeframe Selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl text-text-primary font-medium">Payment Volume Analytics</h2>
                    <p className="text-text-tertiary text-sm mt-1">Visualize payment trends over time</p>
                  </div>
                  
                  {/* Timeframe Buttons */}
                  <div className="flex gap-2 rounded-lg bg-elevated-surface p-1">
                    <button
                      onClick={() => setTimeframe('daily')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        timeframe === 'daily' 
                          ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                          : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setTimeframe('weekly')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        timeframe === 'weekly' 
                          ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                          : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setTimeframe('monthly')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        timeframe === 'monthly' 
                          ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                          : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Area Chart */}
                <AreaChart data={getChartData()} timeframe={timeframe} />
              </div>
            ) : (
              /* Line Graph View */
              <div className="space-y-6">
                {/* Header with Timeframe Selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl text-text-primary font-medium">Payment Volume Analytics</h2>
                    <p className="text-text-tertiary text-sm mt-1">Visualize payment trends over time</p>
                  </div>
                  
                  {/* Timeframe Buttons */}
                  <div className="flex gap-2 rounded-lg bg-elevated-surface p-1">
                    <button
                      onClick={() => setTimeframe('daily')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        timeframe === 'daily' 
                          ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                          : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setTimeframe('weekly')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        timeframe === 'weekly' 
                          ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                          : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setTimeframe('monthly')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        timeframe === 'monthly' 
                          ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                          : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Line Chart */}
                <LineChart data={getChartData()} timeframe={timeframe} />
              </div>
            )}

          </div>
        </div>
      </div>
    </BlurInLoader>
  );
}
