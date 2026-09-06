import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';

export default function EmptyState({ type = 'watchlist', onAction }) {
  if (type === 'no-changes') {
    return (
      <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-white dark:bg-[#171C19] rounded-2xl border border-pulse-border dark:border-pulse-dark-border shadow-subtle">
        <div className="w-14 h-14 rounded-2xl bg-pulse-green-light dark:bg-[#16A66A]/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-pulse-green dark:text-pulse-dark-green" strokeWidth={1.75} />
        </div>
        <h3 className="text-lg font-semibold text-pulse-text dark:text-pulse-dark-text mb-1">
          Nothing meaningful changed.
        </h3>
        <p className="text-sm text-pulse-secondary dark:text-pulse-dark-secondary max-w-sm">
          Your watchlist is calm. No stocks crossed your significance thresholds since your last visit.
        </p>
      </div>
    );
  }

  // Default empty watchlist
  return (
    <div className="py-16 px-6 flex flex-col items-center justify-center text-center bg-white dark:bg-[#171C19] rounded-2xl border border-pulse-border dark:border-pulse-dark-border shadow-subtle">
      <div className="w-16 h-16 rounded-2xl bg-[#EEF5FE] dark:bg-[#5B9CF6]/15 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-pulse-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M3 12h4l3 8 4-16 3 8h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-pulse-text dark:text-pulse-dark-text mb-1">
        Your watchlist is quiet.
      </h3>
      <p className="text-sm text-pulse-secondary dark:text-pulse-dark-secondary max-w-md mb-6">
        Add a few stocks and we'll start watching for meaningful changes that actually deserve your attention.
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-pulse-green hover:bg-emerald-600 text-white shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add your first stock</span>
        </button>
      )}
    </div>
  );
}
