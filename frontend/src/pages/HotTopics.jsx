import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Eye, ThumbsUp, MessageSquare, Clock, Award } from 'lucide-react'
import { postsService } from '../services'

export default function HotTopics() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHotPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        // 获取热门帖子（按浏览量排序）
        const res = await postsService.getPosts({ 
          page: 1, 
          per_page: 50,
          order_by: 'hot'
        })
        setPosts(res.items || res || [])
      } catch (err) {
        console.error('Failed to fetch hot posts:', err)
        setError(err.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchHotPosts()
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
            <TrendingUp className="h-6 w-6 text-red-500" />
            <h1 className="text-xl font-bold">热门帖子</h1>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <Link 
                key={post.post_id} 
                to={`/post/${post.post_id}`} 
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index < 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                      {post.is_essence && (
                        <span className="inline-flex items-center px-2 py-0.5 mr-2 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          精华
                        </span>
                      )}
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
            <div className="p-12 text-center text-gray-500">暂无热门帖子</div>
          )}
        </div>
      </div>
    </div>
  )
}
