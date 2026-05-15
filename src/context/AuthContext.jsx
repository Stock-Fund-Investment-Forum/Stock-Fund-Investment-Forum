/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getStorage, setStorage, removeStorage } from '../utils/storage';
import { post } from '../utils/http';
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
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('邮箱和密码不能为空');
      }

      // Call backend API
      const response = await post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      }, { skipAuth: true });

      // Store token
      if (response.token) {
        setStorage(TOKEN_STORAGE_KEY, response.token);
      }

      // Store user info
      const userData = {
        ...response,
        // Ensure we have these fields for UI
        id: response.user_id,
        nickname: response.nickname,
      };
      setUser(userData);
      setStorage(USER_STORAGE_KEY, userData);

      return userData;
    } catch (err) {
      const errorMessage = err.data?.message || err.message || '登录失败，请重试';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (nickname, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate inputs
      if (!email || !password || !nickname) {
        throw new Error('所有字段都是必需的');
      }

      // Call backend API
      const response = await post(API_ENDPOINTS.REGISTER, {
        nickname,
        email,
        password,
      }, { skipAuth: true });

      // User created successfully
      // Auto-login or redirect to login page
      const userData = {
        ...response,
        id: response.user_id,
      };
      setUser(userData);
      setStorage(USER_STORAGE_KEY, userData);

      // If token is returned, store it
      if (response.token) {
        setStorage(TOKEN_STORAGE_KEY, response.token);
      }

      return userData;
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
