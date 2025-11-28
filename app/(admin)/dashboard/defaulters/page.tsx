'use client';

import React, { useState, useRef } from 'react';
import { Plus, Mic, Send, Clock } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
import { AreaChart } from './AreaChart';
import { LineChart } from './LineChart';
import { dailyData, weeklyData, monthlyData } from './data';

const defaultersData = [
  { id: 1, name: 'John Doe', parcel: 'Parcel 1267', amount: '$500', dueDate: '2 days overdue' },
  { id: 2, name: 'Sarah Smith', parcel: 'Parcel 1214', amount: '$750', dueDate: '5 days overdue' },
  { id: 3, name: 'Mike Johnson', parcel: 'Parcel 1298', amount: '$1,200', dueDate: '10 days overdue' },
  { id: 4, name: 'Emily Brown', parcel: 'Parcel 1240', amount: '$350', dueDate: '1 day overdue' },
  { id: 5, name: 'David Wilson', parcel: 'Parcel 1207', amount: '$900', dueDate: '7 days overdue' },
];

export default function DefaultersPage() {
  const [text, setText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'tables' | 'area' | 'line'>('chat');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const indicatorProps = useSpring({
    left: activeTab === 'chat' ? '0px' : activeTab === 'tables' ? '62px' : activeTab === 'area' ? '184px' : '296px',
    width: activeTab === 'chat' ? '40px' : activeTab === 'tables' ? '80px' : activeTab === 'area' ? '80px' : '75px',
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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setText(target.value);
    
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white dark:bg-neutral-800/30">
      
      {/* Tabs */}
      <div className="w-full border-b border-border-default bg-elevated-surface px-6 pt-3">
        <div className="relative flex gap-8 max-w-5xl mx-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'chat' ? 'text-text-primary dark:text-white' : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'tables' ? 'text-text-primary dark:text-white' : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
            }`}
          >
            View Tables
          </button>
          <button
            onClick={() => setActiveTab('area')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'area' ? 'text-text-primary dark:text-white' : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
            }`}
          >
            Area Graph
          </button>
          <button
            onClick={() => setActiveTab('line')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'line' ? 'text-text-primary dark:text-white' : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
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
      {activeTab === 'chat' ? (
        <>
          {/* Scrollable Content Area - Takes up remaining space */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
            <div className="opacity-50 text-text-primary dark:text-white font-medium text-lg">
              <p className='tracking-normal text-[14px] text-text-tertiary dark:text-neutral-500'>Chat interface will be shown here...</p>
            </div>
          </div>
          
          {/* Bottom Input Section - FIXED at bottom, never moves */}
          <div className="w-full p-4 shrink-0">
            <div className='bg-elevated-surface dark:bg-neutral-900 w-full max-w-3xl mx-auto border-[0.5px] text-[14px] text-text-primary dark:text-neutral-200 border-border-default dark:border-neutral-600/80 min-h-[52px] h-fit flex flex-row px-3 py-2 gap-3 justify-start items-end rounded-[28px] shadow-lg transition-colors focus-within:bg-hover-surface dark:focus-within:bg-neutral-800'>
              
              {/* Left Action Button */}
              <button className="p-2 text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200 hover:bg-hover-surface dark:hover:bg-neutral-700 rounded-full transition-all mb-0.5">
                <Plus className="w-5 h-5" />
              </button>

              {/* Auto-Growing Textarea */}
              <textarea 
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                placeholder='Ask Reli Anything' 
                rows={1}
                className='bg-transparent flex-1 max-h-[200px] py-3 resize-none focus:outline-none w-full overflow-y-auto scrollbar-hide placeholder:text-text-tertiary dark:placeholder:text-neutral-500'
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                } as React.CSSProperties}
              />

              {/* Right Action Buttons */}
              {text.length > 0 ? (
                 <button 
                 onClick={() => { 
                   setText(''); 
                   if (textareaRef.current) {
                     textareaRef.current.style.height = 'auto';
                   }
                 }}
                 className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all mb-0.5">
                   <Send className="w-4 h-4 ml-0.5" />
                 </button>
              ) : (
                <button className="p-2 text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200 hover:bg-hover-surface dark:hover:bg-neutral-700 rounded-full transition-all mb-0.5">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <p className="text-center text-[10px] text-red-400 dark:text-rose-200 mt-2 opacity-70">
              Reli can make mistakes. Please double check responses.
            </p>
          </div>
        </>
      ) : activeTab === 'tables' ? (
        /* Table View */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div>
              <h2 className="text-xl text-text-primary dark:text-white font-medium">Defaulters List</h2>
              <p className="text-text-tertiary dark:text-neutral-400 text-sm mt-1">Accounts with outstanding payments</p>
            </div>

            {/* Defaulters Table */}
            <div className="squircle-2xl border-[0.5px] border-border-default dark:border-neutral-600/10 bg-elevated-surface dark:bg-neutral-800/20 overflow-hidden">
              <div className="w-full text-left">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 border-b-[0.5px] border-dashed border-border-default dark:border-neutral-600/30 bg-hover-surface dark:bg-neutral-800/40 px-6 py-4 text-sm font-medium text-text-tertiary dark:text-neutral-400">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Parcel</div>
                  <div className="col-span-3">Amount Due</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>

                {/* Table Body */}
                <div className="divide-y-[0.5px] divide-dashed divide-border-default dark:divide-neutral-600/10">
                  {defaultersData.length > 0 ? (
                    defaultersData.map((defaulter) => (
                      <div 
                        key={defaulter.id} 
                        className="group grid cursor-pointer grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-hover-surface dark:hover:bg-neutral-800/40"
                      >
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-red-500/50"></div>
                          <span className="text-sm text-text-secondary dark:text-neutral-200 group-hover:text-text-primary dark:group-hover:text-white">
                            {defaulter.name}
                          </span>
                        </div>
                        <div className="col-span-3 flex items-center text-sm text-text-tertiary dark:text-neutral-400">
                          {defaulter.parcel}
                        </div>
                        <div className="col-span-3 flex items-center text-sm text-text-primary dark:text-neutral-200 font-medium">
                          {defaulter.amount}
                        </div>
                        <div className="col-span-3 flex items-center justify-end text-sm text-red-400">
                          {defaulter.dueDate}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-text-tertiary dark:text-neutral-500">
                      <Clock className="mb-2 h-8 w-8 opacity-20" />
                      <p>No defaulters found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'area' ? (
        /* Area Graph View */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header with Timeframe Selector */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-text-primary dark:text-white font-medium">Defaulter Analytics</h2>
                <p className="text-text-tertiary dark:text-neutral-400 text-sm mt-1">Visualize defaulter trends over time</p>
              </div>
              
              {/* Timeframe Buttons */}
              <div className="flex gap-2 rounded-lg bg-elevated-surface dark:bg-neutral-800/40 p-1">
                <button
                  onClick={() => setTimeframe('daily')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeframe === 'daily' 
                      ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                      : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeframe('weekly')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeframe === 'weekly' 
                      ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                      : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeframe('monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeframe === 'monthly' 
                      ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                      : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Area Chart */}
            <AreaChart data={getChartData()} timeframe={timeframe} />
          </div>
        </div>
      ) : (
        /* Line Graph View */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header with Timeframe Selector */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-text-primary dark:text-white font-medium">Defaulter Analytics</h2>
                <p className="text-text-tertiary dark:text-neutral-400 text-sm mt-1">Visualize defaulter trends over time</p>
              </div>
              
              {/* Timeframe Buttons */}
              <div className="flex gap-2 rounded-lg bg-elevated-surface dark:bg-neutral-800/40 p-1">
                <button
                  onClick={() => setTimeframe('daily')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeframe === 'daily' 
                      ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                      : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeframe('weekly')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeframe === 'weekly' 
                      ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                      : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeframe('monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeframe === 'monthly' 
                      ? 'bg-blue-600 text-white dark:bg-neutral-700' 
                      : 'text-text-tertiary dark:text-neutral-400 hover:text-text-secondary dark:hover:text-neutral-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Line Chart */}
            <LineChart data={getChartData()} timeframe={timeframe} />
          </div>
        </div>
      )}

    </div>
  );
}