import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, User, Menu, TrendingUp } from 'lucide-react'
import { headerNavigators, forumSections } from '../../config/navigation'

export default function Header(props) {
  const navClass = "py-3 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300";
  const navHoveredClass = "py-3 text-primary-600 border-b-2 border-primary-600 font-medium";
  const [currentNavIdx, setCurrentNavIdx] = useState(0);
  useEffect(() => {
    if (props.section != undefined) {
      headerNavigators.map((value, index) => {
        if (value === props.section) {
          setCurrentNavIdx(index);
        }
      });
    }
  }, [props.section]);
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">投资论坛</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索帖子、用户、股票代码..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              state={{ from: location.pathname, scrollY: window.scrollY }}
              className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-primary-600"
            >
              <User className="h-5 w-5" />
              <span>登录</span>
            </Link>
            <Link
              to="/register"
              state={{ from: location.pathname, scrollY: window.scrollY }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              注册
            </Link>
            <button className="relative p-2 text-gray-600 hover:text-primary-600">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-600 hover:text-primary-600 md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-8 border-t border-gray-100">
          {headerNavigators.map((section, index) => (
            <Link key={section} to={forumSections[section].path} className={index === currentNavIdx ? navHoveredClass : navClass} onClick={() => setCurrentNavIdx(index)}>
              {forumSections[section].label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
