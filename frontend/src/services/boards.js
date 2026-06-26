/**
 * Boards API Service
 * Handles all board-related API calls
 */
import { get, post } from '../utils/http';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get all boards
 * @returns {Promise} Boards list
 */
export const getBoards = async () => {
  return get(API_ENDPOINTS.GET_BOARDS);
};

/**
 * Create new board (admin only)
 * @param {object} boardData - Board data
 * @param {string} boardData.name - Board name
 * @param {string} boardData.category - Board category
 * @param {string} boardData.description - Board description
 * @returns {Promise} Created board
 */
export const createBoard = async (boardData) => {
  return post(API_ENDPOINTS.CREATE_BOARD, boardData);
};
