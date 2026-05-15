import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersService, postsService } from '../services';
import { Loader } from 'lucide-react';
import '../styles/UserProfile.css';

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载用户资料和帖子
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const targetUserId = userId || currentUser?.id;
        if (!targetUserId) {
          throw new Error('用户不存在');
        }

        // 并行获取用户信息和帖子
        const [userRes, postsRes] = await Promise.all([
          usersService.getUser(targetUserId),
          postsService.getPosts({ user_id: targetUserId, page: 1, per_page: 20 })
        ]);

        setProfileUser(userRes);
        setUserPosts(postsRes.items || postsRes || []);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError(err.message || '加载数据失败');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId, currentUser?.id]);

  const getVerifiedBadge = (authLevel) => {
    const badges = {
      'EXPERT': { text: '专家', color: '#FFD700' },
      'PROFESSIONAL': { text: '专业认证', color: '#4169E1' },
      'MEDIA': { text: '媒体人', color: '#FF6347' },
      'USER': { text: '普通用户', color: '#999' },
    };
    return badges[authLevel] || badges['USER'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="user-profile-container">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">加载失败: {error || '用户不存在'}</p>
        </div>
      </div>
    );
  }

  const badge = getVerifiedBadge(profileUser.auth_level);

  return (
    <div className="user-profile-container">
      {/* 用户头部 */}
      <div className="profile-header">
        <div className="profile-cover" />
        <div className="profile-info">
          <img src={profileUser.avatar} alt={profileUser.nickname} className="profile-avatar" />
          <div className="profile-details">
            <h1 className="profile-username">
              {profileUser.nickname}
              {profileUser.auth_level !== 'USER' && (
                <span className="verified-badge" style={{ backgroundColor: badge.color }}>
                  ✓ {badge.text}
                </span>
              )}
            </h1>
            <p className="profile-level">Lv.{profileUser.level || 1}</p>
            <p className="profile-bio">{profileUser.bio || '这个用户还没有介绍'}</p>
            <div className="profile-meta">
              <span>加入于 {new Date(profileUser.created_at).toLocaleDateString()}</span>
              <span>积分 {profileUser.points || 0}</span>
            </div>
          </div>

          {currentUser?.id === profileUser.id ? (
            <button className="btn btn-primary">编辑资料</button>
          ) : (
            <button className="btn btn-primary">+ 关注</button>
          )}
        </div>

        {/* 统计数据 */}
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-number">{profileUser.followers_count || 0}</div>
            <div className="stat-label">粉丝</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profileUser.following_count || 0}</div>
            <div className="stat-label">关注</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{userPosts.length}</div>
            <div className="stat-label">帖子</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profileUser.posts_liked_count || 0}</div>
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
                  <a key={post.post_id} href={`/post/${post.post_id}`} className="post-item">
                    <div className="post-title">
                      {post.title}
                      {post.is_essence && <span className="essence-tag">✨ 精华</span>}
                    </div>
                    <div className="post-meta">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span>💬 {post.comment_count || 0}</span>
                      <span>❤️ {post.like_count || 0}</span>
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
                <p className="achievements-desc">继续参与社区活动以解锁更多成就</p>
              </div>
              <div className="achievement-grid">
                <div className="empty-state">暂无成就数据</div>
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
