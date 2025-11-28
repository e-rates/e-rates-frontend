'use client';

import React, { useState, useRef } from 'react';
import { Plus, Mic, Send } from 'lucide-react';

export default function DefaultersPage() {
  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setText(target.value);
    
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      
      {/* Scrollable Content Area - Takes up remaining space */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
        <div className="opacity-50 text-white font-medium text-lg">
          <p className='tracking-normal text-[14px] text-neutral-500'>Tables will be shown  here...</p>
        </div>
      </div>
      
      {/* Bottom Input Section - FIXED at bottom, never moves */}
      <div className="w-full p-4  border-t  shrink-0">
        <div className='bg-neutral-900 w-full max-w-3xl mx-auto border-[0.5px] text-[14px] text-neutral-200 border-neutral-600/80 min-h-[52px] h-fit flex flex-row px-3 py-2 gap-3 justify-start items-end rounded-[28px] shadow-lg transition-colors focus-within:bg-neutral-800'>
          
          {/* Left Action Button */}
          <button className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded-full transition-all mb-0.5">
            <Plus className="w-5 h-5" />
          </button>

          {/* Auto-Growing Textarea */}
          <textarea 
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            placeholder='Ask Reli Anything' 
            rows={1}
            className='bg-transparent flex-1 max-h-[200px] py-3 resize-none focus:outline-none w-full overflow-y-auto scrollbar-hide placeholder:text-neutral-500'
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
             className="p-2 bg-white text-black rounded-full hover:bg-neutral-200 transition-all mb-0.5">
               <Send className="w-4 h-4 ml-0.5" />
             </button>
          ) : (
            <button className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded-full transition-all mb-0.5">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <p className="text-center text-[10px] text-rose-200 mt-2 opacity-70">
          Reli can make mistakes. Please double check responses.
        </p>
      </div>

    </div>
  );
}