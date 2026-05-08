/**
 * Storage utility functions
 */

const PREFIX = 'sfif_'; // Stock Fund Investment Forum prefix

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} stored value or default
 */
export const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(`${PREFIX}${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to get storage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} success status
 */
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set storage key "${key}":`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} success status
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to remove storage key "${key}":`, error);
    return false;
  }
};

/**
 * Clear all app storage
 * @returns {boolean} success status
 */
export const clearStorage = () => {
  try {
    const keys = Object.keys(localStorage);
    keys
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
};
