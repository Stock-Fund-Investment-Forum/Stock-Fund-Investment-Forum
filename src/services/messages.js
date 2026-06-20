/**
 * Messages API Service
 * Handles all message-related API calls
 */
import { get, post } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get user conversations list
 * @returns {Promise} Conversations list
 */
export const getMessages = async () => {
  return get(API_ENDPOINTS.GET_MESSAGES);
};

/**
 * Get conversation with a specific user
 * @param {string} otherUserId - Other user's ID
 * @param {object} params - Pagination params
 * @returns {Promise} Messages list
 */
export const getConversation = async (otherUserId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = API_ENDPOINTS.GET_CONVERSATION.replace(':otherUserId', otherUserId);
  return get(`${endpoint}${query ? '?' + query : ''}`);
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

/**
 * Mark messages as read
 * @param {string} senderId - Optional sender to mark messages from
 * @returns {Promise}
 */
export const markMessagesRead = async (senderId) => {
  const params = senderId ? { sender_id: senderId } : {};
  return post(API_ENDPOINTS.MARK_MESSAGES_READ, params);
};

/**
 * Get unread message count
 * @returns {Promise} Unread count
 */
export const getUnreadMessageCount = async () => {
  return get(API_ENDPOINTS.UNREAD_MESSAGES_COUNT);
};
