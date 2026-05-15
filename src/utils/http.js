/**
 * HTTP request utility with JWT authentication
 * Supports Bearer token authentication for backend API
 */
import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_STORAGE_KEY } from '../constants/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Get stored auth token
 * @returns {string|null} JWT token or null
 */
const getAuthToken = () => {
  try {
    const prefix = 'sfif_';
    const token = localStorage.getItem(`${prefix}${TOKEN_STORAGE_KEY.replace(prefix, '')}`);
    return token;
  } catch {
    return null;
  }
};

/**
 * Make HTTP request with authentication support
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
    skipAuth = false,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add JWT token if available and not explicitly skipped
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

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

    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json().catch(() => ({}));

    // Handle error responses
    if (!response.ok) {
      // If 401, clear stored token
      if (response.status === 401) {
        try {
          const prefix = 'sfif_';
          localStorage.removeItem(`${prefix}${TOKEN_STORAGE_KEY.replace(prefix, '')}`);
        } catch {
          // Ignore storage errors
        }
      }

      throw new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('请求超时', 408, null);
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

/**
 * Upload file (multipart/form-data)
 */
export const uploadFile = async (endpoint, formData, options = {}) => {
  const {
    timeout = REQUEST_TIMEOUT,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {};

  // Add JWT token
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData, // Don't stringify FormData
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('请求超时', 408, null);
    }
    throw error;
  }
};

export { ApiError };
