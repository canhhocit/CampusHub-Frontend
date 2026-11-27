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
      className={`flex flex-col items-center justify-center px-6 py-12 sm:py-16 text-center bg-white rounded-xl border border-slate-200/80 font-sans ${className}`}
    >
      <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center justify-center mb-3.5">
        {icon || <PackageOpen size={20} />}
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
