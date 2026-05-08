import React from 'react';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const categories = [
    { name: '推荐', path: '/', icon: '⭐' },
    { name: '精华', path: '/essence', icon: '✨' },
    { name: '热榜', path: '/hot', icon: '🔥' },
    { name: '动态', path: '/timeline', icon: '📱' },
  ];

  const markets = [
    { name: 'A股讨论', path: '/market/a-stock', icon: '🇨🇳' },
    { name: '港股讨论', path: '/market/hk-stock', icon: '🇭🇰' },
    { name: '美股讨论', path: '/market/us-stock', icon: '🇺🇸' },
    { name: '期货讨论', path: '/market/futures', icon: '📊' },
  ];

  const specializations = [
    { name: '价值投资', path: '/specialized/value', icon: '💎' },
    { name: '量化投资', path: '/specialized/quant', icon: '🤖' },
    { name: '基金讨论', path: '/specialized/fund', icon: '📈' },
    { name: '新股/新债', path: '/specialized/new-security', icon: '🎯' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">导航</h3>
        <nav className="sidebar-nav">
          {categories.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="sidebar-link"
            >
              <span className="icon">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">市场分类</h3>
        <nav className="sidebar-nav">
          {markets.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="sidebar-link"
            >
              <span className="icon">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">专区</h3>
        <nav className="sidebar-nav">
          {specializations.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="sidebar-link"
            >
              <span className="icon">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">我的</h3>
        <nav className="sidebar-nav">
          <a href="/my-posts" className="sidebar-link">
            <span className="icon">📝</span>
            <span>我的帖子</span>
          </a>
          <a href="/my-follows" className="sidebar-link">
            <span className="icon">⭐</span>
            <span>我的关注</span>
          </a>
          <a href="/my-collections" className="sidebar-link">
            <span className="icon">💾</span>
            <span>收藏夹</span>
          </a>
          <a href="/my-groups" className="sidebar-link">
            <span className="icon">👥</span>
            <span>我的群组</span>
          </a>
        </nav>
      </div>
    </aside>
  );
}
