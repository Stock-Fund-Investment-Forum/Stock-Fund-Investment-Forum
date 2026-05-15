import React, { useState, useEffect } from 'react';
import { postsService } from '../services';
import '../styles/HomePage.css';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('recommend');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 从后端获取帖子
        const response = await postsService.getPosts({ 
          page: 1, 
          per_page: 10,
        });
        
        const postsData = response.items || response || [];
        setPosts(postsData);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError(err.message || '加载帖子失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab]);

  const handleLike = async (postId) => {
    try {
      // 调用 API 进行点赞操作
      // TODO: 等待后端实现点赞 API endpoint
      console.warn('Like post:', postId);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleComment = (postId) => {
    window.location.href = `/post/${postId}`;
  };

  if (loading) {
    return (
      <div className="home-page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>加载失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="feed-header">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'recommend' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommend')}
          >
            推荐
          </button>
          <button
            className={`tab ${activeTab === 'latest' ? 'active' : ''}`}
            onClick={() => setActiveTab('latest')}
          >
            最新
          </button>
          <button
            className={`tab ${activeTab === 'follow' ? 'active' : ''}`}
            onClick={() => setActiveTab('follow')}
          >
            关注
          </button>
        </div>
      </div>

      <div className="posts-feed">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>暂无内容</p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.post_id} className="post-card">
              <div className="post-header">
                <div className="author-info">
                  <img 
                    src={'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (post.user_id || 'user')} 
                    alt={post.user_id} 
                    className="author-avatar" 
                  />
                  <div className="author-details">
                    <h4 className="author-name">{post.user_id}</h4>
                    <span className="post-meta">
                      {post.board_id} · {new Date(post.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {post.is_essence && <span className="badge badge-essence">✨ 精华</span>}
              </div>

              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.content}</p>

                <div className="post-tags">
                  {/* Tags from API if available */}
                </div>
              </div>

              <div className="post-footer">
                <div className="post-stats">
                  <span className="stat">
                    <i className="icon icon-eye"></i> {post.view_count || 0} 浏览
                  </span>
                  <span className="stat">
                    <i className="icon icon-like"></i> {post.like_count || 0} 点赞
                  </span>
                  <span className="stat">
                    <i className="icon icon-comment"></i> {post.comment_count || 0} 评论
                  </span>
                </div>
                <div className="post-actions">
                  <button className="action-btn" onClick={() => handleLike(post.post_id)}>
                    👍 点赞
                  </button>
                  <button className="action-btn" onClick={() => handleComment(post.post_id)}>
                    💬 评论
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      <div className="feed-sidebar">
        <div className="card">
          <h3>🔥 热门股票</h3>
          <div className="hot-stocks">
            {[
              { name: '贵州茅台', code: '600519', change: '+2.5%' },
              { name: '宁德时代', code: '300750', change: '+1.8%' },
              { name: '比亚迪', code: 'BYD', change: '+3.2%' },
              { name: '五粮液', code: '000858', change: '+0.5%' },
              { name: '中国平安', code: '601318', change: '-1.2%' },
            ].map((stock, idx) => (
              <a key={idx} href={`/stock/${stock.code}`} className="stock-item">
                <div className="stock-name">{stock.name}</div>
                <div className={`stock-change ${stock.change.startsWith('+') ? 'positive' : 'negative'}`}>
                  {stock.change}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>📊 热门话题</h3>
          <div className="hot-topics">
            {['半导体', '新能源', 'AI芯片', '消费'].map((topic, idx) => (
              <a key={idx} href={`/search?q=${topic}`} className="topic-item">
                #{topic}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
