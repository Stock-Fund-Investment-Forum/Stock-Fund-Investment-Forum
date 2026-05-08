import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/PublishPage.css';

export default function PublishPage() {
  const { user } = useAuth();
  const [postType, setPostType] = useState('normal'); // normal, longform, poll, realtime
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    board: '',
    tags: '',
    images: [],
  });
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!user) {
    return (
      <div className="publish-container">
        <div className="empty-state">
          <p>请先 <a href="/login">登录</a> 才能发帖</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPollOption = () => {
    setPollOptions((prev) => [...prev, '']);
  };

  const handleRemovePollOption = (index) => {
    setPollOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePollOption = (index, value) => {
    setPollOptions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // 模拟图片上传
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      preview: URL.createObjectURL(file),
    }));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleRemoveImage = (id) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.content || !formData.board) {
      alert('请填写标题、内容和选择板块');
      return;
    }

    setIsPublishing(true);
    try {
      // 模拟发布
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('发帖成功！');
      window.location.href = '/';
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="publish-container">
      <div className="publish-box">
        <div className="publish-header">
          <h1>发布新帖</h1>
          <div className="type-selector">
            <button
              className={`type-btn ${postType === 'normal' ? 'active' : ''}`}
              onClick={() => setPostType('normal')}
            >
              📝 普通帖
            </button>
            <button
              className={`type-btn ${postType === 'longform' ? 'active' : ''}`}
              onClick={() => setPostType('longform')}
            >
              📄 长文分析
            </button>
            <button
              className={`type-btn ${postType === 'poll' ? 'active' : ''}`}
              onClick={() => setPostType('poll')}
            >
              📊 发起投票
            </button>
            <button
              className={`type-btn ${postType === 'realtime' ? 'active' : ''}`}
              onClick={() => setPostType('realtime')}
            >
              ⚡ 实时讨论
            </button>
          </div>
        </div>

        <div className="publish-form">
          {/* 板块选择 */}
          <div className="form-group">
            <label htmlFor="board">选择板块 *</label>
            <select
              id="board"
              name="board"
              value={formData.board}
              onChange={handleChange}
            >
              <option value="">-- 选择板块 --</option>
              <option value="a-stock">A股讨论</option>
              <option value="hk-stock">港股讨论</option>
              <option value="us-stock">美股讨论</option>
              <option value="value">价值投资专区</option>
              <option value="quant">量化投资专区</option>
              <option value="fund">基金讨论</option>
              <option value="new-security">新股/新债讨论</option>
            </select>
          </div>

          {/* 标题 */}
          {postType !== 'realtime' && (
            <div className="form-group">
              <label htmlFor="title">标题 *</label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder={postType === 'poll' ? '请输入投票主题' : '请输入帖子标题'}
                value={formData.title}
                onChange={handleChange}
                maxLength="100"
              />
              <div className="char-count">{formData.title.length}/100</div>
            </div>
          )}

          {/* 内容编辑 */}
          <div className="form-group">
            <label htmlFor="content">
              {postType === 'poll' ? '投票描述' : '内容'} *
            </label>
            <textarea
              id="content"
              name="content"
              placeholder={
                postType === 'poll'
                  ? '描述投票的相关背景'
                  : postType === 'realtime'
                  ? '分享您的实时看法（280字以内）'
                  : '尽可能详细地描述您的观点和分析'
              }
              value={formData.content}
              onChange={handleChange}
              rows={postType === 'realtime' ? 4 : 10}
              maxLength={postType === 'realtime' ? 280 : 5000}
            />
            <div className="char-count">
              {formData.content.length}
              {postType === 'realtime' ? '/280' : '/5000'}
            </div>
          </div>

          {/* 投票选项 */}
          {postType === 'poll' && (
            <div className="form-group">
              <label>投票选项</label>
              <div className="poll-options">
                {pollOptions.map((option, index) => (
                  <div key={index} className="poll-option-input">
                    <span className="option-number">{index + 1}</span>
                    <input
                      type="text"
                      placeholder={`选项 ${index + 1}`}
                      value={option}
                      onChange={(e) => handleUpdatePollOption(index, e.target.value)}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        className="remove-option"
                        onClick={() => handleRemovePollOption(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 10 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddPollOption}
                >
                  + 添加选项
                </button>
              )}
            </div>
          )}

          {/* 图片上传 */}
          {postType !== 'poll' && (
            <div className="form-group">
              <label>上传图片</label>
              <div className="image-upload">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="images" className="upload-btn">
                  📷 选择图片
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="image-preview">
                  {formData.images.map((img) => (
                    <div key={img.id} className="preview-item">
                      <img src={img.preview} alt="preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => handleRemoveImage(img.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 标签 */}
          {postType !== 'realtime' && (
            <div className="form-group">
              <label htmlFor="tags">标签</label>
              <input
                id="tags"
                type="text"
                name="tags"
                placeholder="用英文逗号分隔多个标签，如：新能源,CATL,技术面"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>
          )}

          {/* 发布按钮 */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? '发布中...' : '📤 发布'}
            </button>
            <button
              type="button"
              className="btn btn-text"
              onClick={() => window.history.back()}
            >
              取消
            </button>
          </div>
        </div>
      </div>

      <div className="publish-tips">
        <div className="tips-card">
          <h3>💡 发帖建议</h3>
          <ul>
            <li>标题清晰明了，能准确概括内容</li>
            <li>观点需要充分的数据支撑和逻辑分析</li>
            <li>禁止发布荐股、操纵市场类内容</li>
            <li>尊重他人观点，文明讨论</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
