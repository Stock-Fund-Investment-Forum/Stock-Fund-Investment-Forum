/**
 * Tags API Service
 * Handles all tag-related API calls
 */
import { get } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get tags with optional search
 * @param {string} query - Search query
 * @returns {Promise} Tags list
 */
export const getTags = async (query = '') => {
  const endpoint = query 
    ? `${API_ENDPOINTS.GET_TAGS}?q=${encodeURIComponent(query)}`
    : API_ENDPOINTS.GET_TAGS;
  return get(endpoint);
};
