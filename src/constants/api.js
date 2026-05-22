/**
 * API endpoints and configuration
 * Based on backend_api.md and OpenAPI 3.0 specification
 */

const API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '';

export const API_BASE_URL = `${API_URL}${API_BASE_PATH}`;

export const API_ENDPOINTS = {
  // ========== Auth ==========
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',

  // ========== Users ==========
  GET_USERS: '/users',
  GET_USER: '/users/:userId',
  CREATE_USER: '/users',
  UPDATE_USER: '/users/:userId',
  DELETE_USER: '/users/:userId',

  // ========== Posts ==========
  GET_POSTS: '/posts',
  GET_POST: '/posts/:postId',
  CREATE_POST: '/posts',
  UPDATE_POST: '/posts/:postId',
  DELETE_POST: '/posts/:postId',
  GET_BOARD_POSTS: '/boards/:boardId/posts',

  // ========== Comments ==========
  GET_POST_COMMENTS: '/posts/:postId/comments',
  GET_COMMENT: '/comments/:commentId',
  CREATE_COMMENT: '/posts/:postId/comments',
  UPDATE_COMMENT: '/comments/:commentId',
  DELETE_COMMENT: '/comments/:commentId',

  // ========== Boards ==========
  GET_BOARDS: '/boards',
  CREATE_BOARD: '/boards',

  // ========== Tags ==========
  GET_TAGS: '/tags',

  // ========== Polls ==========
  CREATE_POLL: '/polls',
  VOTE_POLL: '/polls/:pollId/vote',

  // ========== Attachments ==========
  UPLOAD_ATTACHMENT: '/attachments',

  // ========== Messages ==========
  GET_MESSAGES: '/messages',
  SEND_MESSAGE: '/messages',

  // ========== Notifications ==========
  GET_NOTIFICATIONS: '/notifications',

  // ========== Groups ==========
  GET_GROUPS: '/groups',
  GET_GROUP: '/groups/:groupId',
  CREATE_GROUP: '/groups',

  // ========== Stocks ==========
  GET_STOCKS: '/stocks',

  // ========== Health ==========
  HEALTH_CHECK: '/health',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
};

export const REQUEST_TIMEOUT = import.meta.env.VITE_REQUEST_TIMEOUT || 10000; // 10 seconds

// Token storage key
export const TOKEN_STORAGE_KEY = 'sfif_auth_token';
export const USER_STORAGE_KEY = 'sfif_user_info';
