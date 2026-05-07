import { useParams, Link } from 'react-router-dom'
import { MessageSquare, ThumbsUp, Eye, Clock, Filter, Plus } from 'lucide-react'

export default function ForumSection() {
  const { section } = useParams()

  const sectionNames = {
    'a-stock': 'A股讨论区',
    'hk-stock': '港股讨论区',
    'us-stock': '美股讨论区',
    'fund': '基金投资',
    'value-investing': '价值投资专区',
    'quantitative': '量化投资专区'
  }

  const sectionRules = {
    'value-investing': '本区专注基本面分析，禁止短线炒作讨论',
    'quantitative': '本区讨论量化策略、回测结果、代码分享'
  }

  const posts = [
    {
      id: 1,
      title: '贵州茅台2024年报深度解读',
      author: '价值猎人',
      avatar: '👤',
      views: 12345,
      likes: 892,
      comments: 156,
      time: '2小时前',
      isPinned: true,
      isEssence: true
    },
    {
      id: 2,
      title: '宁德时代技术面分析：突破关键阻力位',
      author: '技术派',
      avatar: '👤',
      views: 8923,
      likes: 654,
      comments: 98,
      time: '4小时前',
      isPinned: false,
      isEssence: false
    },
    {
      id: 3,
      title: '新能源板块轮动策略分享',
      author: '趋势跟踪',
      avatar: '👤',
      views: 5678,
      likes: 423,
      comments: 67,
      time: '6小时前',
      isPinned: false,
      isEssence: true
    },
    {
      id: 4,
      title: '今日A股市场复盘：科技股领涨',
      author: '市场观察者',
      avatar: '👤',
      views: 2341,
      likes: 156,
      comments: 34,
      time: '10分钟前',
      isPinned: false,
      isEssence: false
    },
    {
      id: 5,
      title: '双均线策略回测结果分享',
      author: '量化达人',
      avatar: '👤',
      views: 4567,
      likes: 345,
      comments: 56,
      time: '1小时前',
      isPinned: false,
      isEssence: true
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Section Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {sectionNames[section] || section}
          </h1>
          {sectionRules[section] && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-4">
              <p className="text-sm text-blue-700">{sectionRules[section]}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Action Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/create"
                  className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>发布新帖</span>
                </Link>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="h-5 w-5" />
                  <span>筛选</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>最新发布</option>
                  <option>最多回复</option>
                  <option>最多点赞</option>
                  <option>精华帖</option>
                </select>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-100">
              {posts.map((post) => (
                <Link key={post.id} to={`/post/${post.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{post.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {post.isPinned && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            置顶
                          </span>
                        )}
                        {post.isEssence && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            精华
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{post.author}</span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views}
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                显示 1-5 共 128 条
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                  上一页
                </button>
                <button className="px-3 py-1 bg-primary-600 text-white rounded">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">下一页</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          {/* Section Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">板块统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">今日帖子</span>
                <span className="font-medium">234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">在线用户</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">精华帖</span>
                <span className="font-medium">45</span>
              </div>
            </div>
          </div>

          {/* Hot Posts in Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">本区热门</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Link key={i} to={`/post/${i}`} className="block text-sm text-gray-700 hover:text-primary-600 line-clamp-2">
                  {i}. 贵州茅台2024年报深度解读与投资机会分析
                </Link>
              ))}
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">活跃用户</h3>
            <div className="space-y-3">
              {['价值猎人', '技术派', '趋势跟踪', '量化达人'].map((user, i) => (
                <Link key={i} to={`/profile/${i}`} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">👤</div>
                  <span className="text-sm text-gray-700">{user}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
