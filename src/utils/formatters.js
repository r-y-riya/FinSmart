export function formatCurrency(value, currency = 'INR') {
  if (value === null || value === undefined || isNaN(value)) return '—';
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value).replace('INR', '₹').trim();
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value, includeSign = true) {
  if (value === null || value === undefined || isNaN(value)) return '0.00%';
  const num = Number(value);
  const formatted = Math.abs(num).toFixed(2) + '%';
  if (!includeSign) return formatted;
  if (num > 0) return `+${formatted}`;
  if (num < 0) return `-${formatted}`;
  return `0.00%`;
}

export function formatVolume(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  const abs = Math.abs(Number(num));
  if (abs >= 1e7) {
    return (num / 1e7).toFixed(2) + ' Cr';
  }
  if (abs >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (abs >= 1e3) {
    return (num / 1e3).toFixed(0) + 'K';
  }
  return num.toLocaleString();
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Unknown';
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 120) return '1 min ago';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  if (diffSec < 86400) {
    if (minutes === 0) return `${hours}h ago`;
    return `${hours}h ${minutes}m ago`;
  }

  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function formatTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
