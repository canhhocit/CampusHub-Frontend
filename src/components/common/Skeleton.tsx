import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/75 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col h-full animate-pulse">
      <div className="aspect-[4/3] bg-slate-100" />
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 bg-slate-200/80 rounded w-1/2" />
          <div className="h-3.5 bg-slate-200/70 rounded w-11/12" />
          <div className="h-3.5 bg-slate-200/60 rounded w-2/3" />
        </div>
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="h-3 bg-slate-200/70 rounded w-20" />
          <div className="h-3 bg-slate-200/60 rounded w-12" />
        </div>
      </div>
    </div>
  );
};
