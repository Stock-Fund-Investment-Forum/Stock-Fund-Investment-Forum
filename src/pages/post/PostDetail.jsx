import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThumbsUp, MessageSquare, Share2, Bookmark, Eye, Clock, Send, MoreHorizontal, Award, Loader } from 'lucide-react'
import { postsService, commentsService } from '../../services'

export default function PostDetail() {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 加载帖子详情和评论
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 并行获取帖子和评论
        const [postRes, commentsRes] = await Promise.all([
          postsService.getPost(postId),
          commentsService.getPostComments(postId, { page: 1, per_page: 50 })
        ])

        setPost(postRes)
        setComments(commentsRes.items || commentsRes || [])
      } catch (err) {
        console.error('Failed to fetch post data:', err)
        setError(err.message || '加载数据失败')
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPostData()
    }
  }, [postId])

  const handleLike = async () => {
    try {
      setLiked(!liked)
      // TODO: Call API to like post
      console.warn('Like post:', postId)
    } catch (err) {
      console.error('Failed to like post:', err)
    }
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  const handleReply = (commentId) => {
    setReplyingTo(commentId)
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return
    try {
      // 提交评论
      await commentsService.createComment(postId, {
        content: commentText,
        parent_comment_id: replyingTo
      })
      setCommentText('')
      setReplyingTo(null)
      // 重新加载评论
      const commentsRes = await commentsService.getPostComments(postId)
      setComments(commentsRes.items || commentsRes || [])
    } catch (err) {
      console.error('Failed to submit comment:', err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">加载失败: {error || '帖子不存在'}</p>
        </div>
      </div>
    )
  }
  // 渲染评论
  const renderComment = (comment, depth = 0) => {
    const marginLeft = depth * 4
    const replyingComment = replyingTo === comment.comment_id

    return (
      <div key={comment.comment_id} className={`${marginLeft > 0 ? `ml-${marginLeft} border-l-2 border-gray-200 pl-4` : ''} py-4`}>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
              👤
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{comment.user_id}</span>
              <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            <div className="mt-2 text-gray-700 whitespace-pre-wrap">{comment.content}</div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <button className="flex items-center space-x-1 hover:text-primary-600">
                <ThumbsUp className="h-4 w-4" />
                <span>{comment.like_count || 0}</span>
              </button>
              <button
                onClick={() => handleReply(comment.comment_id)}
                className="flex items-center space-x-1 hover:text-primary-600"
              >
                <MessageSquare className="h-4 w-4" />
                <span>回复</span>
              </button>
            </div>

            {/* Reply Input */}
            {replyingComment && (
              <div className="mt-3 flex space-x-2">
                <input
                  type="text"
                  placeholder="输入回复..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                <button
                  onClick={handleSubmitComment}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Send className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Post Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                {post.is_essence && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Award className="h-3 w-3 mr-1" />
                    精华
                  </span>
                )}
                <Link to={`/forum/${post.board_id}`} className="text-sm text-primary-600 hover:text-primary-700">
                  {post.board_id}
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${post.user_id}`} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{post.user_id}</span>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {post.view_count || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Body */}
            <div className="p-6">
              <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-line">
                {post.content}
              </div>
              
              {/* Tags - 若后端提供 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/search?q=${tag}`}
                      className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full hover:bg-primary-100"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                  <span>{post.like_count || 0}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-primary-600">
                  <MessageSquare className="h-5 w-5" />
                  <span>{post.comment_count || 0}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-primary-600">
                  <Share2 className="h-5 w-5" />
                  <span>分享</span>
                </button>
                <button
                  onClick={handleBookmark}
                  className={`flex items-center space-x-2 ${bookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                >
                  <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
                  <span>{bookmarked ? '已收藏' : '收藏'}</span>
                </button>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">评论 ({comments.length})</h2>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                <div className="flex-1">
                  <textarea
                    placeholder="发表你的看法..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      发表评论
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="p-4">
              {comments.length > 0 ? (
                comments.map((comment) => renderComment(comment))
              ) : (
                <div className="text-center py-8 text-gray-500">暂无评论，来抢沙发吧</div>
              )}
              
              {/* Load More */}
              <div className="text-center mt-6">
                <button className="text-primary-600 hover:text-primary-700 font-medium">
                  加载更多评论
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">帖子信息</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>作者ID:</span>
                <span className="font-medium">{post.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span>发布时间:</span>
                <span className="font-medium">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>浏览:</span>
                <span className="font-medium">{post.view_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>点赞:</span>
                <span className="font-medium">{post.like_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>评论:</span>
                <span className="font-medium">{post.comment_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Related Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">相关话题</h3>
            <div className="space-y-2">
              {['投资分析', '市场研究', '数据解读'].map((topic) => (
                <Link key={topic} to={`/search?q=${topic}`} className="block text-sm text-gray-700 hover:text-primary-600 bg-gray-50 px-2 py-1 rounded">
                  #{topic}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
