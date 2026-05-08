import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('recommend');

  useEffect(() => {
    // 模拟加载帖子数据
    const mockPosts = [
      {
        id: '1',
        title: '宁德时代今日走势分析',
        author: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
        content: '从分时图看，早盘放量突破，说明主力意图明确...',
        board: 'A股讨论',
        comments: 45,
        likes: 120,
        views: 2500,
        tags: ['CATL', '新能源', '技术面'],
        timestamp: '2小时前',
        image: 'https://via.placeholder.com/400x200?text=CATL+Chart',
        isHot: true,
        isEssence: false,
      },
      {
        id: '2',
        title: '2024年新能源行业投资策略',
        author: '李四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
        content: '从基本面分析，新能源行业仍然处于发展初期，未来增长空间巨大...',
        board: '价值投资专区',
        comments: 78,
        likes: 320,
        views: 5200,
        tags: ['新能源', '基本面', '长期投资'],
        timestamp: '4小时前',
        image: null,
        isHot: true,
        isEssence: true,
      },
      {
        id: '3',
        title: '下周上证指数走势投票',
        author: '王五',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
        content: '投票：下周上证指数会如何走势？',
        board: 'A股讨论',
        comments: 156,
        likes: 210,
        views: 3800,
        tags: ['投票', '指数', '预测'],
        timestamp: '6小时前',
        image: null,
        isHot: true,
        isEssence: false,
        isPoll: true,
        pollOptions: ['上涨', '震荡', '下跌'],
        pollVotes: [45, 38, 17],
      },
    ];
    setPosts(mockPosts);
  }, [activeTab]);

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleComment = (postId) => {
    window.location.href = `/post/${postId}`;
  };

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
            <article key={post.id} className="post-card">
              <div className="post-header">
                <div className="author-info">
                  <img src={post.avatar} alt={post.author} className="author-avatar" />
                  <div className="author-details">
                    <h4 className="author-name">{post.author}</h4>
                    <span className="post-meta">
                      {post.board} · {post.timestamp}
                    </span>
                  </div>
                </div>
                {post.isHot && <span className="badge badge-hot">🔥 热</span>}
                {post.isEssence && <span className="badge badge-essence">✨ 精华</span>}
              </div>

              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.content}</p>

                {post.image && (
                  <div className="post-image">
                    <img src={post.image} alt="post" />
                  </div>
                )}

                {post.isPoll && (
                  <div className="poll-section">
                    {post.pollOptions.map((option, idx) => (
                      <div key={idx} className="poll-option">
                        <div className="option-text">{option}</div>
                        <div className="option-bar">
                          <div
                            className="option-progress"
                            style={{
                              width: `${(post.pollVotes[idx] / post.pollVotes.reduce((a, b) => a + b, 0)) * 100}%`,
                            }}
                          />
                          <span className="option-percent">
                            {Math.round((post.pollVotes[idx] / post.pollVotes.reduce((a, b) => a + b, 0)) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="post-tags">
                  {post.tags.map((tag) => (
                    <a key={tag} href={`/search?q=${tag}`} className="tag">
                      #{tag}
                    </a>
                  ))}
                </div>
              </div>

              <div className="post-stats">
                <span className="stat">👁️ {post.views} 浏览</span>
                <span className="stat">💬 {post.comments} 评论</span>
                <span className="stat">❤️ {post.likes} 点赞</span>
              </div>

              <div className="post-actions">
                <button
                  className="action-btn"
                  onClick={() => handleLike(post.id)}
                >
                  ❤️ 点赞
                </button>
                <button
                  className="action-btn"
                  onClick={() => handleComment(post.id)}
                >
                  💬 评论
                </button>
                <button className="action-btn">
                  💾 收藏
                </button>
                <button className="action-btn">
                  🔗 分享
                </button>
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
