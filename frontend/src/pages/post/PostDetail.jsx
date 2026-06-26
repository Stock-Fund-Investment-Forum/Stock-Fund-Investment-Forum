import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThumbsUp, MessageSquare, Share2, Bookmark, Eye, Clock, Send, MoreHorizontal, Award, Loader, ChevronDown, ChevronRight, Copy } from 'lucide-react'
import { postsService, commentsService } from '../../services'
import { post as httpPost, deleteRequest, get } from '../../utils/http'
import { API_ENDPOINTS } from '../../constants/api'
import { useAuth } from '../../context/AuthContext'
import { parseIsoDate } from '../../utils/dates'

export default function PostDetail() {
  const { postId } = useParams()
  const { isAuthenticated } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedReplies, setExpandedReplies] = useState({})
  const [childComments, setChildComments] = useState({})
  const [copied, setCopied] = useState(false)

  const loadReplies = async (parentId) => {
    try {
      const res = await commentsService.getPostComments(postId, { page: 1, per_page: 50, parent_comment_id: parentId })
      const replies = res.items || res || []
      setChildComments(prev => ({ ...prev, [parentId]: replies }))
      setExpandedReplies(prev => ({ ...prev, [parentId]: true }))
    } catch { setChildComments(prev => ({ ...prev, [parentId]: [] })) }
  }

  const toggleReplies = (commentId) => {
    if (expandedReplies[commentId]) {
      setExpandedReplies(prev => ({ ...prev, [commentId]: false }))
    } else {
      loadReplies(commentId)
    }
  }

  // 加载帖子详情和评论
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use a simple in-memory cache on window to avoid duplicate GET requests
        // during React StrictMode double-mount in development which would cause
        // the backend to increment view_count twice.
        const cache = (typeof window !== 'undefined') ? (window.__sfif_postCache = window.__sfif_postCache || {}) : null

        let postRes
        let commentsRes

        if (cache && cache[postId]) {
          // cache[postId] may be a Promise (in-flight) or the resolved post object
          if (typeof cache[postId].then === 'function') {
            // In-flight: await the promise to get the post, avoid duplicate network call
            postRes = await cache[postId]
          } else {
            // Resolved cached object
            postRes = cache[postId]
          }
          // Still fetch comments fresh
          commentsRes = await commentsService.getPostComments(postId, { page: 1, per_page: 50 })
        } else {
          // Create a promise in cache immediately to deduplicate concurrent calls
          if (cache) {
            const p = postsService.getPost(postId)
              .then(res => {
                // replace promise with resolved value
                cache[postId] = res
                return res
              })
              .catch(err => {
                // clear cache on error so future attempts can retry
                delete cache[postId]
                throw err
              })
            cache[postId] = p
            postRes = await p
          } else {
            // No window available (SSR unlikely), just fetch
            postRes = await postsService.getPost(postId)
          }

          // Fetch comments in parallel with post promise when possible
          commentsRes = await commentsService.getPostComments(postId, { page: 1, per_page: 50 })
        }

        setPost(postRes)
        setComments(commentsRes.items || commentsRes || [])
        
        // 检查是否已收藏（从后端查询）
        if (isAuthenticated) {
          try {
            const eng = await get(`${API_ENDPOINTS.ENGAGEMENTS}?content_id=${postId}&content_type=POST&engagement_type=BOOKMARK`)
            setBookmarked(eng.exists || false)
          } catch { setBookmarked(false) }
        }
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
  }, [postId, isAuthenticated])

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('请先登录')
      return
    }
    try {
      if (liked) {
        await postsService.unlikePost(postId)
      } else {
        await postsService.likePost(postId)
      }
      setLiked(!liked)
      setPost(prev => prev ? { ...prev, like_count: (prev.like_count || 0) + (liked ? -1 : 1) } : prev)
    } catch (err) {
      console.error('Failed to toggle like:', err)
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert('请先登录')
      return
    }

    try {
      if (bookmarked) {
        await deleteRequest(API_ENDPOINTS.ENGAGEMENTS, {
          body: { content_id: postId, content_type: 'POST', engagement_type: 'BOOKMARK' }
        })
        setBookmarked(false)
      } else {
        await httpPost(API_ENDPOINTS.ENGAGEMENTS, {
          content_id: postId, content_type: 'POST', engagement_type: 'BOOKMARK'
        })
        setBookmarked(true)
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    }
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
  const renderComment = (comment, depth = 0, isChild = false) => {
    const replyingComment = replyingTo === comment.comment_id
    const hasReplies = childComments[comment.comment_id]?.length > 0

    return (
      <div key={comment.comment_id} className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''} ${!isChild ? 'py-4 border-t border-gray-100 first:border-t-0' : 'py-3'}`}>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{comment.user_id?.slice(0, 8) || '匿名'}</span>
              <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            <div className="mt-2 text-gray-700 whitespace-pre-wrap">{comment.content}</div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <button className="flex items-center space-x-1 hover:text-primary-600">
                <ThumbsUp className="h-4 w-4" />
                <span>{comment.like_count || 0}</span>
              </button>
              <button onClick={() => handleReply(comment.comment_id)} className="flex items-center space-x-1 hover:text-primary-600">
                <MessageSquare className="h-4 w-4" />
                <span>回复</span>
              </button>
            </div>

            {/* Load replies button */}
            {depth < 3 && (
              <button onClick={() => toggleReplies(comment.comment_id)} className="mt-1 flex items-center text-xs text-primary-600 hover:text-primary-700">
                {expandedReplies[comment.comment_id] ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                {hasReplies ? `${childComments[comment.comment_id].length} 条回复` : '查看回复'}
              </button>
            )}

            {/* Reply Input */}
            {replyingComment && (
              <div className="mt-3 flex space-x-2">
                <input type="text" placeholder="输入回复..." value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSubmitComment())} />
                <button onClick={handleSubmitComment} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><Send className="h-4 w-4" /></button>
                <button onClick={() => setReplyingTo(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              </div>
            )}

            {/* Child comments */}
            {expandedReplies[comment.comment_id] && childComments[comment.comment_id]?.length > 0 && (
              <div className="mt-2">
                {childComments[comment.comment_id].map(reply => renderComment(reply, depth + 1, true))}
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
                        <span className="font-medium text-gray-900">{post.user_nickname || post.user_id?.slice(0, 8)}</span>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {parseIsoDate(post.created_at).toLocaleString()}
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
              <div className="prose prose-blue max-w-none text-gray-700">
                {post.content.split(/(!\[.*?\]\(.*?\))/g).map((part, i) => {
                  const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/)
                  if (imgMatch) {
                    return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} className="max-w-full rounded-lg my-2" onError={e => { e.target.style.display = 'none' }} />
                  }
                  return <span key={i} className="whitespace-pre-line">{part}</span>
                })}
              </div>
              
              {/* Tags - 若后端提供 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {post.tags.map((tag) => {
                    // Backend may return tag as object { name, tag_id, ... } or as string
                    const tagName = typeof tag === 'string' ? tag : (tag.name || '');
                    const tagKey = (tag && tag.tag_id) || tagName;
                    return (
                      <Link
                        key={tagKey}
                        to={`/search?q=${encodeURIComponent(tagName)}`}
                        className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full hover:bg-primary-100"
                      >
                        #{tagName}
                      </Link>
                    )
                  })}
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
                <button onClick={() => {
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    setCopied(true); setTimeout(() => setCopied(false), 2000)
                  }).catch(() => {})
                }} className="flex items-center space-x-2 text-gray-500 hover:text-primary-600">
                  {copied ? <Copy className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
                  <span>{copied ? '已复制' : '分享'}</span>
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
                    placeholder="发表你的看法... 输入 @用户名 可提及他人"
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
                <span className="font-medium">{parseIsoDate(post.created_at).toLocaleDateString()}</span>
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
