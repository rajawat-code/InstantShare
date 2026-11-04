/**
 * InstantShare - Pricing and Date Calculation Utilities
 */

/**
 * Format currency amount with Indian Rupee symbol and commas
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate duration and total rental cost based on start date, end date, and item rate
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @param {number} rate
 * @param {'HOURLY'|'DAILY'} rentalType
 * @returns {{
 *   units: number,
 *   unitLabel: string,
 *   durationText: string,
 *   totalAmount: number,
 *   isValid: boolean,
 *   error: string|null
 * }}
 */
export const calculateRentalCost = (startDate, endDate, rate, rentalType = 'HOURLY') => {
  if (!startDate || !endDate) {
    return {
      units: 0,
      unitLabel: rentalType === 'HOURLY' ? 'hours' : 'days',
      durationText: '—',
      totalAmount: 0,
      isValid: false,
      error: 'Please select both start and end times.',
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      units: 0,
      unitLabel: rentalType === 'HOURLY' ? 'hours' : 'days',
      durationText: '—',
      totalAmount: 0,
      isValid: false,
      error: 'Invalid date/time format.',
    };
  }

  const diffMs = end.getTime() - start.getTime();

  if (diffMs <= 0) {
    return {
      units: 0,
      unitLabel: rentalType === 'HOURLY' ? 'hours' : 'days',
      durationText: '—',
      totalAmount: 0,
      isValid: false,
      error: 'End time must be after start time.',
    };
  }

  const diffHours = diffMs / (1000 * 60 * 60);

  if (rentalType === 'HOURLY') {
    // Round up to nearest whole hour, minimum 1 hour
    const hours = Math.max(1, Math.ceil(diffHours));
    const total = hours * rate;
    return {
      units: hours,
      unitLabel: hours === 1 ? 'hour' : 'hours',
      durationText: `${hours} ${hours === 1 ? 'hour' : 'hours'}`,
      totalAmount: total,
      isValid: true,
      error: null,
    };
  } else {
    // DAILY: minimum 1 day (24 hours block rounded up)
    const days = Math.max(1, Math.ceil(diffHours / 24));
    const total = days * rate;
    return {
      units: days,
      unitLabel: days === 1 ? 'day' : 'days',
      durationText: `${days} ${days === 1 ? 'day' : 'days'}`,
      totalAmount: total,
      isValid: true,
      error: null,
    };
  }
};

/**
 * Format ISO or date string to readable human format
 * e.g. "06 Nov 2026, 10:00 AM"
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Format date only: e.g. "06 Nov 2026"
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Helper to get default start and end datetime-local strings for input[type="datetime-local"]
 * Defaults to tomorrow 10:00 AM to tomorrow 2:00 PM (or next day)
 */
export const getDefaultBookingDates = (rentalType = 'HOURLY') => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const end = new Date(tomorrow);
  if (rentalType === 'HOURLY') {
    end.setHours(end.getHours() + 4);
  } else {
    end.setDate(end.getDate() + 1);
  }

  // Format to YYYY-MM-DDTHH:mm
  const formatInput = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return {
    start: formatInput(tomorrow),
    end: formatInput(end),
  };
};

