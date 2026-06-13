/**
 * Formats a date string into "Jun 13, 2026".
 * @param {string|Date} date
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Returns a relative time string (e.g. "2 days ago", "In 3 days").
 * @param {string|Date} date
 */
export function formatRelativeDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffTime = d - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  
  if (diffDays > 1) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

/**
 * Formats a number to Indian Currency format (INR).
 * @param {number} amount
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats large numbers using suffix (e.g. 1.5K for 1500, 1.2M).
 * @param {number} num
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
  if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Helper to compute percentage.
 */
export function formatPercent(value, total) {
  if (!total || isNaN(value) || isNaN(total)) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Formats minutes into "2h 30m" format.
 * @param {number} minutes
 */
export function formatTime(minutes) {
  if (!minutes || isNaN(minutes)) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}
