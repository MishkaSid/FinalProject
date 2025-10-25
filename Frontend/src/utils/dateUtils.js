/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Get the current date in YYYY-MM-DD format (local timezone)
 * @returns {string} Current date in YYYY-MM-DD format
 */
export function getCurrentDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a date that is N days ago from today
 * @param {number} daysAgo - Number of days ago
 * @returns {string} Date in YYYY-MM-DD format
 */
export function getDateDaysAgo(daysAgo) {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - daysAgo);
  
  const year = pastDate.getFullYear();
  const month = String(pastDate.getMonth() + 1).padStart(2, '0');
  const day = String(pastDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the last 30 days date range
 * @returns {object} Object with from and to date strings
 */
export function getLast30DaysRange() {
  return {
    from: getDateDaysAgo(30),
    to: getCurrentDateString()
  };
}

/**
 * Get the last N days date range
 * @param {number} days - Number of days to go back
 * @returns {object} Object with from and to date strings
 */
export function getLastNDaysRange(days) {
  return {
    from: getDateDaysAgo(days),
    to: getCurrentDateString()
  };
}
