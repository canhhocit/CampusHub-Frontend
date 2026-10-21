import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#eb6e34] flex items-center justify-center mb-3.5 shadow-2xs">
        {icon || <PackageOpen size={28} />}
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-[#eb6e34] hover:bg-[#d85e25] text-white text-xs font-semibold rounded-xl shadow-xs transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
