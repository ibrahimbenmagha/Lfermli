import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-slate-200" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-4/5" />
    </div>
    <div className="h-9 bg-slate-200 rounded-xl w-full" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse space-y-3">
    <div className="h-8 bg-slate-200 rounded w-full" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 rounded w-full" />
    ))}
  </div>
);

export default { CardSkeleton, TableSkeleton };
