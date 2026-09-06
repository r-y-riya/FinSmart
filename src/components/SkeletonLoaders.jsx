import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#171C19] rounded-2xl p-5 border border-pulse-border dark:border-pulse-dark-border animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-36 bg-gray-100 dark:bg-gray-800/60 rounded" />
        </div>
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>
      <div className="flex items-baseline justify-between mt-4">
        <div className="space-y-1">
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/60 rounded" />
        </div>
        <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800/60 rounded" />
      </div>
    </div>
  );
}

export function FeedCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#171C19] rounded-2xl p-5 border border-pulse-border dark:border-pulse-dark-border animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800/60 rounded" />
      <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800/40 rounded" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-72 bg-gray-100/60 dark:bg-[#171C19] rounded-2xl p-6 border border-pulse-border dark:border-pulse-dark-border animate-pulse flex flex-col justify-between">
      <div className="flex justify-between">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
      <div className="h-44 w-full bg-gray-200/50 dark:bg-gray-800/40 rounded-xl" />
    </div>
  );
}
