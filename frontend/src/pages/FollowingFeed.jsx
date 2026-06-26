import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Eye, ThumbsUp, MessageSquare, Clock, Users } from 'lucide-react'
import { postsService } from '../services'
import { useAuth } from '../context/AuthContext'

export default function FollowingFeed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchFollowingPosts = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        // TODO: 后端需要实现 /posts/following 接口
        // 暂时获取所有帖子作为演示
        const res = await postsService.getPosts({ 
          page: 1, 
          per_page: 20 
        })
        setPosts(res.items || res || [])
      } catch (err) {
        console.error('Failed to fetch following posts:', err)
        setError(err.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchFollowingPosts()
  }, [isAuthenticated])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString()
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Users className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">请先登录</h2>
          <p className="text-yellow-700 mb-4">登录后可以查看关注用户的动态</p>
          <Link to="/login" className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700">
            立即登录
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold">关注动态</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">查看您关注的用户发布的最新内容</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link 
                key={post.post_id} 
                to={`/post/${post.post_id}`} 
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">👤</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
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
            <div className="p-12 text-center text-gray-500">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>暂无动态</p>
              <p className="text-sm mt-2">关注更多用户来丰富您的动态流</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
