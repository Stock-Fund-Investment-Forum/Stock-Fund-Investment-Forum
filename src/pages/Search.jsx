import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Filter, Clock, TrendingUp, FileText, User, TrendingDown } from 'lucide-react'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [activeTab, setActiveTab] = useState('posts') // 'posts', 'users', 'stocks'
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filters, setFilters] = useState({
    timeRange: 'all',
    sortBy: 'relevance',
    section: 'all',
    postType: 'all',
    essenceOnly: false
  })

  const posts = [
    {
      id: 1,
      title: '贵州茅台2024年报深度解读：业绩超预期',
      author: '价值猎人',
      avatar: '👤',
      section: 'A股讨论',
      time: '2小时前',
      views: 12345,
      likes: 892,
      comments: 156,
      isEssence: true,
      relevance: 95
    },
    {
      id: 2,
      title: '新能源板块轮动策略分享',
      author: '趋势跟踪',
      avatar: '👤',
      section: 'A股讨论',
      time: '1天前',
      views: 5678,
      likes: 423,
      comments: 67,
      isEssence: true,
      relevance: 88
    },
    {
      id: 3,
      title: '量化交易策略：双均线系统回测结果',
      author: '量化达人',
      avatar: '👤',
      section: '量化投资专区',
      time: '3天前',
      views: 3456,
      likes: 234,
      comments: 45,
      isEssence: false,
      relevance: 82
    }
  ]

  const users = [
    {
      id: 1,
      name: '价值猎人',
      avatar: '👤',
      level: 'Lv.5',
      bio: '专注价值投资，相信复利的力量',
      followers: 1234,
      posts: 128,
      isProfessional: true,
      relevance: 92
    },
    {
      id: 2,
      name: '量化达人',
      avatar: '👤',
      level: 'Lv.4',
      bio: '量化策略研究，回测结果分享',
      followers: 987,
      posts: 89,
      isProfessional: false,
      relevance: 85
    }
  ]

  const stocks = [
    {
      code: '600519',
      name: '贵州茅台',
      discussions: 2345,
      change: '+2.5%',
      trend: 'up',
      relevance: 98
    },
    {
      code: '300750',
      name: '宁德时代',
      discussions: 1892,
      change: '+1.8%',
      trend: 'up',
      relevance: 90
    },
    {
      code: '688981',
      name: '中芯国际',
      discussions: 1234,
      change: '-0.5%',
      trend: 'down',
      relevance: 85
    }
  ]

  const suggestions = [
    '贵州茅台', '宁德时代', '新能源', '量化交易', '基金定投'
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            defaultValue={query}
            placeholder="搜索帖子、用户、股票代码..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
          />
        </div>

        {/* Search Suggestions */}
        {!query && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">热门搜索</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {query && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">筛选</h3>
                <button
                  onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  高级筛选
                </button>
              </div>

              {showAdvancedFilter && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">时间范围</label>
                    <select
                      value={filters.timeRange}
                      onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="all">全部时间</option>
                      <option value="day">最近一天</option>
                      <option value="week">最近一周</option>
                      <option value="month">最近一月</option>
                      <option value="year">最近一年</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="relevance">相关度</option>
                      <option value="time">发布时间</option>
                      <option value="hot">热度</option>
                      <option value="likes">点赞数</option>
                    </select>
                  </div>

                  {activeTab === 'posts' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">板块</label>
                        <select
                          value={filters.section}
                          onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          <option value="all">全部板块</option>
                          <option value="a-stock">A股讨论</option>
                          <option value="hk-stock">港股讨论</option>
                          <option value="us-stock">美股讨论</option>
                          <option value="fund">基金投资</option>
                          <option value="value-investing">价值投资专区</option>
                          <option value="quantitative">量化投资专区</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">帖子类型</label>
                        <select
                          value={filters.postType}
                          onChange={(e) => setFilters({ ...filters, postType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          <option value="all">全部类型</option>
                          <option value="normal">普通帖子</option>
                          <option value="long">长文分析</option>
                          <option value="poll">投票调研</option>
                          <option value="realtime">实时讨论</option>
                        </select>
                      </div>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.essenceOnly}
                          onChange={(e) => setFilters({ ...filters, essenceOnly: e.target.checked })}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">只看精华帖</span>
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'posts', label: '帖子', icon: FileText, count: 156 },
                  { id: 'users', label: '用户', icon: User, count: 23 },
                  { id: 'stocks', label: '股票', icon: TrendingUp, count: 12 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 font-medium ${
                      activeTab === tab.id
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 inline mr-2" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                找到 <span className="font-medium text-gray-900">156</span> 条关于 "<span className="font-medium text-gray-900">{query}</span>" 的结果
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>排序：</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="relevance">相关度</option>
                  <option value="time">发布时间</option>
                  <option value="hot">热度</option>
                </select>
              </div>
            </div>

            {/* Posts Results */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {post.isEssence && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              精华
                            </span>
                          )}
                          <span className="text-sm text-primary-600">{post.section}</span>
                          <span className="text-xs text-gray-400">相关度 {post.relevance}%</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 mb-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{post.author}</span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {post.time}
                          </span>
                          <span>{post.views} 浏览</span>
                          <span>{post.likes} 点赞</span>
                          <span>{post.comments} 评论</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Users Results */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                          {user.isProfessional && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              加V
                            </span>
                          )}
                          <span className="text-sm text-gray-500">{user.level}</span>
                          <span className="text-xs text-gray-400">相关度 {user.relevance}%</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{user.followers} 粉丝</span>
                          <span>{user.posts} 帖子</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stocks Results */}
            {activeTab === 'stocks' && (
              <div className="space-y-4">
                {stocks.map((stock) => (
                  <div key={stock.code} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-700">
                          {stock.code.slice(-4)}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{stock.name}</h3>
                          <p className="text-sm text-gray-500">{stock.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {stock.trend === 'up' ? (
                            <TrendingUp className="h-5 w-5 text-red-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-green-500" />
                          )}
                          <span className={`font-medium ${stock.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                            {stock.change}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{stock.discussions} 讨论</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                上一页
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">下一页</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
