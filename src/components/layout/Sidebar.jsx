import { Link } from 'react-router-dom'
import { Home, TrendingUp, MessageSquare, Users, Star, Settings } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="space-y-2">
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-50 text-primary-700 font-medium"
        >
          <Home className="h-5 w-5" />
          <span>首页</span>
        </Link>
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <TrendingUp className="h-5 w-5" />
          <span>热榜</span>
        </Link>
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <TrendingUp className="h-5 w-5" />
          <span>关注动态</span>
        </Link>
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <MessageSquare className="h-5 w-5" />
          <span>消息</span>
        </Link>
        <Link
          to="/groups"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <Users className="h-5 w-5" />
          <span>群组</span>
        </Link>
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <Star className="h-5 w-5" />
          <span>收藏</span>
        </Link>
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <Star className="h-5 w-5" />
          <span>精华</span>
        </Link>
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">我的</h3>
        <nav className="space-y-2">
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
            <span>设置</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}
