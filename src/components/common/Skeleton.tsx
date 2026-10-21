import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col h-full animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded-md w-3/4" />
          <div className="h-4 bg-slate-200 rounded-md w-1/2" />
          <div className="h-5 bg-slate-200 rounded-md w-2/5 mt-2" />
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-3.5 bg-slate-200 rounded-md w-20" />
          <div className="h-3.5 bg-slate-200 rounded-md w-12" />
        </div>
      </div>
    </div>
  );
};
