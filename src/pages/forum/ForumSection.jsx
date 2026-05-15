import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MessageSquare, ThumbsUp, Eye, Clock, Filter, Plus, Loader } from 'lucide-react'
import { postsService } from '../../services'

export default function ForumSection() {
  const { section } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 从后端获取该板块的帖子
        const response = await postsService.getBoardPosts(section, { page: 1, per_page: 20 })
        const postsData = response.items || response || []
        setPosts(postsData)
      } catch (err) {
        console.error('Failed to fetch posts:', err)
        setError(err.message || '加载帖子失败')
      } finally {
        setLoading(false)
      }
    }

    if (section) {
      fetchPosts()
    }
  }, [section])

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
              {loading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader className="h-6 w-6 animate-spin text-primary-600" />
                  <span className="ml-2">加载中...</span>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-600">
                  加载失败: {error}
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <Link key={post.post_id} to={`/post/${post.post_id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">👤</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {post.is_essence && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              精华
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span>{post.user_id}</span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.view_count || 0}
                          </span>
                          <span className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.like_count || 0}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comment_count || 0}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(post.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  暂无帖子
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50" disabled>
              上一页
            </button>
            <button className="px-3 py-1 bg-primary-600 text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">下一页</button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          {/* Hot Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">本区热门</h3>
            <div className="space-y-3">
              {posts.slice(0, 5).map((post) => (
                <Link
                  key={post.post_id}
                  to={`/post/${post.post_id}`}
                  className="block text-sm text-gray-600 hover:text-primary-600 line-clamp-2"
                >
                  {post.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">本周活跃</h3>
            <div className="space-y-2">
              {['用户A', '用户B', '用户C', '用户D'].map((user, i) => (
                <div key={i} className="text-sm text-gray-600">
                  <span className="font-medium">{user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
