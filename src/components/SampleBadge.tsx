import React from 'react';
import { AlertCircle } from 'lucide-react';

interface SampleBadgeProps {
  className?: string;
  tooltip?: string;
}

export const SampleBadge: React.FC<SampleBadgeProps> = ({
  className = '',
  tooltip = 'This rule / record is sample prototype data for demonstration only, not an official MoTA statutory rule.'
}) => {
  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs select-none ${className}`}
    >
      <AlertCircle className="w-3 h-3 text-amber-700 shrink-0" />
      <span>Sample / Prototype Data</span>
    </span>
  );
};
