/**
 * localStorage helpers with TTL (Time To Live) support
 */

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Store data in localStorage with TTL
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @param {number} [ttl=24h] - Time to live in milliseconds
 */
export function setWithTTL(key, value, ttl = DEFAULT_TTL) {
  try {
    const now = Date.now();
    const item = {
      value,
      timestamp: now,
      ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn(`Failed to store item in localStorage: ${error.message}`);
  }
}

/**
 * Get data from localStorage with TTL validation
 * @param {string} key - Storage key
 * @returns {*} Stored value or null if expired/not found
 */
export function getWithTTL(key) {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = Date.now();

    // Check if item has expired
    if (now - item.timestamp > item.ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.warn(`Failed to retrieve item from localStorage: ${error.message}`);
    return null;
  }
}

/**
 * Check if stored item is still valid (not expired)
 * @param {string} key - Storage key
 * @returns {boolean} True if item exists and is not expired
 */
export function isValid(key) {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return false;
    }

    const item = JSON.parse(itemStr);
    const now = Date.now();

    return now - item.timestamp <= item.ttl;
  } catch {
    return false;
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`Failed to remove item from localStorage: ${err.message}`);
  }
}

/**
 * Clear all items from localStorage
 */
export function clear() {
  try {
    localStorage.clear();
  } catch (error) {
    console.warn(`Failed to clear localStorage: ${error.message}`);
  }
}

/**
 * Get time remaining until expiration
 * @param {string} key - Storage key
 * @returns {number} Milliseconds until expiration, or -1 if expired/not found
 */
export function getTimeRemaining(key) {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return -1;
    }

    const item = JSON.parse(itemStr);
    const now = Date.now();
    const elapsed = now - item.timestamp;
    const remaining = item.ttl - elapsed;

    return remaining > 0 ? remaining : -1;
  } catch {
    return -1;
  }
}
