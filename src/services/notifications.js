/**
 * Notifications API Service
 * Handles all notification-related API calls
 */
import { get, post } from '../utils/http';
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

/**
 * Mark notifications as read
 * @param {string} notificationId - Optional specific notification ID
 * @returns {Promise}
 */
export const markNotificationsRead = async (notificationId) => {
  const params = notificationId ? { notification_id: notificationId } : {};
  return post(API_ENDPOINTS.MARK_NOTIFICATIONS_READ, params);
};

/**
 * Get unread notification count
 * @returns {Promise} Unread count
 */
export const getUnreadNotificationCount = async () => {
  return get(API_ENDPOINTS.UNREAD_NOTIFICATIONS_COUNT);
};
