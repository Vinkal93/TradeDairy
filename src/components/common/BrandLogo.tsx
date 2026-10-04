import React from 'react';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-8 w-auto', showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 shrink-0"
      >
        <line x1="12" y1="12" x2="12" y2="38" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="8" y="18" width="8" height="16" rx="3" fill="#10B981" />

        <line x1="24" y1="6" x2="24" y2="42" stroke="#006948" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="20" y="12" width="8" height="24" rx="3" fill="#006948" />

        <line x1="36" y1="16" x2="36" y2="36" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="32" y="22" width="8" height="12" rx="3" fill="#34D399" />
      </svg>
      {showText && (
        <div className="flex flex-col select-none">
          <span className="font-headline-sm text-[19px] font-bold text-on-surface leading-tight tracking-tight">
            Trade<span className="text-primary">Dairy</span>
          </span>
          <span className="text-[11px] font-medium text-on-surface-variant leading-none tracking-tight">
            Journal &amp; Analytics
          </span>
        </div>
      )}
    </div>
  );
};
