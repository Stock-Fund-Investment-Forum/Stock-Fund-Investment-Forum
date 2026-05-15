/**
 * Groups API Service
 * Handles all group-related API calls
 */
import { get, post } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get groups list
 * @param {object} [params] - Query params (page, per_page, q, etc.)
 * @returns {Promise} Groups list
 */
export const getGroups = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = `${API_ENDPOINTS.GET_GROUPS}${query ? '?' + query : ''}`;
  return get(endpoint);
};

/**
 * Get single group by ID
 * @param {string} groupId
 * @returns {Promise} Group object
 */
export const getGroup = async (groupId) => {
  return get(API_ENDPOINTS.GET_GROUP.replace(':groupId', groupId));
};

/**
 * Create new group
 * @param {object} groupData - Group data
 * @param {string} groupData.name - Group name
 * @param {string} groupData.description - Group description
 * @param {string} groupData.access_level - Access level
 * @returns {Promise} Created group
 */
export const createGroup = async (groupData) => {
  return post(API_ENDPOINTS.CREATE_GROUP, groupData);
};

/**
 * Join a group
 * @param {string} groupId
 * @returns {Promise}
 */
export const joinGroup = async (groupId) => {
  return post(`${API_ENDPOINTS.GET_GROUPS}/${groupId}/join`);
};

/**
 * Leave a group
 * @param {string} groupId
 * @returns {Promise}
 */
export const leaveGroup = async (groupId) => {
  return post(`${API_ENDPOINTS.GET_GROUPS}/${groupId}/leave`);
};
