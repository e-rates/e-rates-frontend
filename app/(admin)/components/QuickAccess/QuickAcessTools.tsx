import { Squircle } from '@/app/components/ui/squircle';
import React from 'react';

const QuickAcessTools = () => {
  return (
    <div className="flex h-[180px] w-full flex-1 flex-col space-y-2 pt-[1.5px]">
      <div>
        <p className="text-regular-md">Quck Access Tools</p>
      </div>
      <Squircle className="bg-panel-bg h-full w-full p-2" smoothing={'ios'}>
        <p>Something here</p>
      </Squircle>
    </div>
  );
};

export default QuickAcessTools;
