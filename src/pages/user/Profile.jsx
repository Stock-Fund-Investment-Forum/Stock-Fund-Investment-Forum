import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Award, Eye, Clock, Calendar, MapPin, Link as LinkIcon, MessageSquare, ThumbsUp, Star, Trophy, Shield } from 'lucide-react';

export default function Profile() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');

  const user = {
    id: userId,
    name: '价值猎人',
    avatar: '👤',
    level: 'Lv.5',
    bio: '专注价值投资，相信复利的力量。分享投资心得，与志同道合者交流。',
    location: '上海',
    website: 'https://example.com',
    joinDate: '2023-01-15',
    stats: {
      posts: 128,
      followers: 1234,
      following: 567,
      likes: 5678,
      influence: 890
    },
    isVerified: true,
    isProfessional: true,
    isRealNameVerified: true,
    achievements: [
      { id: 1, name: '新手上路', icon: '🎯', obtained: true },
      { id: 2, name: '精华达人', icon: '⭐', obtained: true },
      { id: 3, name: '影响力之星', icon: '🌟', obtained: true },
      { id: 4, name: '百篇作者', icon: '📝', obtained: false },
      { id: 5, name: '十年老友', icon: '🏆', obtained: false }
    ],
    investmentPreferences: {
      markets: ['A股', '港股'],
      style: '成长型',
      industries: ['科技', '消费']
    }
  };

  const posts = [
    {
      id: 1,
      title: '贵州茅台2024年报深度解读',
      section: 'A股讨论',
      time: '2小时前',
      views: 12345,
      likes: 892,
      comments: 156,
      isEssence: true
    },
    {
      id: 2,
      title: '新能源板块轮动策略分享',
      section: 'A股讨论',
      time: '1天前',
      views: 5678,
      likes: 423,
      comments: 67,
      isEssence: true
    },
    {
      id: 3,
      title: '价值投资实践心得',
      section: '价值投资专区',
      time: '3天前',
      views: 3456,
      likes: 234,
      comments: 45,
      isEssence: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-primary-500 to-purple-600 rounded-t-xl"></div>
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between -mt-12">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center text-5xl shadow-lg">
                {user.avatar}
              </div>
              <div className="pb-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  {user.isVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-0.5" />
                      实名
                    </span>
                  )}
                  {user.isProfessional && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Award className="h-3 w-3 mr-0.5" />
                      加V
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{user.level}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                关注
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                私信
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-700">{user.bio}</p>
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              {user.location && (
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {user.location}
                </span>
              )}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary-600">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  {user.website}
                </a>
              )}
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                加入于 {user.joinDate}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats.posts}</div>
              <div className="text-sm text-gray-500">发帖</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats.followers}</div>
              <div className="text-sm text-gray-500">粉丝</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats.following}</div>
              <div className="text-sm text-gray-500">关注</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats.influence}</div>
              <div className="text-sm text-gray-500">影响力</div>
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">投资偏好</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-gray-600">关注市场：</span>
              {user.investmentPreferences.markets.map((m) => (
                <span key={m} className="px-2 py-1 bg-white rounded text-gray-700">{m}</span>
              ))}
              <span className="text-gray-600 ml-2">投资风格：</span>
              <span className="px-2 py-1 bg-white rounded text-gray-700">{user.investmentPreferences.style}</span>
              <span className="text-gray-600 ml-2">关注行业：</span>
              {user.investmentPreferences.industries.map((i) => (
                <span key={i} className="px-2 py-1 bg-white rounded text-gray-700">{i}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'posts', label: '帖子', icon: MessageSquare },
            { id: 'comments', label: '评论', icon: MessageSquare },
            { id: 'likes', label: '点赞', icon: ThumbsUp },
            { id: 'favorites', label: '收藏', icon: Star },
            { id: 'achievements', label: '成就', icon: Trophy }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium ${activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {post.isEssence && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          精华
                        </span>
                      )}
                      <span className="text-sm text-primary-600">{post.section}</span>
                      <span className="text-sm text-gray-400">{post.time}</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">{post.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{post.views} 浏览</span>
                      <span>{post.likes} 点赞</span>
                      <span>{post.comments} 评论</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">成就勋章</h3>
          <div className="grid grid-cols-5 gap-4">
            {user.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg text-center ${achievement.obtained ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="text-sm font-medium text-gray-900">{achievement.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {achievement.obtained ? '已获得' : '未获得'}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">影响力值计算规则</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 发帖 +5 分</li>
              <li>• 获得精华 +20 分</li>
              <li>• 获得点赞 +1 分</li>
              <li>• 获得评论 +2 分</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-100">
            {[
              {
                id: 1,
                postTitle: '贵州茅台2024年报深度解读',
                postAuthor: '白酒研究员',
                content: '分析很到位，茅台的护城河确实深。不过当前估值不算便宜，需要等待更好的入场时机。',
                time: '2小时前',
                likes: 45
              },
              {
                id: 2,
                postTitle: '新能源板块轮动策略分享',
                postAuthor: '趋势跟踪',
                content: '这个策略很有参考价值，我会尝试应用到我的投资组合中。',
                time: '1天前',
                likes: 23
              },
              {
                id: 3,
                postTitle: '量化交易策略：双均线系统回测报告',
                postAuthor: '量化达人',
                content: '回测数据很详细，建议加入止损参数的测试。',
                time: '3天前',
                likes: 18
              }
            ].map((comment) => (
              <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link to={`/post/${comment.id}`} className="text-sm text-primary-600 hover:text-primary-700">
                        {comment.postTitle}
                      </Link>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{comment.postAuthor}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {comment.likes}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {comment.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'likes' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-100">
            {[
              {
                id: 1,
                title: '贵州茅台2024年报深度解读',
                author: '白酒研究员',
                section: 'A股讨论',
                time: '2小时前',
                likes: 892,
                comments: 156
              },
              {
                id: 2,
                title: '新能源板块轮动策略分享',
                author: '趋势跟踪',
                section: 'A股讨论',
                time: '1天前',
                likes: 423,
                comments: 67
              },
              {
                id: 3,
                title: '量化交易策略：双均线系统回测报告',
                author: '量化达人',
                section: '量化投资专区',
                time: '3天前',
                likes: 234,
                comments: 45
              }
            ].map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-primary-600">{post.section}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{post.author}</span>
                    </div>
                    <h3 className="text-base font-medium text-gray-900 hover:text-primary-600">{post.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
      )}

      {activeTab === 'favorites' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-100">
            {[
              {
                id: 1,
                title: '贵州茅台2024年报深度解读：业绩超预期',
                author: '白酒研究员',
                section: 'A股讨论',
                time: '2小时前',
                views: 12345,
                tags: ['贵州茅台', '财报解读']
              },
              {
                id: 2,
                title: '2024年新能源行业投资策略深度解析',
                author: '行业分析师',
                section: 'A股讨论',
                time: '1天前',
                views: 8923,
                tags: ['新能源', '行业分析']
              },
              {
                id: 3,
                title: '价值投资实践：如何选择优质股票',
                author: '价值投资者',
                section: '价值投资专区',
                time: '3天前',
                views: 5678,
                tags: ['价值投资', '选股策略']
              }
            ].map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-primary-600">{post.section}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{post.author}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{post.time}</span>
                    </div>
                    <h3 className="text-base font-medium text-gray-900 hover:text-primary-600 mb-2">{post.title}</h3>
                    <div className="flex items-center space-x-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.views}
                      </span>
                    </div>
                  </div>
                  <button className="text-yellow-500 hover:text-yellow-600">
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
