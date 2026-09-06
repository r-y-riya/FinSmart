export const FreshnessStatus = {
  FRESH: 'FRESH',
  DELAYED: 'DELAYED',
  STALE: 'STALE',
  UNAVAILABLE: 'UNAVAILABLE'
};

export function getFreshnessInfo(lastUpdated, isOffline = false) {
  if (isOffline) {
    return {
      status: FreshnessStatus.UNAVAILABLE,
      label: 'Unavailable',
      dotColor: 'bg-pulse-peach',
      textColor: 'text-pulse-peach dark:text-pulse-peach-dark',
      bgColor: 'bg-pulse-peach-light dark:bg-pulse-peach/10',
      borderColor: 'border-pulse-peach/30',
      description: 'Market provider unavailable. Showing last known snapshot.'
    };
  }

  if (!lastUpdated) {
    return {
      status: FreshnessStatus.UNAVAILABLE,
      label: 'Unavailable',
      dotColor: 'bg-pulse-peach',
      textColor: 'text-pulse-peach dark:text-pulse-peach-dark',
      bgColor: 'bg-pulse-peach-light dark:bg-pulse-peach/10',
      borderColor: 'border-pulse-peach/30',
      description: 'Data not available'
    };
  }

  const now = new Date().getTime();
  const updatedTime = new Date(lastUpdated).getTime();
  const diffMinutes = Math.max(0, (now - updatedTime) / (1000 * 60));

  if (diffMinutes < 2) {
    return {
      status: FreshnessStatus.FRESH,
      label: 'Fresh',
      dotColor: 'bg-pulse-green animate-pulse',
      textColor: 'text-pulse-green dark:text-pulse-dark-green',
      bgColor: 'bg-pulse-green-light dark:bg-pulse-green/10',
      borderColor: 'border-pulse-green/30',
      description: 'Live real-time feed'
    };
  }

  if (diffMinutes <= 15) {
    return {
      status: FreshnessStatus.DELAYED,
      label: 'Delayed',
      dotColor: 'bg-pulse-yellow',
      textColor: 'text-[#B2821A] dark:text-pulse-yellow',
      bgColor: 'bg-pulse-yellow-light dark:bg-pulse-yellow/10',
      borderColor: 'border-pulse-yellow/30',
      description: 'Data delayed by exchange'
    };
  }

  return {
    status: FreshnessStatus.STALE,
    label: 'Stale',
    dotColor: 'bg-pulse-secondary',
    textColor: 'text-pulse-secondary dark:text-pulse-dark-secondary',
    bgColor: 'bg-pulse-secondary/10 dark:bg-pulse-dark-secondary/10',
    borderColor: 'border-pulse-secondary/20',
    description: 'Data may be out of date'
  };
}
