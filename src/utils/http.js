/**
 * HTTP request utility with JWT authentication
 * Supports Bearer token authentication for backend API
 */
import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_STORAGE_KEY } from '../constants/api';
import { getStorage, removeStorage } from './storage';

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
    // 使用 getStorage 读取，它会自动处理前缀和 JSON 解析
    const token = getStorage(TOKEN_STORAGE_KEY, null);
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
          removeStorage(TOKEN_STORAGE_KEY);
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
/**
 * POST request with Form Data (application/x-www-form-urlencoded)
 * Specifically for OAuth2 login compatibility
 */
export const postForm = async (endpoint, data, options = {}) => {
  const { timeout = REQUEST_TIMEOUT } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 构建表单字符串: key1=value1&key2=value2
  const formBody = Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        responseData.detail || responseData.message || `HTTP ${response.status}`,
        response.status,
        responseData
      );
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('请求超时', 408, null);
    }
    throw error;
  }
};


export { ApiError };
