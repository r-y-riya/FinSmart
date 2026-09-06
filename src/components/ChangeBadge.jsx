import React from 'react';
import { SEVERITY } from '../services/changeDetectionEngine';

export default function ChangeBadge({ severity, size = 'sm', showDot = true, customLabel = null }) {
  const isLarge = size === 'md' || size === 'lg';

  if (severity === SEVERITY.HIGH) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${
          isLarge ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]'
        } bg-[#FFF1ED] dark:bg-[#FF9B7A]/15 text-[#D95328] dark:text-[#FF9B7A] border-[#FF9B7A]/30`}
      >
        {showDot && <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B7A] shrink-0" />}
        <span>{customLabel || 'Significant'}</span>
      </span>
    );
  }

  if (severity === SEVERITY.MEDIUM) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${
          isLarge ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]'
        } bg-[#FEF9EC] dark:bg-[#F5C95B]/15 text-[#A6780C] dark:text-[#F5C95B] border-[#F5C95B]/30`}
      >
        {showDot && <span className="w-1.5 h-1.5 rounded-full bg-[#F5C95B] shrink-0" />}
        <span>{customLabel || 'Watch'}</span>
      </span>
    );
  }

  // NORMAL - visually quiet, receding neutral styling
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-normal rounded-full border transition-all ${
        isLarge ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
      } bg-[#F4F5F7] dark:bg-[#1E2521] text-[#66727D] dark:text-[#8C9891] border-[#E8E9EE] dark:border-[#2A352E]`}
    >
      {showDot && <span className="w-1.5 h-1.5 rounded-full bg-[#16A66A]/60 shrink-0" />}
      <span>{customLabel || 'Normal'}</span>
    </span>
  );
}
