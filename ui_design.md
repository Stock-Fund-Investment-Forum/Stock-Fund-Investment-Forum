# 投资论坛前端UI设计文档

## 概述
本文档描述了股票基金投资论坛的前端UI设计，包括页面结构、导航系统、组件设计、样式规范等。

## 技术栈
- **框架**: React 19.2.5
- **路由**: react-router-dom
- **样式**: Tailwind CSS v4
- **图标**: lucide-react v1.14.0
- **开发服务器**: Vite

## 页面结构

### 认证页面（无布局）
以下页面不包含 Header、Sidebar、Footer 布局组件：
- `/login` - 登录页面
- `/register` - 注册页面
- `/forgot-password` - 忘记密码页面

**特点**：
- 左上角有返回按钮，返回到上一页面并保持滚动位置
- 使用 React Router state 传递上一页面的路径和滚动位置

### 主应用页面（包含布局）
以下页面包含完整的 Header、Sidebar、Footer 布局：
- `/` - 首页
- `/profile/:userId` - 用户资料页
- `/settings` - 设置页面
- `/post/:postId` - 帖子详情页
- `/create` - 创建帖子页
- `/forum/:section` - 论坛板块页
- `/search` - 搜索页
- `/messages` - 消息页
- `/groups` - 圈子列表页
- `/groups/:groupId` - 圈子详情页
- `/admin` - 管理后台

## 导航系统

### 主导航配置
导航配置存储在 `src/config/navigation.js` 中：

```javascript
forumSections = {
  "home": { path: "/", label: "首页" },
  "a-stock": { path: "/forum/a-stock", label: "A股" },
  "hk-stock": { path: "/forum/hk-stock", label: "港股" },
  "us-stock": { path: "/forum/us-stock", label: "美股" },
  "fund": { path: "/forum/fund", label: "基金" },
  "value-investing": { path: "/forum/value-investing", label: "价值投资" },
  "quantitative": { path: "/forum/quantitative", label: "量化投资" },
  "groups": { path: "/groups", label: "圈子" }
}
```

### Header 导航栏
- **位置**: 页面顶部固定
- **导航项**: 使用 `headerNavigators` 数组
- **激活状态**: 通过 `section` prop 控制当前激活的导航项
- **样式**: 激活项使用 `text-primary-600` 和底部边框高亮

### Footer 导航栏
- **位置**: 页面底部
- **导航项**: 使用 `footerNavigators` 数组
- **样式**: 灰色背景，白色文字

## 布局组件

### Layout 组件
主布局组件，包含：
- Header（顶部导航栏）
- Sidebar（侧边栏）
- Footer（底部页脚）
- Outlet（子路由渲染区）

**特点**：
- 论坛板块页面 (`/forum/:section`) 使用单独的 Layout 实例，传递 `section` 参数给 Header
- 其他页面使用默认 Layout

### Header 组件
**功能**：
- Logo 和品牌名称
- 搜索框
- 主导航标签
- 用户操作按钮（登录、注册、通知、菜单）

**Props**：
- `section` (可选): 当前论坛板块标识符，用于高亮对应导航项

**样式**：
- 白色背景，底部灰色边框
- 固定在页面顶部 (`sticky top-0`)
- z-index: 50

### Sidebar 组件
**功能**：
- 热榜
- 精华
- 我的关注
- 消息通知
- 圈子
- 设置

**样式**：
- 固定宽度侧边栏
- 灰色背景
- 悬停效果

### Footer 组件
**功能**：
- 关于信息
- 快速链接（用户协议、隐私政策、帮助中心）
- 板块链接
- 联系方式

**样式**：
- 深灰色背景 (`bg-gray-900`)
- 灰色文字
- 四列网格布局

## 页面设计

### 首页 (`/`)
**内容**：
- 精选帖子轮播
- 热门话题榜单（前10名）
- 最新帖子列表
- 市场数据展示

### 登录页面 (`/login`)
**功能**：
- 手机号/邮箱登录切换
- 密码登录
- 验证码登录
- 微信登录（按钮，功能待实现）
- 返回按钮（返回上一页并保持滚动位置）

**样式**：
- 居中卡片布局
- 白色背景，圆角阴影
- 表单输入框带图标

### 注册页面 (`/register`)
**功能**：
- 手机号注册
- 验证码验证
- 密码设置
- 用户协议同意
- 返回按钮（返回上一页并保持滚动位置）

