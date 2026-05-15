/**
 * Stocks API Service
 * Handles all stock/fund-related API calls
 */
import { get } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Search stocks/funds
 * @param {object} params - Query parameters
 * @param {string} params.q - Search keyword
 * @param {string} params.symbol - Stock/fund symbol
 * @returns {Promise} Stocks list
 */
export const getStocks = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return get(`${API_ENDPOINTS.GET_STOCKS}${query ? '?' + query : ''}`);
};
