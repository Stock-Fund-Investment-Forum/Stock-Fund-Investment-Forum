import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/PostDetail.css';

export default function PostDetailPage() {
  const { user } = useAuth();
  const [comments, setComments] = useState([
    {
      id: '1',
      author: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      level: 3,
      content: '分析得很深入，尤其是对基本面的把握。不过我觉得估值还需要再看看。',
      timestamp: '2小时前',
      likes: 45,
      replies: [
        {
          id: '1-1',
          author: '张三',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
          content: '@李四 确实，估值在历史相对高位',
          timestamp: '1小时前',
          likes: 12,
        },
      ],
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const post = {
    id: '1',
    title: '宁德时代今日走势分析',
    author: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    level: 4,
    followers: 1250,
    isFollowing: false,
    content: `从分时图看，早盘放量突破，说明主力意图明确。

技术面分析：
1. 突破前期高点 280 元，上方目标 320 元
2. 成交量持续温和放大，资金持续流入
3. 均线系统形成多头排列

基本面支撑：
- 最新财报超预期，净利润同比增长 45%
- 新产品线贡献收入 20%
- 海外订单增长势头强劲

风险提示：
- 新能源政策风险
- 竞争加剧导致毛利率下降
- 汇率波动影响`,
    board: 'A股讨论',
    tags: ['CATL', '新能源', '技术面'],
    timestamp: '2024-05-07 10:30',
    views: 2500,
    comments: 45,
    likes: 120,
    isHot: true,
    isEssence: true,
    images: [
      'https://via.placeholder.com/600x400?text=K-line+Chart',
      'https://via.placeholder.com/600x400?text=Technical+Analysis',
    ],
  };

  const handleLike = () => {
    alert('已点赞');
  };

  const handleFollow = () => {
    alert('已关注');
  };

  const handleShare = () => {
    alert('已复制分享链接');
  };

  const handleComment = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (!newComment.trim()) {
      alert('请输入评论内容');
      return;
    }

    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: user.username,
      avatar: user.avatar,
      level: user.level,
      content: newComment,
      timestamp: '刚刚',
      likes: 0,
      replies: [],
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <div className="post-detail-container">
      <div className="post-detail-main">
        {/* 帖子内容 */}
        <article className="post-detail">
          <div className="post-detail-header">
            <div className="post-meta">
              <img src={post.avatar} alt={post.author} className="author-avatar" />
              <div className="author-info">
                <div className="author-header">
                  <h4 className="author-name">{post.author}</h4>
                  <span className="level-badge">Lv.{post.level}</span>
                  {post.isFollowing ? (
                    <span className="following-badge">已关注</span>
                  ) : (
                    <button className="btn btn-sm" onClick={handleFollow}>
                      + 关注
                    </button>
                  )}
                </div>
                <p className="post-timestamp">
                  {post.board} · {post.timestamp}
                </p>
              </div>
            </div>

            <div className="post-badges">
              {post.isHot && <span className="badge badge-hot">🔥 热</span>}
              {post.isEssence && <span className="badge badge-essence">✨ 精华</span>}
            </div>
          </div>

          <h1 className="post-title">{post.title}</h1>

          <div className="post-content-text">
            {post.content.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>

          {post.images.length > 0 && (
            <div className="post-images">
              {post.images.map((img, idx) => (
                <img key={idx} src={img} alt={`post-${idx}`} />
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

          <div className="post-stats">
            <span>👁️ {post.views} 浏览</span>
            <span>💬 {post.comments} 评论</span>
            <span>❤️ {post.likes} 点赞</span>
          </div>

          <div className="post-actions">
            <button className="action-btn" onClick={handleLike}>
              ❤️ 点赞 ({post.likes})
            </button>
            <button className="action-btn">
              💬 评论 ({post.comments})
            </button>
            <button className="action-btn">
              💾 收藏
            </button>
            <button className="action-btn" onClick={handleShare}>
              🔗 分享
            </button>
          </div>
        </article>

        {/* 评论区 */}
        <section className="comments-section">
          <h3 className="section-title">评论 ({comments.length})</h3>

          {/* 评论输入 */}
          <div className="comment-input-box">
            {user ? (
              <>
                <img src={user.avatar} alt={user.username} className="user-avatar-sm" />
                <textarea
                  className="comment-input"
                  placeholder="分享您的看法..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="3"
                />
                <div className="comment-actions">
                  <button className="btn btn-primary" onClick={handleComment}>
                    评论
                  </button>
                </div>
              </>
            ) : (
              <div className="login-prompt">
                <p>请 <a href="/login">登录</a> 后发表评论</p>
              </div>
            )}
          </div>

          {/* 评论列表 */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author}</span>
                    <span className="level-badge">Lv.{comment.level}</span>
                    <span className="comment-time">{comment.timestamp}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                  <div className="comment-footer">
                    <button className="comment-action">
                      ❤️ {comment.likes}
                    </button>
                    <button
                      className="comment-action"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      💬 回复
                    </button>
                  </div>

                  {/* 回复列表 */}
                  {comment.replies.length > 0 && (
                    <div className="replies">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="reply-item">
                          <img src={reply.avatar} alt={reply.author} className="reply-avatar" />
                          <div className="reply-content">
                            <span className="reply-author">{reply.author}</span>
                            <span className="reply-time">{reply.timestamp}</span>
                            <p className="reply-text">{reply.content}</p>
                            <button className="reply-action">
                              ❤️ {reply.likes}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 回复输入框 */}
                  {replyingTo === comment.id && user && (
                    <div className="reply-input">
                      <textarea
                        placeholder={`回复 @${comment.author}`}
                        rows="2"
                      />
                      <div className="reply-input-actions">
                        <button className="btn btn-sm">回复</button>
                        <button
                          className="btn btn-sm btn-text"
                          onClick={() => setReplyingTo(null)}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 右侧栏 */}
      <aside className="post-detail-sidebar">
        <div className="card">
          <h4>作者信息</h4>
          <div className="author-card">
            <img src={post.avatar} alt={post.author} />
            <h5>{post.author}</h5>
            <p className="author-level">Lv.{post.level}</p>
            <p className="author-followers">{post.followers} 粉丝</p>
            {!post.isFollowing && (
              <button className="btn btn-primary btn-block" onClick={handleFollow}>
                + 关注
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <h4>相关讨论</h4>
          <div className="related-posts">
            {[
              { title: '新能源车企最新动态汇总', likes: 234 },
              { title: '宁德时代与比亚迪对比分析', likes: 156 },
              { title: '2024年电池技术发展方向', likes: 98 },
            ].map((post, idx) => (
              <a key={idx} href="#" className="related-item">
                <p>{post.title}</p>
                <span className="like-count">❤️ {post.likes}</span>
              </a>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
