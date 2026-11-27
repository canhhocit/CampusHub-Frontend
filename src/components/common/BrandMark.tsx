import React from 'react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'emerald' | 'dark' | 'light';
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'md',
  tone = 'emerald',
  className = '',
}) => {
  const dimensions =
    size === 'sm'
      ? 'w-8 h-8 rounded-lg'
      : size === 'lg'
        ? 'w-11 h-11 rounded-xl'
        : 'w-9 h-9 rounded-lg';

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  const surface =
    tone === 'dark'
      ? 'bg-slate-900 text-white ring-1 ring-white/10'
      : tone === 'light'
        ? 'bg-white text-slate-900 ring-1 ring-slate-200/90'
        : 'bg-emerald-600 text-white shadow-xs';

  return (
    <div
      className={`${dimensions} ${surface} inline-flex items-center justify-center shrink-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3.5"
          y="4.5"
          width="17"
          height="15"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M9.5 4.5V19.5"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M14.5 10.5H16.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14.5 13.5H16.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
