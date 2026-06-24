import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, Filter, Clock, TrendingUp, FileText, User, Loader, X } from 'lucide-react'
import { postsService, usersService, stocksService } from '../services'
import { parseIsoDate } from '../utils/dates'

const SUGGESTIONS = ['贵州茅台', '新能源', '量化交易', '基金定投', '港股', '美股', 'A股', '半导体']

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(queryParam)
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const inputRef = useRef(null)
  const [filters, setFilters] = useState({
    timeRange: 'all',
    sortBy: 'created_at',
    section: 'all',
    postType: 'all',
    essenceOnly: false,
  })

  const doSearch = useCallback(async (q) => {
    if (!q) { setPosts([]); setUsers([]); setStocks([]); return }
    setLoading(true); setError(null)
    try {
      const params = { page: 1, per_page: 20 }
      const postParams = { ...params, q }
      if (filters.sortBy === 'hot') postParams.order_by = 'hot'
      if (filters.section !== 'all') postParams.board_id = filters.section
      if (filters.postType !== 'all') postParams.post_type = filters.postType
      if (filters.timeRange !== 'all') {
        const now = Date.now()
        const ranges = { day: 86400000, week: 604800000, month: 2592000000, year: 31536000000 }
        postParams.after = new Date(now - (ranges[filters.timeRange] || 0)).toISOString()
      }

      const [postsRes, usersRes, stocksRes] = await Promise.all([
        postsService.getPosts(postParams),
        usersService.getUsers({ nickname: q, page: 1, per_page: 10 }),
        stocksService.getStocks({ q, page: 1, per_page: 10 }),
      ])
      let ps = Array.isArray(postsRes) ? postsRes : postsRes.items || []
      if (filters.essenceOnly) ps = ps.filter(p => p.is_essence)
      setPosts(ps)
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes.items || [])
      setStocks(Array.isArray(stocksRes) ? stocksRes : stocksRes.items || [])
    } catch (err) { setError(err.message || '搜索失败') }
    finally { setLoading(false) }
  }, [filters])
  
  useEffect(() => {
    if (queryParam) { doSearch(queryParam, activeTab) }
  }, [queryParam, doSearch, activeTab])

  const handleSearch = (q) => {
    const term = (q || inputValue).trim()
    if (!term) return
    setSearchParams({ q: term })
    setShowSuggestions(false)
  }

  const fetchSuggestions = async (val) => {
    if (!val.trim()) { setSuggestions([]); return }
    try {
      const [p, u, s] = await Promise.all([
        postsService.getPosts({ q: val, per_page: 3 }).catch(() => ({ items: [] })),
        usersService.getUsers({ nickname: val, per_page: 3 }).catch(() => []),
        stocksService.getStocks({ q: val, per_page: 3 }).catch(() => []),
      ])
      const items = []
      const ps = Array.isArray(p) ? p : p.items || []
      ps.forEach(po => items.push({ type: '帖子', text: po.title, icon: FileText }))
      const us = Array.isArray(u) ? u : u.items || []
      us.forEach(us => items.push({ type: '用户', text: us.nickname, icon: User }))
      const ss = Array.isArray(s) ? s : s.items || []
      ss.forEach(s => items.push({ type: '股票', text: `${s.name || ''} ${s.symbol || ''}`, icon: TrendingUp }))
      setSuggestions(items.slice(0, 6))
    } catch { setSuggestions([]) }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input ref={inputRef}
            type="text" value={inputValue}
            onChange={e => { setInputValue(e.target.value); fetchSuggestions(e.target.value); setShowSuggestions(true) }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            onFocus={() => inputValue.trim() && fetchSuggestions(inputValue)}
            placeholder="搜索帖子、用户、股票代码..."
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg" />
          {inputValue && (
            <button onClick={() => { setInputValue(''); setSuggestions([]) }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setInputValue(s.text); setShowSuggestions(false); handleSearch(s.text) }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-left">
                  <s.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{s.type}: </span>
                  <span className="text-sm font-medium">{s.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!queryParam && !inputValue && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">热门搜索</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setInputValue(s); handleSearch(s) }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 text-sm">{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {queryParam && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">筛选</h3>
                <button onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                  <Filter className="h-4 w-4 mr-1" />高级筛选
                </button>
              </div>
              {showAdvancedFilter && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">时间范围</label>
                    <select value={filters.timeRange} onChange={e => setFilters({ ...filters, timeRange: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="all">全部时间</option>
                      <option value="day">最近一天</option>
                      <option value="week">最近一周</option>
                      <option value="month">最近一月</option>
                      <option value="year">最近一年</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                    <select value={filters.sortBy} onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="created_at">发布时间</option>
                      <option value="hot">热度</option>
                    </select>
                  </div>
                  {activeTab === 'posts' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">板块</label>
                        <select value={filters.section} onChange={e => setFilters({ ...filters, section: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="all">全部板块</option>
                          <option value="a-stock">A股</option>
                          <option value="hk-stock">港股</option>
                          <option value="us-stock">美股</option>
                          <option value="fund">基金</option>
                          <option value="value-investing">价值投资</option>
                          <option value="quantitative">量化投资</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">帖子类型</label>
                        <select value={filters.postType} onChange={e => setFilters({ ...filters, postType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="all">全部类型</option>
                          <option value="DISCUSSION">普通帖子</option>
                          <option value="ANALYSIS">长文分析</option>
                          <option value="QUESTION">投票</option>
                          <option value="NEWS">实时讨论</option>
                        </select>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={filters.essenceOnly}
                          onChange={e => setFilters({ ...filters, essenceOnly: e.target.checked })}
                          className="rounded text-primary-600" />
                        <span className="text-sm text-gray-700">只看精华帖</span>
                      </label>
                    </>
                  )}
                  <button onClick={() => handleSearch(queryParam)}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">应用筛选</button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                {['posts', 'users', 'stocks'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 font-medium ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab === 'posts' ? <FileText className="h-5 w-5 inline mr-2" /> : tab === 'users' ? <User className="h-5 w-5 inline mr-2" /> : <TrendingUp className="h-5 w-5 inline mr-2" />}
                    {tab === 'posts' ? '帖子' : tab === 'users' ? '用户' : '股票'}
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tab === 'posts' ? posts.length : tab === 'users' ? users.length : stocks.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                找到 <span className="font-medium">{activeTab === 'posts' ? posts.length : activeTab === 'users' ? users.length : stocks.length}</span> 条结果
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader className="h-6 w-6 animate-spin text-primary-600 mr-2" /><span className="text-gray-500">搜索中...</span></div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
            ) : (
              <>
                {activeTab === 'posts' && (
                  <div className="space-y-4">
                    {posts.length > 0 ? posts.map(post => (
                      <Link key={post.post_id} to={`/post/${post.post_id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">👤</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {post.is_essence && <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">精华</span>}
                              <span className="text-sm text-primary-600">{post.board_id}</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 mb-2">{post.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{post.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{post.user_nickname || post.user_id?.slice(0, 8)}</span>
                              <span><Clock className="h-4 w-4 inline mr-1" />{parseIsoDate(post.created_at).toLocaleString()}</span>
                              <span>{post.view_count || 0} 浏览</span>
                              <span>{post.like_count || 0} 点赞</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )) : <div className="text-center py-12 text-gray-500">未找到相关帖子</div>}
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-4">
                    {users.length > 0 ? users.map(u => (
                      <Link key={u.user_id} to={`/profile/${u.user_id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl">👤</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900">{u.nickname}</h3>
                              {u.auth_level === 'EXPERT' && <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">加V</span>}
                              <span className="text-sm text-gray-500">Lv.{u.level || 1}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{u.bio || '暂无介绍'}</p>
                          </div>
                        </div>
                      </Link>
                    )) : <div className="text-center py-12 text-gray-500">未找到相关用户</div>}
                  </div>
                )}

                {activeTab === 'stocks' && (
                  <div className="space-y-4">
                    {stocks.length > 0 ? stocks.map(stock => (
                      <div key={stock.stock_id || stock.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-700">{stock.symbol?.slice(-3) || 'N/A'}</div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{stock.name || '未知'}</h3>
                              <p className="text-sm text-gray-500">{stock.symbol || ''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">{stock.last_price != null ? `¥${stock.last_price}` : '-'}</p>
                            {stock.percent_change != null && (
                              <p className={`text-sm ${stock.percent_change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {stock.percent_change >= 0 ? '+' : ''}{stock.percent_change}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : <div className="text-center py-12 text-gray-500">未找到相关股票</div>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}