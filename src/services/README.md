# Backend API Integration Guide

此目录包含所有后端 API 的服务层实现，根据 `backend_api.md` 和 `backend_openapi.yaml` 规范创建。

## 目录结构

```
src/
├── services/
│   ├── index.js          # Services 导出文件
│   ├── posts.js          # 帖子相关 API
│   ├── comments.js       # 评论相关 API
│   ├── users.js          # 用户相关 API
│   ├── boards.js         # 板块相关 API
│   ├── tags.js           # 标签相关 API
│   ├── messages.js       # 私信相关 API
│   ├── notifications.js  # 通知相关 API
│   ├── stocks.js         # 股票/基金相关 API
│   └── groups.js         # 群组相关 API
├── utils/
│   └── http.js          # HTTP 请求工具（支持 JWT）
├── constants/
│   └── api.js           # API 端点和配置
└── context/
    └── AuthContext.jsx  # 认证上下文（已集成真实 API）
```

## 配置

### 1. 环境变量 (`.env`)

```env
VITE_API_URL=http://localhost:8080
VITE_API_BASE_PATH=/api/v1
VITE_REQUEST_TIMEOUT=10000
```

### 2. Vite Proxy 配置

已在 `vite.config.js` 中配置，支持 `/api` 代理：

```javascript
proxy: {
  '/api': {
    target: process.env.VITE_API_URL || 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

## 使用方式

### 方式 1: 使用 Services (推荐)

```javascript
import { postsService, commentsService } from '@/services';

// 获取帖子列表
const posts = await postsService.getPosts({ page: 1, per_page: 20 });

// 创建帖子
const newPost = await postsService.createPost({
  board_id: 'board_001',
  title: '讨论标题',
  content: '正文内容',
  tags: ['tag_001'],
  post_type: 'DISCUSSION',
});

// 获取评论
const comments = await commentsService.getPostComments('post_123');

// 发布评论
const comment = await commentsService.createComment('post_123', {
  content: '评论内容',
  parent_comment_id: null, // 可选，用于回复
});
```

### 方式 2: 直接导入

```javascript
import { getPosts, createPost } from '@/services/posts';
import { getComments, createComment } from '@/services/comments';

const posts = await getPosts({ page: 1 });
```

### 方式 3: 使用低级 HTTP 工具

```javascript
import { post, get } from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';

const posts = await get(API_ENDPOINTS.GET_POSTS);
const comment = await post(API_ENDPOINTS.CREATE_COMMENT.replace(':postId', postId), {
  content: 'Hello',
});
```

## Authentication (认证)

### 登录

```javascript
import { useAuth } from '@/context/AuthContext';

const { login, user, error, isLoading } = useAuth();

// 登录
try {
  await login('user@example.com', 'password');
} catch (err) {
  console.error('Login failed:', err);
}
```

### 自动 JWT 传递

所有 API 请求会自动包含 `Authorization: Bearer <token>` 头部。Token 存储在 localStorage 中，密钥为 `sfif_auth_token`。

### 登出

```javascript
const { logout } = useAuth();
logout(); // 清除 token 和用户信息
```

## API Endpoints 参考

### Posts (帖子)

```javascript
import { postsService } from '@/services';

// 获取帖子列表（支持搜索、分页、过滤）
await postsService.getPosts({ 
  page: 1, 
  per_page: 20,
  q: 'keyword',        // 搜索关键词
  tag: 'tag_id',       // 标签过滤
  board_id: 'board_id' // 板块过滤
});

// 获取单个帖子
await postsService.getPost('post_id');

// 创建帖子
await postsService.createPost({
  board_id: 'board_002',
  title: '标题',
  content: '内容',
  tags: ['tag_001', 'tag_002'],
  post_type: 'DISCUSSION' // QUESTION, DISCUSSION, ANALYSIS, NEWS, GUIDE
});

// 更新帖子
await postsService.updatePost('post_id', {
  title: '新标题',
  content: '新内容'
});

// 删除帖子
await postsService.deletePost('post_id');

// 获取板块的帖子
await postsService.getBoardPosts('board_id', { page: 1 });
```

### Comments (评论)

```javascript
import { commentsService } from '@/services';

// 获取帖子评论
await commentsService.getPostComments('post_id', { page: 1 });

