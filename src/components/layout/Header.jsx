import { useState, useEffect } from 'react'
import { Link ,useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, User, Menu, TrendingUp,UserCircle, Settings, LogOut  } from 'lucide-react'
import { headerNavigators, forumSections } from '../../config/navigation'
import { useAuth } from '../../context/AuthContext' // 3. 导入 useAuth

export default function Header(props) {
  const [searchInput, setSearchInput] = useState('');
  const navClass = "py-3 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300";
  const navHoveredClass = "py-3 text-primary-600 border-b-2 border-primary-600 font-medium";
  const [currentNavIdx, setCurrentNavIdx] = useState(0);

   //  获取认证状态和用户信息
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation(); // 5. 获取 location 对象以保留跳转前的路径
  const navigate = useNavigate();
  
  // 控制用户下拉菜单的显示
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (props.section != undefined) {
      headerNavigators.map((value, index) => {
        if (value === props.section) {
          setCurrentNavIdx(index);
        }
      });
    }
  }, [props.section]);
  // 处理登出
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/'); // 登出后回到首页
  };

  
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
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && searchInput.trim()) { navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`); setSearchInput('') } }}
                placeholder="搜索帖子、用户、股票代码..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            
            {/* 6. 根据登录状态显示不同内容 */}
            {isAuthenticated && user ? (
              // --- 已登录状态 ---
              <div className="flex items-center space-x-4">
                {/* 通知铃铛 (可以后续集成真实通知数量) */}
                <button className="relative p-2 text-gray-600 hover:text-primary-600">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* 用户头像与下拉菜单 */}
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user.nickname || '用户'}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 overflow-hidden border border-gray-200">
                      {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <UserCircle className="h-6 w-6" />
                      )}
                    </div>
                  </button>

                  {/* 下拉菜单 */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                      <Link 
                        to={`/profile/${user.id}`} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        个人中心
                      </Link>
                      <Link 
                        to="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        账号设置
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // --- 未登录状态 ---
              <>
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
              </>
            )}

            {/* Mobile Menu Button */}
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
