/**
 * Groups API Service
 * Handles all group-related API calls
 */
import { get, post } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get groups list
 * @returns {Promise} Groups list
 */
export const getGroups = async () => {
  return get(API_ENDPOINTS.GET_GROUPS);
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
