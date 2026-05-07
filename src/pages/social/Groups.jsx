import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users, Lock, Globe, Star, MoreHorizontal } from 'lucide-react'

export default function Groups() {
  const [activeTab, setActiveTab] = useState('my') // 'my', 'discover', 'manage'

  const myGroups = [
    {
      id: 1,
      name: '半导体投资研究组',
      description: '专注半导体行业投资研究，分享行业报告和投资机会',
      avatar: '💾',
      members: 1234,
      posts: 4567,
      isOwner: false,
      isAdmin: true,
      unread: 5
    },
    {
      id: 2,
      name: '量化交易交流群',
      description: '量化策略讨论、回测结果分享、代码交流',
      avatar: '📊',
      members: 987,
      posts: 2345,
      isOwner: true,
      isAdmin: true,
      unread: 0
    },
    {
      id: 3,
      name: '价值投资实践者',
      description: '价值投资理念交流，基本面分析方法讨论',
      avatar: '💰',
      members: 2345,
      posts: 5678,
      isOwner: false,
      isAdmin: false,
      unread: 2
    }
  ]

  const discoverGroups = [
    {
      id: 4,
      name: '新能源投资圈',
      description: '新能源产业链投资机会分析',
      avatar: '⚡',
      members: 3456,
      posts: 7890,
      type: 'public',
      needApproval: false
    },
    {
      id: 5,
      name: '港股通投资群',
      description: '港股通标的讨论和投资策略',
      avatar: '🇭🇰',
      members: 1567,
      posts: 3456,
      type: 'public',
      needApproval: true
    },
    {
      id: 6,
      name: '美股ETF投资',
      description: '美股ETF投资策略和标的分析',
      avatar: '🇺🇸',
      members: 2345,
      posts: 4567,
      type: 'public',
      needApproval: false
    },
    {
      id: 7,
      name: 'REITs投资研究',
      description: '不动产投资信托基金投资研究',
      avatar: '🏢',
      members: 876,
      posts: 1234,
      type: 'private',
      needApproval: true
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">群组</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="h-5 w-5" />
          <span>创建群组</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 px-6 py-4 font-medium ${
              activeTab === 'my'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            我的群组
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 px-6 py-4 font-medium ${
              activeTab === 'discover'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            发现群组
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 px-6 py-4 font-medium ${
              activeTab === 'manage'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            群组管理
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索群组..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* My Groups */}
      {activeTab === 'my' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myGroups.map((group) => (
            <Link key={group.id} to={`/groups/${group.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                  {group.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{group.name}</h3>
                    {group.isOwner && <Star className="h-4 w-4 text-yellow-500" />}
                    {group.isAdmin && !group.isOwner && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">管理员</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {group.members}
                </span>
                <span>{group.posts} 帖子</span>
              </div>
              {group.unread > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-primary-600">{group.unread} 条新消息</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Discover Groups */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discoverGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                  {group.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{group.name}</h3>
                    {group.type === 'private' ? (
                      <Lock className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {group.members}
                </span>
                <span>{group.posts} 帖子</span>
              </div>
              <div className="mt-4 flex space-x-2">
                {group.needApproval ? (
                  <button className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
                    申请加入
                  </button>
                ) : (
                  <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    加入群组
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Star className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manage Groups */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-100">
            {myGroups.filter(g => g.isOwner || g.isAdmin).map((group) => (
              <div key={group.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                      {group.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-900">{group.name}</h3>
                        {group.isOwner && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {group.members} 成员
                        </span>
                        <span>{group.posts} 帖子</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/groups/${group.id}/settings`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      群组设置
                    </Link>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
