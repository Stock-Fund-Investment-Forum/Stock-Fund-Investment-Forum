/**
 * Messages API Service
 * Handles all message-related API calls
 */
import { get, post } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get user messages/conversations
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @returns {Promise} Messages list
 */
export const getMessages = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return get(`${API_ENDPOINTS.GET_MESSAGES}${query ? '?' + query : ''}`);
};

/**
 * Send message to a user
 * @param {object} messageData - Message data
 * @param {string} messageData.recipient_id - Recipient user ID
 * @param {string} messageData.content - Message content
 * @returns {Promise} Created message
 */
export const sendMessage = async (messageData) => {
  return post(API_ENDPOINTS.SEND_MESSAGE, messageData);
};
