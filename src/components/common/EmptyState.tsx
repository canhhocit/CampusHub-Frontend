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
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-lg border border-slate-200/80 shadow-2xs font-sans ${className}`}
    >
      <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center mb-3 shadow-2xs">
        {icon || <PackageOpen size={24} />}
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
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-2xs transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
