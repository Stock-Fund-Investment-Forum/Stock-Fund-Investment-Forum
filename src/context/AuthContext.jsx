import { createContext, useContext, useState, useCallback } from 'react';
import { getStorage, setStorage, removeStorage } from '../utils/storage';

const AuthContext = createContext(null);

/**
 * AuthProvider - Manages authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return getStorage('user', null);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('邮箱和密码不能为空');
      }

      // Mock API call
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        username: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        level: 1,
        points: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      setStorage('user', userData);
      return userData;
    } catch (err) {
      const errorMessage = err.message || '登录失败，请重试';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, username) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate inputs
      if (!email || !password || !username) {
        throw new Error('所有字段都是必需的');
      }

      // Mock API call
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        level: 1,
        points: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      setStorage('user', userData);
      return userData;
    } catch (err) {
      const errorMessage = err.message || '注册失败，请重试';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeStorage('user');
    setError(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      setStorage('user', updated);
      return updated;
    });
  }, []);

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
