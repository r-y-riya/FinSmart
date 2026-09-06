export const FreshnessStatus = {
  FRESH: 'FRESH',
  DELAYED: 'DELAYED',
  STALE: 'STALE',
  UNAVAILABLE: 'UNAVAILABLE'
};

export function calculateFreshness(timestamp, isOffline = false) {
  if (isOffline) {
    return {
      status: FreshnessStatus.UNAVAILABLE,
      label: 'Unavailable',
      description: 'Market data provider unavailable. Showing last known snapshot.'
    };
  }

  if (!timestamp) {
    return {
      status: FreshnessStatus.UNAVAILABLE,
      label: 'Unavailable',
      description: 'Data not available'
    };
  }

  const now = Date.now();
  const updatedTime = new Date(timestamp).getTime();
  const diffMinutes = Math.max(0, (now - updatedTime) / (1000 * 60));

  if (diffMinutes < 2) {
    return {
      status: FreshnessStatus.FRESH,
      label: 'Fresh',
      description: 'Live real-time feed'
    };
  }

  if (diffMinutes <= 15) {
    return {
      status: FreshnessStatus.DELAYED,
      label: 'Delayed',
      description: 'Data delayed by exchange feed'
    };
  }

  return {
    status: FreshnessStatus.STALE,
    label: 'Stale',
    description: 'Data may be out of date'
  };
}
