import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { ThumbsUp, MessageSquare, Share2, Bookmark, Eye, Clock, Send, MoreHorizontal, Award } from 'lucide-react'

export default function PostDetail() {
  const { postId } = useParams()
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [commentText, setCommentText] = useState('')

  // Mock post data
  const post = {
    id: postId,
    title: '贵州茅台2024年报深度解读：业绩超预期，估值修复进行时',
    author: {
      id: 1,
      name: '价值猎人',
      avatar: '👤',
      level: 'Lv.5',
      isVerified: true,
      isProfessional: true
    },
    content: `## 财务数据概览

贵州茅台2024年报显示，公司实现营业收入**1,234.56亿元**，同比增长**15.2%**；归属于上市公司股东的净利润**678.90亿元**，同比增长**18.5%**。

### 核心亮点

1. **毛利率持续提升**：2024年毛利率达到91.5%，较去年提升0.8个百分点
2. **现金流充沛**：经营活动产生的现金流量净额为856.78亿元，同比增长22.3%
3. **分红慷慨**：拟每10股派发现金红利259.11元（含税），分红率超过75%

## 估值分析

当前股价对应2024年PE约为**28倍**，处于历史中位水平。考虑到公司的护城河和稳健增长，我们认为当前估值具备一定安全边际。

## 投资建议

**买入评级**，目标价**2,200元**。建议长期投资者逢低布局，享受稳健增长带来的复利收益。`,
    tags: ['贵州茅台', '财报解读', '价值投资'],
    publishTime: '2024-03-28 14:30',
    views: 12345,
    likes: 892,
    comments: 156,
    shares: 45,
    isEssence: true,
    section: 'A股讨论'
  }

  const initialComments = [
    {
      id: 1,
      author: { name: '技术派', avatar: '👤', level: 'Lv.3' },
      content: '分析很到位，茅台的护城河确实深。不过当前估值不算便宜，需要等待更好的入场时机。',
      time: '2小时前',
      likes: 45,
      replies: [
        {
          id: 11,
          author: { name: '价值猎人', avatar: '👤', level: 'Lv.5', isProfessional: true },
          content: '@技术派 同意，估值修复需要时间，建议分批建仓',
          time: '1小时前',
          likes: 23,
          replies: [
            {
              id: 111,
              author: { name: '技术派', avatar: '👤', level: 'Lv.3' },
              content: '@价值猎人 谢谢建议，会考虑分批操作',
              time: '30分钟前',
              likes: 8,
              replies: []
            }
          ]
        }
      ]
    },
    {
      id: 2,
      author: { name: '趋势跟踪', avatar: '👤', level: 'Lv.4' },
      content: '茅台的技术面也在走好，日线MACD金叉，可以关注',
      time: '1小时前',
      likes: 32,
      replies: []
    },
    {
      id: 3,
      author: { name: '基金达人', avatar: '👤', level: 'Lv.3' },
      content: '作为消费股的代表，茅台的表现对整个板块都有风向标作用',
      time: '45分钟前',
      likes: 28,
      replies: []
    }
  ]

  const [comments, setComments] = useState(initialComments)

  const countComments = (items) => items.reduce(
    (total, item) => total + 1 + (item.replies ? countComments(item.replies) : 0),
    0
  )

  const totalComments = countComments(comments)

  const findCommentAuthor = (items, targetId) => {
    for (const item of items) {
      if (item.id === targetId) {
        return item.author?.name || '用户'
      }
      if (item.replies?.length) {
        const nested = findCommentAuthor(item.replies, targetId)
        if (nested) {
          return nested
        }
      }
    }
    return null
  }

  const addReplyToComments = (items, targetId, reply) => items.map((item) => {
    if (item.id === targetId) {
      return { ...item, replies: [...(item.replies || []), reply] }
    }
    if (item.replies?.length) {
      return { ...item, replies: addReplyToComments(item.replies, targetId, reply) }
    }
    return item
  })

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  const handleReply = (commentId) => {
    setReplyingTo(commentId)
  }

  const handleSubmitComment = () => {
    const trimmed = commentText.trim()
    if (!trimmed) return

    const replyTarget = replyingTo ? findCommentAuthor(comments, replyingTo) : null
    const newComment = {
      id: Date.now(),
      author: { name: '我', avatar: '👤', level: 'Lv.1' },
      content: replyTarget ? `@${replyTarget} ${trimmed}` : trimmed,
      time: '刚刚',
      likes: 0,
      replies: []
    }

    setComments((prev) => (
      replyingTo
        ? addReplyToComments(prev, replyingTo, newComment)
        : [newComment, ...prev]
    ))

    setCommentText('')
    setReplyingTo(null)
  }

  const renderComment = (comment, depth = 0) => {
    const marginLeft = depth * 4
    const replyingComment = replyingTo === comment.id

    return (
      <div key={comment.id} className={`${marginLeft > 0 ? `ml-${marginLeft} border-l-2 border-gray-200 pl-4` : ''} py-4`}>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
              {comment.author.avatar}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{comment.author.name}</span>
              {comment.author.isProfessional && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Award className="h-3 w-3 mr-0.5" />
                  加V
                </span>
              )}
              <span className="text-xs text-gray-500">{comment.author.level}</span>
              <span className="text-xs text-gray-400">{comment.time}</span>
            </div>
            <div className="mt-2 text-gray-700 whitespace-pre-wrap">{comment.content}</div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <button className="flex items-center space-x-1 hover:text-primary-600">
                <ThumbsUp className="h-4 w-4" />
                <span>{comment.likes}</span>
              </button>
              <button
                onClick={() => handleReply(comment.id)}
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
                  placeholder={`回复 ${comment.author.name}...`}
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

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
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
                {post.isEssence && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Award className="h-3 w-3 mr-1" />
                    精华
                  </span>
                )}
                <Link to={`/forum/${post.section.toLowerCase().replace(' ', '-')}`} className="text-sm text-primary-600 hover:text-primary-700">
                  {post.section}
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${post.author.id}`} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                      {post.author.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{post.author.name}</span>
                        {post.author.isProfessional && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Award className="h-3 w-3 mr-0.5" />
                            加V
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{post.author.level}</span>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.publishTime}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {post.views}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Body */}
            <div className="p-6">
              <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-line">
                {post.content}
              </div>
              
              {/* Tags */}
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
            </div>

            {/* Post Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-primary-600">
                  <MessageSquare className="h-5 w-5" />
                  <span>{totalComments}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-primary-600">
                  <Share2 className="h-5 w-5" />
                  <span>{post.shares}</span>
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
              <h2 className="text-lg font-semibold">评论 ({totalComments})</h2>
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
              {comments.map((comment) => renderComment(comment))}
              
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
          {/* Author Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                {post.author.avatar}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{post.author.name}</span>
                  {post.author.isProfessional && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Award className="h-3 w-3 mr-0.5" />
                      加V
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{post.author.level}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
                关注
              </button>
              <button className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                私信
              </button>
            </div>
          </div>

          {/* Related Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">相关推荐</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Link key={i} to={`/post/${i}`} className="block text-sm text-gray-700 hover:text-primary-600 line-clamp-2">
                  {i}. 贵州茅台技术面分析与操作建议
                </Link>
              ))}
            </div>
          </div>

          {/* Hot Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">热门话题</h3>
            <div className="space-y-2">
              {['贵州茅台', '新能源', '量化交易', '基金定投'].map((topic) => (
                <Link key={topic} to={`/search?q=${topic}`} className="block text-sm text-gray-700 hover:text-primary-600">
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
