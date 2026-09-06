import React from 'react';
import { getFreshnessInfo, FreshnessStatus } from '../utils/freshness';
import { formatRelativeTime } from '../utils/formatters';

export default function FreshnessIndicator({ lastUpdated, isOffline = false, compact = false }) {
  const info = getFreshnessInfo(lastUpdated, isOffline);
  const relativeTime = formatRelativeTime(lastUpdated);

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
        <span className={`w-1.5 h-1.5 rounded-full ${info.dotColor} shrink-0`} />
        <span>{info.label} · {relativeTime}</span>
      </span>
    );
  }

  if (info.status === FreshnessStatus.UNAVAILABLE) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs bg-pulse-peach-light dark:bg-[#FF9B7A]/10 border border-[#FF9B7A]/30 text-[#C4461C] dark:text-[#FF9B7A]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B7A] shrink-0" />
        <span className="font-medium">Market data temporarily unavailable</span>
        <span className="text-[#66727D] dark:text-[#8C9891] hidden sm:inline">
          · Showing last known snapshot from {relativeTime}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${info.borderColor} ${info.bgColor} ${info.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${info.dotColor} shrink-0`} />
      <span className="font-medium">{info.label}</span>
      <span className="opacity-75">· {relativeTime}</span>
    </div>
  );
}
