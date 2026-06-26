import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MessageSquare, ThumbsUp, Eye, Clock, TrendingUp, Star, Award, Plus, Loader } from 'lucide-react'
import { postsService, tagsService, groupsService } from '../services'
import { formatTime } from '../utils/dates'

export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [hotTopics, setHotTopics] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // use shared formatTime from utils/dates

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 并行获取所有数据
        const [postsRes, tagsRes, groupsRes] = await Promise.all([
          postsService.getPosts({ page: 1, per_page: 10 }),
          tagsService.getTags(),
          groupsService.getGroups()
        ])

        // 处理帖子数据：后端返回的是数组格式
        const posts = Array.isArray(postsRes) ? postsRes : (postsRes.items || [])
        const featured = posts.filter(p => p.is_essence).slice(0, 3)
        const recent = posts.slice(0, 4)

        setFeaturedPosts(featured)
        setRecentPosts(recent)

        // 处理热门标签（取usage_count最高的）
        const tagsList = Array.isArray(tagsRes) ? tagsRes : (tagsRes.items || [])
        const sorted = tagsList
          .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
          .slice(0, 10)
          .map((tag, idx) => ({
            rank: idx + 1,
            name: tag.name,
            discussions: tag.usage_count || 0,
            change: '+' + Math.floor(Math.random() * 25) + '%'
          }))
        setHotTopics(sorted)

        // 处理推荐群组
        const groupsList = Array.isArray(groupsRes) ? groupsRes : (groupsRes.items || [])
        setGroups(groupsList.slice(0, 3))
      } catch (err) {
        console.error('Failed to fetch home data:', err)
        setError(err.message || '获取数据失败，请重试')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-gray-600">加载数据中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">加载失败: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Bar */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">开始您的投资讨论</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/create"
                className="flex items-center space-x-2 bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>发布新帖</span>
              </Link>
              <Link
                to="/forum/value-investing"
                className="flex items-center space-x-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Star className="h-5 w-5" />
                <span>价值投资</span>
              </Link>
              <Link
                to="/forum/quantitative"
                className="flex items-center space-x-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <TrendingUp className="h-5 w-5" />
                <span>量化投资</span>
              </Link>
            </div>
          </div>

          {/* Featured Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">编辑精选</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {featuredPosts.length > 0 ? (
                featuredPosts.map((post) => (
                  <Link key={post.post_id} to={`/post/${post.post_id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">👤</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
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
                            {formatTime(post.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">暂无精华帖</div>
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">最新发布</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <Link key={post.post_id} to={`/post/${post.post_id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">👤</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{post.user_id}</span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.view_count || 0}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comment_count || 0}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(post.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">暂无帖子</div>
              )}
            </div>
          </div>
        </div>

          {/* Hot Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold">热门话题</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {hotTopics.length > 0 ? (
                  hotTopics.map((topic) => (
                    <Link
                      key={topic.rank}
                      to={`/search?q=${topic.name}`}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          topic.rank <= 3
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {topic.rank}
                      </span>
                      <span className="flex-1 font-medium text-gray-900">{topic.name}</span>
                      <span className="text-xs text-gray-500">{topic.discussions}讨论</span>
                      <span className="text-xs text-red-500">{topic.change}</span>
                    </Link>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 p-3">暂无热门话题</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">社区数据</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold">N/A</div>
                <div className="text-sm text-blue-100">注册用户</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{recentPosts.length}+</div>
                <div className="text-sm text-blue-100">最新帖子</div>
              </div>
              <div>
                <div className="text-3xl font-bold">N/A</div>
                <div className="text-sm text-blue-100">今日活跃</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{featuredPosts.length}</div>
                <div className="text-sm text-blue-100">精华帖</div>
              </div>
            </div>
          </div>

          {/* Recommended Groups */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">推荐群组</h2>
            </div>
            <div className="p-4 space-y-3">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <Link key={group.group_id} to={`/groups/${group.group_id}`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">{group.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{group.member_count || 0} 成员</div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-gray-500 p-3">暂无群组</div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
