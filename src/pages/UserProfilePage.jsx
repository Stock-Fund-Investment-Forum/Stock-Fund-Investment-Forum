import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/UserProfile.css';

export default function UserProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  const profileUser = {
    id: user?.id,
    username: user?.username || 'visitor',
    avatar: user?.avatar,
    level: 4,
    points: 8520,
    followers: 1250,
    following: 380,
    bio: '价值投资践行者，关注长期收益。6年投资经验，专注于消费和科技领域',
    isVerified: true,
    verifiedType: 'analyst', // analyst, professional, media
    joinDate: '2018年3月',
    stats: {
      posts: 156,
      comments: 2345,
      likes: 5678,
      collections: 890,
    },
    achievements: [
      { name: '新手上路', icon: '🎯' },
      { name: '精华达人', icon: '✨' },
      { name: '影响力之星', icon: '⭐' },
      { name: '十日签到', icon: '🔥' },
    ],
  };

  const userPosts = [
    {
      id: '1',
      title: '宁德时代今日走势分析',
      timestamp: '2024-05-07',
      comments: 45,
      likes: 120,
      isEssence: true,
    },
    {
      id: '2',
      title: '2024年新能源行业投资策略',
      timestamp: '2024-05-06',
      comments: 78,
      likes: 320,
      isEssence: true,
    },
  ];

  const getVerifiedBadge = (type) => {
    const badges = {
      analyst: { text: '分析师', color: '#FFD700' },
      professional: { text: '专业认证', color: '#4169E1' },
      media: { text: '媒体人', color: '#FF6347' },
    };
    return badges[type];
  };

  const badge = getVerifiedBadge(profileUser.verifiedType);

  return (
    <div className="user-profile-container">
      {/* 用户头部 */}
      <div className="profile-header">
        <div className="profile-cover" />
        <div className="profile-info">
          <img src={profileUser.avatar} alt={profileUser.username} className="profile-avatar" />
          <div className="profile-details">
            <h1 className="profile-username">
              {profileUser.username}
              {profileUser.isVerified && (
                <span className="verified-badge" style={{ backgroundColor: badge.color }}>
                  ✓ {badge.text}
                </span>
              )}
            </h1>
            <p className="profile-level">Lv.{profileUser.level}</p>
            <p className="profile-bio">{profileUser.bio}</p>
            <div className="profile-meta">
              <span>加入于 {profileUser.joinDate}</span>
              <span>积分 {profileUser.points}</span>
            </div>
          </div>

          {user?.id === profileUser.id ? (
            <button className="btn btn-primary">编辑资料</button>
          ) : (
            <button className="btn btn-primary">+ 关注</button>
          )}
        </div>

        {/* 统计数据 */}
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-number">{profileUser.followers}</div>
            <div className="stat-label">粉丝</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profileUser.following}</div>
            <div className="stat-label">关注</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profileUser.stats.posts}</div>
            <div className="stat-label">帖子</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profileUser.stats.likes}</div>
            <div className="stat-label">点赞</div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          {/* Tab 导航 */}
          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              📝 帖子
            </button>
            <button
              className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              🏆 成就
            </button>
            <button
              className={`tab ${activeTab === 'collections' ? 'active' : ''}`}
              onClick={() => setActiveTab('collections')}
            >
              💾 收藏
            </button>
            <button
              className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              👥 粉丝
            </button>
          </div>

          {/* 帖子列表 */}
          {activeTab === 'posts' && (
            <div className="profile-posts">
              {userPosts.length === 0 ? (
                <div className="empty-state">还没有发表过帖子</div>
              ) : (
                userPosts.map((post) => (
                  <a key={post.id} href={`/post/${post.id}`} className="post-item">
                    <div className="post-title">
                      {post.title}
                      {post.isEssence && <span className="essence-tag">✨ 精华</span>}
                    </div>
                    <div className="post-meta">
                      <span>{post.timestamp}</span>
                      <span>💬 {post.comments}</span>
                      <span>❤️ {post.likes}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

          {/* 成就勋章 */}
          {activeTab === 'achievements' && (
            <div className="achievements">
              <div className="achievements-header">
                <h3>用户成就</h3>
                <p className="achievements-desc">收集更多勋章以展示你的社区贡献</p>
              </div>
              <div className="achievement-grid">
                {profileUser.achievements.map((achievement, idx) => (
                  <div key={idx} className="achievement-card unlocked">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-name">{achievement.name}</div>
                  </div>
                ))}
              </div>
              <div className="locked-achievements">
                <h4>未获得成就</h4>
                <div className="achievement-grid">
                  {[
                    { name: '百篇作者', icon: '📚' },
                    { name: '十年老友', icon: '⏰' },
                    { name: '社区贡献者', icon: '🌟' },
                  ].map((achievement, idx) => (
                    <div key={idx} className="achievement-card locked">
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-name">{achievement.name}</div>
                      <div className="achievement-hint">?</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 收藏 */}
          {activeTab === 'collections' && (
            <div className="profile-collections">
              <div className="collection-folders">
                {[
                  { name: '精选分析', count: 45 },
                  { name: '长期持仓', count: 32 },
                  { name: '行业研究', count: 28 },
                ].map((folder, idx) => (
                  <div key={idx} className="collection-folder">
                    <div className="folder-icon">📁</div>
                    <div className="folder-info">
                      <h4>{folder.name}</h4>
                      <p>{folder.count} 篇文章</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 粉丝 */}
          {activeTab === 'followers' && (
            <div className="profile-followers">
              <div className="followers-grid">
                {[
                  { name: 'User A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=follower1' },
                  { name: 'User B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=follower2' },
                  { name: 'User C', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=follower3' },
                ].map((follower, idx) => (
                  <div key={idx} className="follower-card">
                    <img src={follower.avatar} alt={follower.name} />
                    <h4>{follower.name}</h4>
                    <button className="btn btn-sm">关注</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧栏 */}
        <aside className="profile-sidebar">
          <div className="card">
            <h4>热门帖子</h4>
            {userPosts.slice(0, 3).map((post, idx) => (
              <a key={idx} href={`/post/${post.id}`} className="sidebar-post">
                <p>{post.title}</p>
                <small>❤️ {post.likes}</small>
              </a>
            ))}
          </div>

          <div className="card">
            <h4>用户排行</h4>
            <p className="rank-info">
              <span>排名: <strong>#45</strong></span>
              <span>积分: <strong>{profileUser.points}</strong></span>
            </p>
            <div className="rank-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '65%' }} />
              </div>
              <small>距下一等级还需 1500 积分</small>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
