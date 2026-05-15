/**
 * Notifications API Service
 * Handles all notification-related API calls
 */
import { get } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get user notifications
 * @param {object} params - Query parameters
 * @param {boolean} params.is_read - Filter by read status
 * @returns {Promise} Notifications list
 */
export const getNotifications = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return get(`${API_ENDPOINTS.GET_NOTIFICATIONS}${query ? '?' + query : ''}`);
};
