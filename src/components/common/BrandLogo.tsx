import React from 'react';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-8 w-auto',
  showText = true,
  textColor = '#0F172A',
}) => {
  if (!showText) {
    return (
      <svg
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="TradeDairy"
      >
        <g transform="translate(6, 0)">
          <rect x="6" y="24" width="8" height="22" rx="4" fill="#10B981" />
          <line x1="10" y1="18" x2="10" y2="48" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="20" y="14" width="8" height="32" rx="4" fill="#059669" />
          <line x1="24" y1="8" x2="24" y2="52" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="34" y="28" width="8" height="18" rx="4" fill="#34D399" />
          <line x1="38" y1="22" x2="38" y2="50" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 60"
      fill="none"
      className={className}
      aria-label="TradeDairy"
    >
      <rect x="6" y="24" width="8" height="22" rx="4" fill="#10B981" />
      <line x1="10" y1="18" x2="10" y2="48" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="20" y="14" width="8" height="32" rx="4" fill="#059669" />
      <line x1="24" y1="8" x2="24" y2="52" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="34" y="28" width="8" height="18" rx="4" fill="#34D399" />
      <line x1="38" y1="22" x2="38" y2="50" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
      <text
        x="54"
        y="38"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontSize="24"
        fontWeight="800"
        fill={textColor}
        letterSpacing="-0.5"
      >
        Trade<tspan fill="#059669">Dairy</tspan>
      </text>
    </svg>
  );
};
