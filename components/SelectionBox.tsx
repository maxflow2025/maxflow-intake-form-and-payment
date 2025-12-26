import React from 'react';

interface SelectionBoxProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
  description?: string;
  className?: string;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  label,
  selected,
  onClick,
  icon,
  description,
  className,
}) => {
  const base =
    'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ' +
    'min-h-[56px] select-none ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/60 focus-visible:ring-offset-0';

  const state = selected
    ? 'bg-yellow-500/10 border-yellow-500 text-white'
    : 'bg-[#121418] border-gray-700 text-gray-400 hover:border-gray-600 active:border-gray-500';

  const iconWrap = `flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
    selected ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-500'
  }`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${state}${className ? ` ${className}` : ''}`}
    >
      {/* Left icon / bullet */}
      <div className={iconWrap} aria-hidden="true">
        {icon ? (
          <i className={icon}></i>
        ) : (
          <div
            className={`w-3 h-3 rounded-full ${
              selected ? 'bg-black' : 'border border-gray-600'
            }`}
          />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col leading-tight">
        <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-gray-300'}`}>
          {label}
        </span>
        {description ? (
          <span className="mt-1 text-[10px] text-gray-500 font-medium">
            {description}
          </span>
        ) : null}
      </div>

      {/* Right check */}
      {selected ? (
        <div className="ml-auto flex items-center" aria-hidden="true">
          <i className="fa-solid fa-circle-check text-yellow-500"></i>
        </div>
      ) : null}
    </button>
  );
};
