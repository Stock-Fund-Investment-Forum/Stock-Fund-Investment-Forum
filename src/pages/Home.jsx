import { Link } from 'react-router-dom'
import { MessageSquare, ThumbsUp, Eye, Clock, TrendingUp, Star, Award, Plus } from 'lucide-react'

export default function Home() {
  // Mock data for demonstration
  const featuredPosts = [
    {
      id: 1,
      title: '2024年新能源行业投资策略深度解析',
      author: '价值猎人',
      avatar: '👤',
      views: 12345,
      likes: 892,
      comments: 156,
      time: '2小时前',
      tags: ['新能源', '行业分析'],
      isFeatured: true,
      isEssence: true
    },
    {
      id: 2,
      title: '贵州茅台2024年报解读：业绩超预期',
      author: '白酒研究员',
      avatar: '👤',
      views: 8923,
      likes: 654,
      comments: 98,
      time: '4小时前',
      tags: ['贵州茅台', '财报解读'],
      isFeatured: true,
      isEssence: true
    },
    {
      id: 3,
      title: '量化交易策略：双均线系统回测报告',
      author: '量化达人',
      avatar: '👤',
      views: 5678,
      likes: 423,
      comments: 67,
      time: '6小时前',
      tags: ['量化交易', '策略回测'],
      isFeatured: false,
      isEssence: true
    }
  ]

  const hotTopics = [
    { rank: 1, name: '贵州茅台', discussions: 2345, change: '+15%' },
    { rank: 2, name: '宁德时代', discussions: 1892, change: '+8%' },
    { rank: 3, name: '新能源', discussions: 1654, change: '+22%' },
    { rank: 4, name: '人工智能', discussions: 1234, change: '+12%' },
    { rank: 5, name: '半导体', discussions: 987, change: '+5%' },
    { rank: 6, name: '量化交易', discussions: 876, change: '+3%' },
    { rank: 7, name: '基金定投', discussions: 765, change: '+7%' },
    { rank: 8, name: '港股通', discussions: 654, change: '+10%' },
    { rank: 9, name: '美股ETF', discussions: 543, change: '+4%' },
    { rank: 10, name: 'REITs', discussions: 432, change: '+2%' }
  ]

  const recentPosts = [
    {
      id: 4,
      title: '今日A股市场复盘：科技股领涨',
      author: '市场观察者',
      avatar: '👤',
      views: 2341,
      likes: 156,
      comments: 34,
      time: '10分钟前',
      section: 'A股讨论',
      isEssence: false
    },
    {
      id: 5,
      title: '港股通新规解读：哪些标的受益？',
      author: '港股专家',
      avatar: '👤',
      views: 1876,
      likes: 123,
      comments: 28,
      time: '30分钟前',
      section: '港股讨论',
      isEssence: false
    },
    {
      id: 6,
      title: '美股科技股回调：买入机会？',
      author: '美股分析师',
      avatar: '👤',
      views: 1543,
      likes: 98,
      comments: 45,
      time: '1小时前',
      section: '美股讨论',
      isEssence: false
    },
    {
      id: 7,
      title: '基金定投策略：如何选择定投时机',
      author: '基金达人',
      avatar: '👤',
      views: 1234,
      likes: 87,
      comments: 23,
      time: '2小时前',
      section: '基金投资',
      isEssence: false
    }
  ]

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
              {featuredPosts.map((post) => (
                <Link key={post.id} to={`/post/${post.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{post.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {post.isEssence && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            精华
                          </span>
                        )}
                        {post.isFeatured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            推荐
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span>{post.author}</span>
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
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">最新发布</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentPosts.map((post) => (
                <Link key={post.id} to={`/post/${post.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{post.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="text-primary-600">{post.section}</span>
                        <span>{post.author}</span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views}
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                {hotTopics.map((topic) => (
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
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">社区数据</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold">12.5K</div>
                <div className="text-sm text-blue-100">注册用户</div>
              </div>
              <div>
                <div className="text-3xl font-bold">45.2K</div>
                <div className="text-sm text-blue-100">帖子总数</div>
              </div>
              <div>
                <div className="text-3xl font-bold">8.9K</div>
                <div className="text-sm text-blue-100">今日活跃</div>
              </div>
              <div>
                <div className="text-3xl font-bold">1.2K</div>
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
              <Link to="/groups/1" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">半导体投资研究组</div>
                <div className="text-sm text-gray-500 mt-1">1,234 成员</div>
              </Link>
              <Link to="/groups/2" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">量化交易交流群</div>
                <div className="text-sm text-gray-500 mt-1">987 成员</div>
              </Link>
              <Link to="/groups/3" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">价值投资实践者</div>
                <div className="text-sm text-gray-500 mt-1">2,345 成员</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