// 发布评论
await commentsService.createComment('post_id', {
  content: '评论内容',
  parent_comment_id: null // 可选，用于回复
});

// 更新评论
await commentsService.updateComment('comment_id', {
  content: '修改后的内容'
});

// 删除评论
await commentsService.deleteComment('comment_id');
```

### Users (用户)

```javascript
import { usersService } from '@/services';

// 获取用户列表
await usersService.getUsers({ page: 1, per_page: 20 });

// 获取用户信息
await usersService.getUser('user_id');

// 更新用户信息
await usersService.updateUser('user_id', {
  nickname: '新昵称',
  avatar: 'avatar_url',
  bio: '个人简介'
});
```

### Boards (板块)

```javascript
import { boardsService } from '@/services';

// 获取所有板块
await boardsService.getBoards();

// 创建板块（管理员）
await boardsService.createBoard({
  name: '板块名称',
  category: '分类',
  description: '描述'
});
```

### Tags (标签)

```javascript
import { tagsService } from '@/services';

// 获取标签
await tagsService.getTags(); // 获取所有标签

// 搜索标签
await tagsService.getTags('keyword');
```

### Messages (私信)

```javascript
import { messagesService } from '@/services';

// 获取消息
await messagesService.getMessages({ page: 1 });

// 发送私信
await messagesService.sendMessage({
  recipient_id: 'user_id',
  content: '私信内容'
});
```

### Notifications (通知)

```javascript
import { notificationsService } from '@/services';

// 获取通知
await notificationsService.getNotifications();

// 获取未读通知
await notificationsService.getNotifications({ is_read: false });
```

### Stocks (股票/基金)

```javascript
import { stocksService } from '@/services';

// 搜索股票
await stocksService.getStocks({ q: 'keyword' });

// 按 symbol 搜索
await stocksService.getStocks({ symbol: 'AAPL' });
```

### Groups (群组)

```javascript
import { groupsService } from '@/services';

// 获取群组列表
await groupsService.getGroups();

// 创建群组
await groupsService.createGroup({
  name: '群组名称',
  description: '描述',
  access_level: 'PUBLIC' // 或 PRIVATE
});
```

## 错误处理

所有 API 调用都会抛出 `ApiError` 异常。建议使用 try-catch：

```javascript
import { postsService } from '@/services';

try {
  const posts = await postsService.getPosts();
} catch (error) {
  console.error('Error code:', error.status);
  console.error('Error message:', error.message);
  console.error('Error data:', error.data);
}
```

### 常见错误码

- `200`: 成功
- `201`: 资源已创建
- `204`: 成功但无返回内容
- `400`: 请求参数错误
- `401`: 未授权（token 无效或过期）
- `403`: 禁止访问（无权限）
- `404`: 资源未找到
- `422`: 验证失败
- `500`: 服务器内部错误

## 开发建议

### 1. 创建 Custom Hooks 封装业务逻辑

```javascript
// hooks/usePosts.js
import { useState, useCallback } from 'react';
import { postsService } from '@/services';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsService.getPosts(params);
      setPosts(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { posts, loading, error, fetchPosts };
};
```

### 2. 集中管理 Loading 和 Error 状态

```javascript
// 在 React 组件中
const { posts, loading, error, fetchPosts } = usePosts();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorAlert message={error} />;
```

### 3. 使用 State Management (可选)

如果项目复杂，可以考虑使用 Redux 或 Zustand 管理 API 状态。

## 常见问题

### Q: 如何处理 CORS 错误？
A: 如果后端已配置 CORS，Vite 的 proxy 配置应该能解决。确保 `.env` 中的 `VITE_API_URL` 正确。

### Q: Token 过期怎么办？
A: 当收到 401 错误时，系统会自动清除 token。用户需要重新登录。

### Q: 如何上传文件？
A: 使用 `uploadFile` 函数：
```javascript
import { uploadFile } from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';

const formData = new FormData();
formData.append('file', file);
formData.append('post_id', 'post_123');

const result = await uploadFile(API_ENDPOINTS.UPLOAD_ATTACHMENT, formData);
```

## 更新日期

- 2026-05-15: 初始版本，基于 backend_api.md 和 backend_openapi.yaml
