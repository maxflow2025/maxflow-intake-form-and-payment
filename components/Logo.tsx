import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center py-3 px-4 w-full">
      <div className="bg-black border border-yellow-500/30 rounded-xl px-3 py-2 shadow-lg w-full flex justify-center">
        <div className="text-yellow-500 font-black tracking-wide text-lg">
          MAX<span className="text-white">FLOW</span>
        </div>
      </div>

      <div className="text-[10px] text-gray-200 font-black tracking-[0.2em] mt-2 uppercase text-center">
        TRAFFIC CONTROL AND THERMOPLASTIC LLC
      </div>

      <div className="text-[9px] text-yellow-500 font-mono mt-0.5 font-bold">
        1-888-912-8999
      </div>
    </div>
  );
};