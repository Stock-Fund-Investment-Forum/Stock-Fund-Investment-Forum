/**
 * Users API Service
 * Handles all user-related API calls
 */
import { get, post, put, deleteRequest } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

export const followUser = async (userId) => {
  return post(API_ENDPOINTS.FOLLOW_USER.replace(':userId', userId));
};

export const unfollowUser = async (userId) => {
  return post(API_ENDPOINTS.UNFOLLOW_USER.replace(':userId', userId));
};

/**
 * Get users list with pagination
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number (default 1)
 * @param {number} params.per_page - Items per page (default 20)
 * @param {string} params.status - Filter by status
 * @param {string} params.nickname - Filter by nickname
 * @returns {Promise} Users list
 */
export const getUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return get(`${API_ENDPOINTS.GET_USERS}${query ? '?' + query : ''}`);
};

/**
 * Get single user profile
 * @param {string} userId - User ID
 * @returns {Promise} User object
 */
export const getUser = async (userId) => {
  return get(API_ENDPOINTS.GET_USER.replace(':userId', userId));
};

/**
 * Get current user profile (for logged-in user)
 * @returns {Promise} Current user object
 */
export const getCurrentUser = async () => {
  return get(API_ENDPOINTS.GET_CURRENT_USER);
};

/**
 * Create user (admin or registration)
 * @param {object} userData - User data
 * @param {string} userData.nickname - User nickname
 * @param {string} userData.email - User email (optional if phone provided)
 * @param {string} userData.phone - User phone (optional if email provided)
 * @param {string} userData.password - User password
 * @returns {Promise} Created user
 */
export const createUser = async (userData) => {
  return post(API_ENDPOINTS.CREATE_USER, userData);
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @param {string} updates.nickname - Nickname
 * @param {string} updates.avatar - Avatar URL
 * @param {string} updates.bio - User bio
 * @returns {Promise} Updated user
 */
export const updateUser = async (userId, updates) => {
  return put(API_ENDPOINTS.UPDATE_USER.replace(':userId', userId), updates);
};

/**
 * Delete user (soft delete)
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const deleteUser = async (userId) => {
  return deleteRequest(API_ENDPOINTS.DELETE_USER.replace(':userId', userId));
};
