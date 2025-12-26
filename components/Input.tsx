import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, className, ...props }) => {
  const baseClass =
    `w-full bg-[#121418] border border-gray-700 rounded-xl py-3.5 ` +
    `${icon ? 'pl-11' : 'px-4'} pr-4 ` +
    `text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 ` +
    `transition-all text-sm font-medium`;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>

      <div className="relative group">
        {icon ? (
          <i
            className={`${icon} absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors`}
            aria-hidden="true"
          />
        ) : null}

        <input
          {...props}
          // iPhone-friendly defaults (caller can override)
          autoCapitalize={props.autoCapitalize ?? 'none'}
          autoCorrect={props.autoCorrect ?? 'off'}
          spellCheck={props.spellCheck ?? false}
          className={`${baseClass}${className ? ` ${className}` : ''}`}
        />
      </div>
    </div>
  );
};
