
import React from 'react';
import { Logo } from './Logo';

interface StepWrapperProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  isTestMode?: boolean;
  children: React.ReactNode;
}

export const StepWrapper: React.FC<StepWrapperProps> = ({
  title,
  currentStep,
  totalSteps,
  isTestMode = false,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-start px-4 py-6 md:p-8">
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="w-full max-w-md mb-4 bg-red-600/20 border border-red-500/50 rounded-xl px-4 py-2 text-center">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">
            TEST MODE — No data is saved or charged
          </p>
        </div>
      )}

      {/* Primary Card/Container */}
      <div className="w-full max-w-md bg-[#1a1d23] rounded-3xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col">
        {/* Logo stays INSIDE the card box */}
        <div className="border-b border-gray-800/80 bg-[#161920]">
          <Logo />
        </div>

        <div className="px-6 pb-8 pt-4 flex flex-col gap-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i <= currentStep ? 'w-4 bg-yellow-500' : 'w-2 bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          {/* Screen Title */}
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
              {title}
            </h2>
            <div className="h-1 w-12 bg-yellow-500 mt-2 rounded-full"></div>
            <p className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest mt-3">
              This will take ~2–3 minutes
            </p>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </div>

      {/* Footer Support Info */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 text-[10px] font-medium tracking-widest uppercase">
          Need Assistance? <span className="text-yellow-500">1-888-912-8999</span>
        </p>
      </div>
    </div>
  );
};
