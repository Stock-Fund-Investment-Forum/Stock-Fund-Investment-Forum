/**
 * API Services Index
 * Central export for all API service modules
 */

export * as postsService from './posts';
export * as commentsService from './comments';
export * as usersService from './users';
export * as boardsService from './boards';
export * as tagsService from './tags';
export * as messagesService from './messages';
export * as notificationsService from './notifications';
export * as stocksService from './stocks';
export * as groupsService from './groups';

// Alternative: Direct imports
// import { getPosts, createPost } from './services/posts';
// import { getComments, createComment } from './services/comments';
// etc.
