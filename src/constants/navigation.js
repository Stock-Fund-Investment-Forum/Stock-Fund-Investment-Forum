/**
 * Navigation links configuration
 */
export const MAIN_NAV = [
  { id: 'a-stock', label: 'A股', href: '/market/a-stock', icon: '📈' },
  { id: 'hk-stock', label: '港股', href: '/market/hk-stock', icon: '🇭🇰' },
  { id: 'us-stock', label: '美股', href: '/market/us-stock', icon: '🇺🇸' },
  { id: 'value', label: '价值投资', href: '/specialized/value', icon: '💎' },
  { id: 'quant', label: '量化投资', href: '/specialized/quant', icon: '📊' },
  { id: 'hot', label: '热榜', href: '/hot', icon: '🔥' },
];

export const USER_NAV = [
  { id: 'profile', label: '个人资料', href: '/profile/:userId' },
  { id: 'settings', label: '设置', href: '/settings' },
  { id: 'favorites', label: '收藏', href: '/favorites' },
  { id: 'messages', label: '消息', href: '/messages' },
];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile/:userId',
  SETTINGS: '/settings',
  POST_DETAIL: '/post/:postId',
  CREATE_POST: '/create',
  SEARCH: '/search',
  MESSAGES: '/messages',
  GROUPS: '/groups',
  GROUP_DETAIL: '/groups/:groupId',
  ADMIN: '/admin',
  FORUM_SECTION: '/forum/:section',
};

export const SORT_OPTIONS = [
  { id: 'hot', label: '热度' },
  { id: 'latest', label: '最新' },
  { id: 'replies', label: '回复' },
];

export const TAGS = [
  '新能源',
  '行业分析',
  '财报解读',
  '量化交易',
  '基金定投',
  '港股通',
  '美股ETF',
  'REITs',
  '人工智能',
  '半导体',
];
