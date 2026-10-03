import React from 'react';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface ReadinessMeterProps {
  score: number; // 0-100
  title?: string;
  missingItems?: string[];
  compact?: boolean;
}

export const ReadinessMeter: React.FC<ReadinessMeterProps> = ({
  score,
  title = 'Application Readiness Meter',
  missingItems = [],
  compact = false
}) => {
  const getStatusColor = (val: number) => {
    if (val >= 85) return 'text-emerald-700 bg-emerald-500';
    if (val >= 60) return 'text-amber-700 bg-amber-500';
    return 'text-rose-700 bg-rose-500';
  };

  const getStatusBadge = (val: number) => {
    if (val >= 85) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Submission Ready
        </span>
      );
    }
    if (val >= 60) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        Requirements Missing
      </span>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getStatusColor(score).split(' ')[1]}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-700">{score}%</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 text-sm">{title}</span>
          <span className="text-xs text-slate-500 font-medium">({score}% Complete)</span>
        </div>
        {getStatusBadge(score)}
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getStatusColor(score).split(' ')[1]}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {/* Details */}
      {missingItems.length > 0 && score < 100 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap items-center gap-1.5">
          <span className="font-medium text-slate-700">Pending items:</span>
          {missingItems.map((item, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
