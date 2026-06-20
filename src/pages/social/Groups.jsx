import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Users, Lock, Globe, Star, MoreHorizontal, Loader, X } from 'lucide-react'
import { groupsService } from '../../services'
import { useAuth } from '../../context/AuthContext'

const EMOJI_LIST = ['💾', '📊', '💰', '⚡', '🇭🇰', '🇺🇸', '🏢', '📈', '🎯', '🔬', '🤖', '🏦']

function getEmoji(index) {
  return EMOJI_LIST[index % EMOJI_LIST.length]
}

export default function Groups() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('my')
  const [myGroups, setMyGroups] = useState([])
  const [discoverGroups, setDiscoverGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    access_level: 'PUBLIC'
  })

  const fetchGroups = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (searchQuery) params.q = searchQuery
      const res = await groupsService.getGroups(params)
      const items = Array.isArray(res) ? res : res.items || []
      const mapped = items.map((g, idx) => ({
        id: g.group_id || g.id,
        name: g.name,
        description: g.description,
        avatar: getEmoji(idx),
        members: g.member_count || g.members || 0,
        posts: g.post_count || g.posts || 0,
        type: g.access_level === 'PRIVATE' ? 'private' : 'public',
        needApproval: g.access_level === 'NEED_APPROVAL',
        isOwner: g.is_owner || false,
        isAdmin: g.is_admin || false,
        isMember: g.is_member || false,
        unread: g.unread_count || 0,
      }))
      setMyGroups(mapped.filter(g => g.isMember))
      setDiscoverGroups(mapped.filter(g => !g.isMember))
    } catch (err) {
      console.error('Failed to fetch groups:', err)
      setError(err.message || '获取群组列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [searchQuery])

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
          <button onClick={fetchGroups} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            重新加载
          </button>
        </div>
      </div>
    )
  }

  const handleCreateGroup = async () => {
    if (!isAuthenticated) {
      alert('请先登录')
      navigate('/login')
      return
    }

    if (!newGroup.name.trim()) {
      alert('请输入群组名称')
      return
    }

    try {
      setCreating(true)
      const createdGroup = await groupsService.createGroup({
        name: newGroup.name,
        description: newGroup.description,
        access_level: newGroup.access_level
      })
      
      alert('群组创建成功！')
      setShowCreateModal(false)
      setNewGroup({ name: '', description: '', access_level: 'PUBLIC' })
      
      // 刷新群组列表
      fetchGroups()
      
      // 跳转到新创建的群组
      navigate(`/groups/${createdGroup.group_id}`)
    } catch (err) {
      console.error('Failed to create group:', err)
      alert('创建失败: ' + (err.message || '请稍后重试'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">群组</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                {group.isMember ? (
                  <button
                    onClick={async () => { try { await groupsService.leaveGroup(group.id); fetchGroups() } catch (e) { alert(e.message) } }}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    退出群组
                  </button>
                ) : (
                  <button
                    onClick={async () => { try { await groupsService.joinGroup(group.id); fetchGroups() } catch (e) { alert(e.message) } }}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    加入群组
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manage Groups */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-100">
            {myGroups.map((group) => (
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

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">创建新群组</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  群组名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="输入群组名称"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  群组描述
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="介绍一下这个群组..."
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  访问权限
                </label>
                <select
                  value={newGroup.access_level}
                  onChange={(e) => setNewGroup({ ...newGroup, access_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="PUBLIC">公开群组 - 任何人可加入</option>
                  <option value="NEED_APPROVAL">审核制 - 需要管理员审核</option>
                  <option value="PRIVATE">私密群组 - 仅邀请可加入</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  取消
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  disabled={creating}
                >
                  {creating ? '创建中...' : '创建群组'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
