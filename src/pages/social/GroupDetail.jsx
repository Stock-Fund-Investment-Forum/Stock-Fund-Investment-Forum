import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Users, FileText, MessageSquare, Star, Settings, Plus, Search, Send, Lock, Globe, TrendingUp } from 'lucide-react'

export default function GroupDetail() {
  const { groupId } = useParams()
  const [activeTab, setActiveTab] = useState('posts') // 'posts', 'files', 'members', 'polls'
  const [postText, setPostText] = useState('')

  const group = {
    id: groupId,
    name: '半导体投资研究组',
    description: '专注半导体行业投资研究，分享行业报告和投资机会',
    avatar: '💾',
    cover: '🔬',
    members: 1234,
    posts: 4567,
    files: 234,
    type: 'public',
    isOwner: false,
    isAdmin: true,
    isMember: true,
    createdAt: '2023-06-15'
  }

  const posts = [
    {
      id: 1,
      author: { name: '芯片分析师', avatar: '👤', level: 'Lv.4', isProfessional: true },
      content: '中芯国际最新财报分析：营收同比增长15%，毛利率持续提升。建议关注先进制程进展...',
      time: '2小时前',
      likes: 45,
      comments: 12
    },
    {
      id: 2,
      author: { name: '半导体研究员', avatar: '👤', level: 'Lv.3' },
      content: '分享一份2024年半导体行业深度研究报告，包含产业链分析和投资机会梳理',
      time: '5小时前',
      likes: 67,
      comments: 23,
      hasAttachment: true
    },
    {
      id: 3,
      author: { name: '价值猎人', avatar: '👤', level: 'Lv.5', isProfessional: true },
      content: '半导体板块近期回调，是否是买入机会？我认为应该关注基本面良好的龙头企业',
      time: '1天前',
      likes: 89,
      comments: 34
    }
  ]

  const files = [
    { id: 1, name: '2024半导体行业深度报告.pdf', size: '5.2MB', author: '半导体研究员', time: '2天前' },
    { id: 2, name: '中芯国际财报分析.xlsx', size: '1.8MB', author: '芯片分析师', time: '3天前' },
    { id: 3, name: '半导体产业链图谱.png', size: '2.3MB', author: '行业观察者', time: '1周前' }
  ]

  const members = [
    { id: 1, name: '群主', avatar: '👤', level: 'Lv.6', role: 'owner', isOnline: true },
    { id: 2, name: '芯片分析师', avatar: '👤', level: 'Lv.4', role: 'admin', isOnline: true, isProfessional: true },
    { id: 3, name: '半导体研究员', avatar: '👤', level: 'Lv.3', role: 'member', isOnline: false },
    { id: 4, name: '价值猎人', avatar: '👤', level: 'Lv.5', role: 'member', isOnline: true, isProfessional: true }
  ]

  const polls = [
    {
      id: 1,
      title: '下周半导体板块走势判断',
      options: [
        { text: '上涨', votes: 45, percentage: 45 },
        { text: '震荡', votes: 35, percentage: 35 },
        { text: '下跌', votes: 20, percentage: 20 }
      ],
      totalVotes: 100,
      deadline: '2024-04-05',
      hasVoted: false
    }
  ]

  const handlePostSubmit = () => {
    if (!postText.trim()) return
    console.log('Submitting group post:', postText)
    setPostText('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Group Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl flex items-center justify-center text-6xl">
          {group.cover}
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between -mt-12">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 bg-white rounded-xl border-4 border-white flex items-center justify-center text-5xl shadow-lg">
                {group.avatar}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{group.description}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {group.isMember ? (
                <>
                  {group.isAdmin && (
                    <Link to={`/groups/${group.id}/settings`} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      群组设置
                    </Link>
                  )}
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    已加入
                  </button>
                </>
              ) : (
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  加入群组
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{group.members}</div>
              <div className="text-sm text-gray-500">成员</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{group.posts}</div>
              <div className="text-sm text-gray-500">帖子</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{group.files}</div>
              <div className="text-sm text-gray-500">文件</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">公开</div>
              <div className="text-sm text-gray-500">群组类型</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'posts', label: '讨论', icon: MessageSquare },
            { id: 'files', label: '文件', icon: FileText },
            { id: 'members', label: '成员', icon: Users },
            { id: 'polls', label: '投票', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5 inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {/* Post Input */}
              {group.isMember && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="发布群内讨论..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handlePostSubmit}
                      disabled={!postText.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      发布
                    </button>
                  </div>
                </div>
              )}

              {/* Posts List */}
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                      {post.author.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{post.author.name}</span>
                        {post.author.isProfessional && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-xs text-gray-500">{post.author.level}</span>
                      </div>
                      <p className="text-gray-700 mt-2">{post.content}</p>
                      {post.hasAttachment && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-700">2024半导体行业深度报告.pdf</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span>{post.time}</span>
                        <span>{post.likes} 赞</span>
                        <span>{post.comments} 评论</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">群组文件</h3>
                <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                  <Plus className="h-4 w-4" />
                  <span>上传文件</span>
                </button>
              </div>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size} · {file.author} · {file.time}</p>
                      </div>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm">下载</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">群组成员 ({group.members})</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索成员..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                          {member.avatar}
                        </div>
                        {member.isOnline && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{member.name}</span>
                          {member.isProfessional && <Star className="h-4 w-4 text-yellow-500" />}
                          {member.role === 'owner' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">群主</span>
                          )}
                          {member.role === 'admin' && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">管理员</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{member.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Polls Tab */}
          {activeTab === 'polls' && (
            <div className="space-y-4">
              {polls.map((poll) => (
                <div key={poll.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">{poll.title}</h3>
                  <div className="space-y-3">
                    {poll.options.map((option, index) => (
                      <button
                        key={index}
                        disabled={poll.hasVoted}
                        className={`w-full p-3 border rounded-lg relative ${
                          poll.hasVoted ? 'bg-gray-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="absolute left-0 top-0 h-full bg-primary-200 rounded-lg transition-all" style={{ width: `${option.percentage}%` }}></div>
                        <div className="relative flex items-center justify-between">
                          <span className="font-medium">{option.text}</span>
                          <span className="text-sm text-gray-600">{option.percentage}% ({option.votes}票)</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <span>总投票数: {poll.totalVotes}</span>
                    <span>截止时间: {poll.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">群组信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">创建时间</span>
                <span className="text-gray-900">{group.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">群组类型</span>
                <span className="text-gray-900 flex items-center">
                  {group.type === 'public' ? <Globe className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
                  {group.type === 'public' ? '公开' : '私密'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Poll */}
          {polls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold mb-4">进行中的投票</h3>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">{polls[0].title}</p>
                <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  参与投票
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
