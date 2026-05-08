/**
 * API endpoints and configuration
 */

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Posts
  GET_POSTS: '/posts',
  GET_POST: '/posts/:id',
  CREATE_POST: '/posts',
  UPDATE_POST: '/posts/:id',
  DELETE_POST: '/posts/:id',
  LIKE_POST: '/posts/:id/like',
  
  // Users
  GET_USER: '/users/:id',
  UPDATE_USER: '/users/:id',
  GET_USER_POSTS: '/users/:id/posts',
  FOLLOW_USER: '/users/:id/follow',
  
  // Comments
  GET_COMMENTS: '/posts/:postId/comments',
  CREATE_COMMENT: '/posts/:postId/comments',
  DELETE_COMMENT: '/comments/:id',
  
  // Search
  SEARCH: '/search',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

export const REQUEST_TIMEOUT = 10000; // 10 seconds
