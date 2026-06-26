import { Link, useLocation } from 'react-router-dom'
import { Home, TrendingUp, MessageSquare, Users, Star, Settings, Activity, Award } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const isActive = (path) => {
    return location.pathname === path
  }

  const getClassName = (path) => {
    const baseClass = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
    if (isActive(path)) {
      return `${baseClass} bg-primary-50 text-primary-700 font-medium`
    }
    return `${baseClass} text-gray-700 hover:bg-gray-100`
  }

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="space-y-2">
        <Link
          to="/"
          className={getClassName("/")}
        >
          <Home className="h-5 w-5" />
          <span>首页</span>
        </Link>
        <Link
          to="/hot"
          className={getClassName("/hot")}
        >
          <TrendingUp className="h-5 w-5" />
          <span>热榜</span>
        </Link>
        <Link
          to="/following"
          className={getClassName("/following")}
        >
          <Activity className="h-5 w-5" />
          <span>关注动态</span>
        </Link>
        <Link
          to="/messages"
          className={getClassName("/messages")}
        >
          <MessageSquare className="h-5 w-5" />
          <span>消息</span>
        </Link>
        <Link
          to="/groups"
          className={getClassName("/groups")}
        >
          <Users className="h-5 w-5" />
          <span>群组</span>
        </Link>
        <Link
          to="/favorites"
          className={getClassName("/favorites")}
        >
          <Star className="h-5 w-5" />
          <span>收藏</span>
        </Link>
        <Link
          to="/essence"
          className={getClassName("/essence")}
        >
          <Award className="h-5 w-5" />
          <span>精华</span>
        </Link>
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">我的</h3>
        <nav className="space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/settings"
                className={getClassName("/settings")}
              >
                <Settings className="h-5 w-5" />
                <span>设置</span>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className={getClassName("/login")}
            >
              <span className="text-primary-600">登录 / 注册</span>
            </Link>
          )}
        </nav>
      </div>
    </aside>
  )
}