### 忘记密码页面 (`/forgot-password`)
**功能**：
- 三步流程：
  1. 输入邮箱
  2. 验证身份
  3. 重置密码
- 返回按钮（返回上一页并保持滚动位置）

### 论坛板块页 (`/forum/:section`)
**功能**：
- 帖子列表
- 筛选功能（最新、热门、精华）
- 分页
- 发布帖子按钮

**板块类型**：
- A股
- 港股
- 美股
- 基金
- 价值投资
- 量化投资

### 帖子详情页 (`/post/:postId`)
**功能**：
- 帖子内容展示
- 嵌套评论系统
- 投票功能（点赞/踩）
- 分享功能
- 收藏功能
- 回复评论功能

### 创建帖子页 (`/create`)
**功能**：
- 富文本编辑器
- 图片上传
- 附件上传
- 帖子类型选择
- 发布到板块选择

### 用户资料页 (`/profile/:userId`)
**功能**：
- 用户基本信息
- 标签页切换：
  - 帖子
  - 评论
  - 点赞
  - 收藏
  - 成就

### 搜索页 (`/search`)
**功能**：
- 搜索框
- 高级筛选
- 结果标签页：
  - 帖子
  - 用户
  - 股票

### 消息页 (`/messages`)
**功能**：
- 私信列表
- 系统通知
- 消息详情

### 圈子页 (`/groups`)
**功能**：
- 圈子列表
- 圈子搜索
- 创建圈子

### 圈子详情页 (`/groups/:groupId`)
**功能**：
- 圈子信息
- 帖子列表
- 成员列表
- 文件列表
- 投票功能
- 标签页切换

### 管理后台 (`/admin`)
**功能**：
- 概览统计
- 内容审核
- 举报处理
- 用户管理
- 系统设置

## 样式规范

### 颜色系统
- **主色调**: `primary-600` (蓝色系)
- **背景色**:
  - 页面背景: `bg-gray-50`
  - 卡片背景: `bg-white`
  - Footer 背景: `bg-gray-900`
- **文字色**:
  - 主要文字: `text-gray-900`
  - 次要文字: `text-gray-600`
  - 辅助文字: `text-gray-400`

### 间距
- **容器**: `max-w-7xl mx-auto px-4`
- **卡片间距**: `space-y-8`
- **列表项间距**: `space-y-4`

### 边框
- **主边框**: `border border-gray-200`
- **卡片圆角**: `rounded-lg` 或 `rounded-xl`

### 阴影
- **卡片阴影**: `shadow-lg`

### 按钮
- **主按钮**: `bg-primary-600 text-white rounded-lg hover:bg-primary-700`
- **次要按钮**: `border border-gray-300 rounded-lg hover:bg-gray-50`

## 图标系统
使用 lucide-react 图标库，常用图标：
- `Search` - 搜索
- `Bell` - 通知
- `User` - 用户
- `Menu` - 菜单
- `TrendingUp` - 趋势向上
- `ArrowLeft` - 返回
- `ArrowRight` - 前进
- `Mail` - 邮件
- `Shield` - 安全
- `Lock` - 锁

**注意**: 某些图标在 lucide-react v1.14.0 中不可用（如 `Wechat`, `Github`, `Twitter`, `CheckCheck`, `Flame`, `BookOpen`, `ShieldCheck`），已使用替代图标或移除。

## 响应式设计
- **桌面端**: 完整布局，侧边栏显示
- **移动端**: 隐藏部分侧边栏内容，使用汉堡菜单

## 状态管理
- 使用 React Hooks (`useState`, `useEffect`) 管理组件状态
- 使用 React Router hooks (`useNavigate`, `useLocation`, `useParams`) 管理导航状态

## 路由状态传递
认证页面使用 React Router state 传递上一页面信息：
```javascript
state={{ from: location.pathname, scrollY: window.scrollY }}
```

返回时恢复滚动位置：
```javascript
const handleBack = () => {
  navigate(from)
  setTimeout(() => {
    window.scrollTo(0, scrollY)
  }, 0)
}
```

## 待实现功能
- 微信登录 (UC-REG-002)
- 发送验证码逻辑 (UC-REG-001)
- 注册逻辑 (UC-REG-001)
- 密码重置逻辑
- 后端 API 集成
- 真实数据加载
- 用户认证系统
