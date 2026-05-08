import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <a href="/" className="logo">
            <span className="logo-icon">💰</span>
            <span className="logo-text">股基论坛</span>
          </a>
          
          <nav className="nav">
            <a href="/market/a-stock" className="nav-link">A股</a>
            <a href="/market/hk-stock" className="nav-link">港股</a>
            <a href="/market/us-stock" className="nav-link">美股</a>
            <a href="/specialized/value" className="nav-link">价值投资</a>
            <a href="/specialized/quant" className="nav-link">量化投资</a>
            <a href="/hot" className="nav-link">热榜</a>
          </nav>
        </div>

        <div className="header-middle">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="搜索帖子、股票、用户..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>
        </div>

        <div className="header-right">
          {user ? (
            <>
              <a href="/publish" className="btn btn-primary">
                + 发帖
              </a>
              <div className="user-menu">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="user-avatar"
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <div className="dropdown-menu">
                    <a href={`/user/${user.id}`} className="menu-item">
                      个人主页
                    </a>
                    <a href="/settings" className="menu-item">
                      设置
                    </a>
                    <a href="/my-posts" className="menu-item">
                      我的帖子
                    </a>
                    <button
                      className="menu-item menu-logout"
                      onClick={logout}
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="btn btn-text">登录</a>
              <a href="/register" className="btn btn-primary">注册</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
