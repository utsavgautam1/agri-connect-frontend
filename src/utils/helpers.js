/**
 * helpers.js
 * Utility functions used across the app.
 */

// ── Date & Time ───────────────────────────────────────────────────────────────

/** Format a timestamp to "Mon 02 Mar 2026" */
export const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
};

/** Format a timestamp to "10:30 AM" */
export const formatTime = (timestamp) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
};

/** "2 hours ago", "just now", "3 days ago" */
export const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days  < 7)  return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(timestamp);
};

/** True if date is today */
export const isToday = (timestamp) => {
  const d = new Date(timestamp);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};

// ── Number formatting ─────────────────────────────────────────────────────────

/** 1234567 → "1,234,567" */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '—';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/** 0.1234 → "12.34%" */
export const formatPercent = (ratio, decimals = 1) =>
  `${(ratio * 100).toFixed(decimals)}%`;

/** Price with currency symbol: formatPrice(4200, 'KES') → "KES 4,200" */
export const formatPrice = (amount, currency = 'KES') =>
  `${currency} ${formatNumber(amount)}`;

// ── String utilities ──────────────────────────────────────────────────────────

/** Capitalise first letter only */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

/** Truncate to maxLen with ellipsis */
export const truncate = (str, maxLen = 80) =>
  str && str.length > maxLen ? `${str.slice(0, maxLen - 1)}…` : (str || '');

/** Generate a simple unique-ish ID (not cryptographic) */
export const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// ── Object / array utilities ──────────────────────────────────────────────────

/** Deep-clone a plain JSON-serialisable object */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/** Group an array of objects by a key */
export const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = item[key] ?? 'Other';
    (acc[group] = acc[group] || []).push(item);
    return acc;
  }, {});

/** Sort an array of objects by a numeric key (desc by default) */
export const sortBy = (arr, key, dir = 'desc') =>
  [...arr].sort((a, b) => dir === 'desc' ? b[key] - a[key] : a[key] - b[key]);

// ── Debounce ──────────────────────────────────────────────────────────────────
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ── Crop / Agriculture helpers ────────────────────────────────────────────────

/** Convert Celsius to Fahrenheit */
export const celsiusToFahrenheit = (c) => Math.round((c * 9) / 5 + 32);

/** Derive a planting season label from a month number (1–12) */
export const getPlantingSeason = (month) => {
  if ([3, 4, 5].includes(month))  return 'Long Rains (Mar–May)';
  if ([10, 11, 12].includes(month)) return 'Short Rains (Oct–Dec)';
  return 'Dry Season';
};

/** Map wind degrees to a compass direction string */
export const degreesToCompass = (deg) => {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};