/**
 * utils/helpers.js
 * Shared utility functions used across the app
 */

// Rank display order (highest → lowest)
export const RANK_ORDER = ['SUO', 'JUO', 'Sgt', 'Cpl', 'L/Cpl', 'Cadet'];

// CSS class for rank badge color
export const getRankClass = (rank) => {
  const map = {
    'SUO':   'rank-suo',
    'JUO':   'rank-juo',
    'Sgt':   'rank-sgt',
    'Cpl':   'rank-cpl',
    'L/Cpl': 'rank-lcpl',
    'Cadet': 'rank-cadet',
  };
  return map[rank] || 'rank-cadet';
};

export const getWingClass = (wing) =>
  wing === 'SD' ? 'wing-sd' : 'wing-sw';

// Format date → "15 Nov 2024"
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
};

// Format date → "15 Nov 2024, 10:30 AM"
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};

// Attendance percentage → color class
export const getAttendanceColor = (pct) => {
  if (pct === null || pct === undefined) return 'text-gray-500';
  if (pct >= 90) return 'text-green-400';
  if (pct >= 75) return 'text-yellow-400';
  return 'text-red-400';
};

// Attendance percentage → label
export const getAttendanceLabel = (pct) => {
  if (pct === null || pct === undefined) return 'No data';
  if (pct >= 90) return 'Excellent';
  if (pct >= 75) return 'Satisfactory';
  if (pct >= 50) return 'Low — Warning';
  return 'Defaulter';
};

// Priority → display config
export const getPriorityConfig = (priority) => {
  const map = {
    urgent: { label: '⚠️ URGENT',  className: 'priority-urgent' },
    normal: { label: '📋 NORMAL',  className: 'priority-normal' },
    info:   { label: 'ℹ️ INFO',     className: 'priority-info'   },
  };
  return map[priority] || map.normal;
};

// Initials avatar fallback
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() || '')
    .join('');
};

// Time ago
export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return formatDate(dateStr);
};

// Debounce for search inputs
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
