import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPages.css';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: 基础信息, 2: 手机验证, 3: 完成
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateStep1 = () => {
    setError('');

    if (!formData.email || !formData.username || !formData.password) {
      setError('请填写所有必填项');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('用户名长度应为 3-20 个字符');
      return false;
    }

    if (formData.password.length < 8) {
      setError('密码长度至少 8 个字符');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }

    if (!formData.agreeTerms) {
      setError('请同意服务条款');
      return false;
    }

    return true;
  };

  const handleStep1 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleStep2 = async () => {
    setStep(3);
  };

  const handleComplete = async () => {
    try {
      await register(formData.email, formData.password, formData.username);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || '注册失败');
      setStep(1);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>创建账号</h1>
          <p>加入股基论坛，开启投资交流之旅</p>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <label>基础信息</label>
            </div>
            <div className={`connector ${step >= 2 ? 'active' : ''}`} />
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <label>手机验证</label>
            </div>
            <div className={`connector ${step >= 3 ? 'active' : ''}`} />
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <label>完成</label>
            </div>
          </div>
        </div>

        {step === 1 && (
          <form className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">邮箱地址 *</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">用户名 *</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="3-20 个字符，字母、数字、下划线"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">密码 *</label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="至少 8 个字符，包含字母和数字"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '隐藏' : '显示'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码 *</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="再次输入密码"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-group checkbox">
              <input
                id="agreeTerms"
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <label htmlFor="agreeTerms">
                我已阅读并同意 <a href="/terms">《服务条款》</a>
                和 <a href="/privacy">《隐私政策》</a>
              </label>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleStep1}
            >
              下一步
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="phone">手机号 *</label>
              <input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">验证码 *</label>
              <div className="code-input">
                <input
                  id="code"
                  type="text"
                  placeholder="请输入验证码"
                />
                <button type="button" className="get-code">
                  获取验证码
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleStep2}
            >
              验证并继续
            </button>

            <button
              type="button"
              className="btn btn-text btn-block"
              onClick={() => setStep(1)}
            >
              上一步
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="auth-form">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>注册成功</h3>
              <p>欢迎加入股基论坛！</p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                您已成功创建账号，现在可以开始交流投资心得了
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? '加载中...' : '进入论坛'}
            </button>
          </div>
        )}

        <div className="auth-footer">
          {step === 1 && (
            <>
              <span>已有账号？</span>
              <a href="/login">去登录</a>
            </>
          )}
        </div>
      </div>

      <div className="auth-background">
        <div className="bg-shape shape-1" />
        <div className="bg-shape shape-2" />
        <div className="bg-shape shape-3" />
      </div>
    </div>
  );
}
