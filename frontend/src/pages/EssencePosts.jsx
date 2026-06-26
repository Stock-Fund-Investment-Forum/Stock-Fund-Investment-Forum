import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Award, Eye, ThumbsUp, MessageSquare, Clock } from 'lucide-react'
import { postsService } from '../services'

export default function EssencePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEssencePosts = async () => {
      try {
        setLoading(true)
        setError(null)
        // TODO: 后端需要支持 is_essence 过滤参数
        // 暂时获取所有帖子后在前端过滤
        const res = await postsService.getPosts({ 
          page: 1, 
          per_page: 100 
        })
        const allPosts = res.items || res || []
        const essencePosts = allPosts.filter(p => p.is_essence)
        setPosts(essencePosts)
      } catch (err) {
        console.error('Failed to fetch essence posts:', err)
        setError(err.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchEssencePosts()
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
            <Award className="h-6 w-6 text-yellow-500" />
            <h1 className="text-xl font-bold">精华帖子</h1>
          </div>
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
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                      <span className="inline-flex items-center px-2 py-0.5 mr-2 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        精华
                      </span>
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
            <div className="p-12 text-center text-gray-500">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>暂无精华帖子</p>
              <p className="text-sm mt-2">优质内容会被标记为精华</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
