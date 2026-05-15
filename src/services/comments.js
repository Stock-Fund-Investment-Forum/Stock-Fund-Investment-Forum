/**
 * Comments API Service
 * Handles all comment-related API calls
 */
import { get, post, put, deleteRequest } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @param {object} params - Query parameters (page, per_page)
 * @returns {Promise} Comments list
 */
export const getPostComments = async (postId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = API_ENDPOINTS.GET_POST_COMMENTS.replace(':postId', postId);
  return get(`${endpoint}${query ? '?' + query : ''}`);
};

/**
 * Get single comment
 * @param {string} commentId - Comment ID
 * @returns {Promise} Comment object
 */
export const getComment = async (commentId) => {
  return get(API_ENDPOINTS.GET_COMMENT.replace(':commentId', commentId));
};

/**
 * Create comment on a post
 * @param {string} postId - Post ID
 * @param {object} commentData - Comment data
 * @param {string} commentData.content - Comment content
 * @param {string} commentData.parent_comment_id - Parent comment ID (for replies)
 * @returns {Promise} Created comment
 */
export const createComment = async (postId, commentData) => {
  const endpoint = API_ENDPOINTS.CREATE_COMMENT.replace(':postId', postId);
  return post(endpoint, commentData);
};

/**
 * Update comment
 * @param {string} commentId - Comment ID
 * @param {object} updates - Fields to update
 * @returns {Promise} Updated comment
 */
export const updateComment = async (commentId, updates) => {
  return put(API_ENDPOINTS.UPDATE_COMMENT.replace(':commentId', commentId), updates);
};

/**
 * Delete comment
 * @param {string} commentId - Comment ID
 * @returns {Promise}
 */
export const deleteComment = async (commentId) => {
  return deleteRequest(API_ENDPOINTS.DELETE_COMMENT.replace(':commentId', commentId));
};
