/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getStorage, setStorage, removeStorage } from '../utils/storage';
import { get, post, postForm } from '../utils/http';  // ✅ 添加 get 导入
import { API_ENDPOINTS, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../constants/api';

const AuthContext = createContext(null);

/**
 * AuthProvider - Manages authentication state with real API integration
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return getStorage(USER_STORAGE_KEY, null);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if token exists on mount
  useEffect(() => {
    const token = getStorage(TOKEN_STORAGE_KEY, null);
    if (token && !user) {
      // Token exists but user is not loaded (e.g., page refresh)
      // In a real app, you'd verify the token with the backend
    }
  }, [user]);

  /**
   * Login with email and password
   */

    // src/context/AuthContext.jsx

const login = useCallback(async (identifier, password) => {
  setIsLoading(true);
  setError(null);
  try {
    if (!identifier || !password) {
      throw new Error('账号和密码不能为空');
    }

    // OAuth2PasswordRequestForm 期望字段名为 username 和 password
    // 无论前端输入的是邮箱还是手机，都映射到 username
    const formData = {
      username: identifier.trim(), 
      password: password,
    };

    // 1. 使用 postForm 发送表单数据，而不是 JSON
    const response = await postForm(API_ENDPOINTS.LOGIN, formData, { skipAuth: true });

    // 注意：FastAPI OAuth2 返回的 token 字段通常是 access_token
    // 检查你的 schemas.Token 定义，如果是 { access_token: "...", token_type: "bearer" }
    const token = response.access_token || response.token; 

    if (token) {
      setStorage(TOKEN_STORAGE_KEY, token);
    }

    // 2. ✅ 登录成功后，调用 /users/me 接口获取完整的用户信息
    // 因为登录接口只返回 token，不返回用户详情
    const userProfile = await get(API_ENDPOINTS.GET_CURRENT_USER);
    
    // 3. 保存完整的用户信息
    const userData = {
      ...userProfile,  // 保留后端返回的所有字段（包括 email, phone, nickname 等）
      id: userProfile.user_id || 'pending', 
      token: token // 确保存下 token
    };
    
    setUser(userData);
    setStorage(USER_STORAGE_KEY, userData);

    return userData;
  } catch (err) {
    // FastAPI 422 错误通常在 err.data.detail 中
    const errorMessage = err.data?.detail 
      ? (Array.isArray(err.data.detail) ? err.data.detail[0]?.msg : err.data.detail) 
      : (err.data?.message || err.message || '登录失败，请重试');
      
    setError(errorMessage);
    throw err;
  } finally {
    setIsLoading(false);
  }
}, []);

  // const login = useCallback(async (email, password) => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     // Validate inputs
  //     if (!email || !password) {
  //       throw new Error('邮箱和密码不能为空');
  //     }

  //     // Call backend API
  //     const response = await post(API_ENDPOINTS.LOGIN, {
  //       email,
  //       password,
  //     }, { skipAuth: true });

  //     // Store token
  //     if (response.token) {
  //       setStorage(TOKEN_STORAGE_KEY, response.token);
  //     }

  //     // Store user info
  //     const userData = {
  //       ...response,
  //       // Ensure we have these fields for UI
  //       id: response.user_id,
  //       nickname: response.nickname,
  //     };
  //     setUser(userData);
  //     setStorage(USER_STORAGE_KEY, userData);

  //     return userData;
  //   } catch (err) {
  //     const errorMessage = err.data?.message || err.message || '登录失败，请重试';
  //     setError(errorMessage);
  //     throw err;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

  /**
   * Register new user (supports both email and phone registration)
   * @param {object} userData - Registration data
   * @param {string} userData.nickname - User nickname
   * @param {string} userData.email - User email (optional, for email registration)
   * @param {string} userData.phone - User phone (optional, for phone registration)
   * @param {string} userData.password - User password
   */
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate inputs
      if (!userData.password || !userData.nickname) {
        throw new Error('所有字段都是必需的');
      }

      // At least email or phone must be provided
      if (!userData.email && !userData.phone) {
        throw new Error('邮箱或手机号至少填写一个');
      }

      // Build request payload - backend expects email, phone is optional
      const payload = {
        nickname: userData.nickname,
        password: userData.password,
      };

      // Send email if provided, otherwise send phone
      if (userData.email) {
        payload.email = userData.email;
      } else if (userData.phone) {
        // If only phone is provided, derive email or include phone
        payload.phone = userData.phone;
      }

      // Call backend API to register
      const response = await post(API_ENDPOINTS.REGISTER, payload, { skipAuth: true });

      // Auto-login: use the same credentials to get a token
      const identifier = payload.email || payload.phone || '';
      const loginForm = { username: identifier, password: payload.password };
      const tokenResponse = await postForm(API_ENDPOINTS.LOGIN, loginForm, { skipAuth: true });
      const token = tokenResponse.access_token || tokenResponse.token;

      if (token) {
        setStorage(TOKEN_STORAGE_KEY, token);
      }

      // Fetch full user profile
      const userProfile = token ? await get(API_ENDPOINTS.GET_CURRENT_USER) : response;
      const userData_response = {
        ...userProfile,
        id: userProfile.user_id || 'pending',
        token,
      };

      setUser(userData_response);
      setStorage(USER_STORAGE_KEY, userData_response);

      return userData_response;
    } catch (err) {
      const errorMessage = err.data?.message || err.message || '注册失败，请重试';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    setUser(null);
    removeStorage(USER_STORAGE_KEY);
    removeStorage(TOKEN_STORAGE_KEY);
    setError(null);
  }, []);

  /**
   * Update user info
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      setStorage(USER_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
