import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Eye, MessageSquare, Clock, Loader, BookmarkX } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { get } from '../utils/http'
import { API_ENDPOINTS } from '../constants/api'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true)
        const res = await get(`${API_ENDPOINTS.GET_CURRENT_USER}/favorites`)
        setFavorites(Array.isArray(res) ? res : res.items || [])
      } catch (err) {
        console.error('Failed to fetch favorites:', err)
        setError(err.message || '获取收藏失败')
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [])

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
          <Star className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">请先登录</h2>
          <p className="text-yellow-700 mb-4">登录后可以查看收藏的帖子</p>
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
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <h1 className="text-xl font-bold">我的收藏</h1>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {favorites.length > 0 ? (
            favorites.map((post) => (
              <Link 
                key={post.post_id} 
                to={`/post/${post.post_id}`} 
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">⭐</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{post.user_id?.slice(0, 8) || '匿名'}</span>
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
              <BookmarkX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>暂无收藏</p>
              <p className="text-sm mt-2">浏览帖子时可以收藏感兴趣的内容</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}