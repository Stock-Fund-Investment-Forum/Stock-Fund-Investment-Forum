/**
 * Posts API Service
 * Handles all post-related API calls
 */
import { get, post, put, deleteRequest } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

export const likePost = async (postId) => {
  return post(API_ENDPOINTS.LIKE_POST.replace(':postId', postId));
};

export const unlikePost = async (postId) => {
  return post(API_ENDPOINTS.UNLIKE_POST.replace(':postId', postId));
};

/**
 * Get all posts with pagination and filtering
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number (default 1)
 * @param {number} params.per_page - Items per page (default 20)
 * @param {string} params.q - Search keyword
 * @param {string} params.tag - Tag filter
 * @param {string} params.board_id - Board ID filter
 * @returns {Promise} Posts list
 */
export const getPosts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return get(`${API_ENDPOINTS.GET_POSTS}${query ? '?' + query : ''}`);
};

/**
 * Get single post details
 * @param {string} postId - Post ID
 * @returns {Promise} Post object
 */
export const getPost = async (postId) => {
  return get(API_ENDPOINTS.GET_POST.replace(':postId', postId));
};

/**
 * Create new post
 * @param {object} postData - Post data
 * @param {string} postData.board_id - Board ID
 * @param {string} postData.title - Post title
 * @param {string} postData.content - Post content
 * @param {array} postData.tags - Tag IDs
 * @param {string} postData.post_type - Post type (QUESTION, DISCUSSION, ANALYSIS, NEWS, GUIDE)
 * @returns {Promise} Created post
 */
export const createPost = async (postData) => {
  return post(API_ENDPOINTS.CREATE_POST, postData);
};

/**
 * Update post
 * @param {string} postId - Post ID
 * @param {object} updates - Fields to update
 * @returns {Promise} Updated post
 */
export const updatePost = async (postId, updates) => {
  return put(API_ENDPOINTS.UPDATE_POST.replace(':postId', postId), updates);
};

/**
 * Delete post (soft delete)
 * @param {string} postId - Post ID
 * @returns {Promise}
 */
export const deletePost = async (postId) => {
  return deleteRequest(API_ENDPOINTS.DELETE_POST.replace(':postId', postId));
};

/**
 * Get posts for a specific board
 * @param {string} boardId - Board ID
 * @param {object} params - Query parameters
 * @returns {Promise} Posts list
 */
export const getBoardPosts = async (boardId, params = {}) => {
  const query = new URLSearchParams({ ...params, board_id: boardId }).toString();
  return get(`${API_ENDPOINTS.GET_POSTS}${query ? '?' + query : ''}`);
};
