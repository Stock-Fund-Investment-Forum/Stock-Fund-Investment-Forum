/**
 * HTTP request utility
 */
import { API_BASE_URL, REQUEST_TIMEOUT } from '../constants/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Make HTTP request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Request options
 * @returns {Promise} response data
 */
export const request = async (
  endpoint,
  options = {}
) => {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeout = REQUEST_TIMEOUT,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, null);
    }
    throw error;
  }
};

/**
 * GET request
 */
export const get = (endpoint, options) =>
  request(endpoint, { ...options, method: 'GET' });

/**
 * POST request
 */
export const post = (endpoint, body, options) =>
  request(endpoint, { ...options, method: 'POST', body });

/**
 * PUT request
 */
export const put = (endpoint, body, options) =>
  request(endpoint, { ...options, method: 'PUT', body });

/**
 * PATCH request
 */
export const patch = (endpoint, body, options) =>
  request(endpoint, { ...options, method: 'PATCH', body });

/**
 * DELETE request
 */
export const deleteRequest = (endpoint, options) =>
  request(endpoint, { ...options, method: 'DELETE' });

export { ApiError };
