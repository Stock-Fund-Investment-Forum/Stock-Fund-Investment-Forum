import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Users, FileText, MessageSquare, Settings, Send, Lock, Globe, TrendingUp, Loader, Upload, Plus, X, BarChart3 } from 'lucide-react'
import { groupsService, postsService } from '../../services'
import { post, get } from '../../utils/http'
import { useAuth } from '../../context/AuthContext'

export default function GroupDetail() {
  const { groupId } = useParams()
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('posts')
  const [postText, setPostText] = useState('')
  const [group, setGroup] = useState(null)
  const [groupPosts, setGroupPosts] = useState([])
  const [groupFiles, setGroupFiles] = useState([])
  const [groupMembers, setGroupMembers] = useState([])
  const [groupPolls, setGroupPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [votingPoll, setVotingPoll] = useState(null)
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [creatingPoll, setCreatingPoll] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const EMOJI_COVER = ['🔬', '🚀', '📊', '💰', '🏭', '🌍', '🎯', '🤖']

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await groupsService.getGroup(groupId)
        setGroup({
          id: data.group_id || data.id,
          name: data.name,
          description: data.description,
          avatar: '💾',
          cover: EMOJI_COVER[Math.floor(Math.random() * EMOJI_COVER.length)],
          members: data.member_count || data.members || 0,
          posts: data.post_count || data.posts || 0,
          files: data.file_count || 0,
          type: data.access_level === 'PRIVATE' ? 'private' : 'public',
          isOwner: data.is_owner || false,
          isAdmin: data.is_admin || false,
          isMember: data.is_member || false,
          createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString() : '未知',
        })
        const postsRes = await postsService.getPosts({ board_id: groupId, page: 1, per_page: 50 })
        setGroupPosts(Array.isArray(postsRes) ? postsRes : postsRes.items || [])
      } catch (err) {
        console.error('Failed to fetch group:', err)
        setError(err.message || '获取群组信息失败')
      } finally {
        setLoading(false)
      }
    }
    fetchGroup()
    const fetchFiles = async () => {
      try {
        const res = await get(`/groups/${groupId}/files?per_page=50`)
        setGroupFiles(Array.isArray(res) ? res : res.items || [])
      } catch { setGroupFiles([]) }
    }
    fetchFiles()
    const fetchMembers = async () => {
      try { const res = await get(`/groups/${groupId}/members`); setGroupMembers(Array.isArray(res) ? res : []) }
      catch { setGroupMembers([]) }
    }
    fetchMembers()
    const fetchPolls = async () => {
      try { const res = await get(`/groups/${groupId}/polls`); setGroupPolls(Array.isArray(res) ? res : []) }
      catch { setGroupPolls([]) }
    }
    fetchPolls()
  }, [groupId])

  const handleJoin = async () => {
    if (!isAuthenticated) { alert('请先登录'); return }
    setJoining(true)
    try {
      await groupsService.joinGroup(groupId)
      const data = await groupsService.getGroup(groupId)
      setGroup(prev => ({ ...prev, isMember: true, members: data.member_count || prev.members }))
    } catch (e) { alert(e.message) }
    finally { setJoining(false) }
  }

  const handleLeave = async () => {
    if (!confirm('确定退出该群组？')) return
    try {
      await groupsService.leaveGroup(groupId)
      setGroup(prev => ({ ...prev, isMember: false }))
    } catch (e) { alert(e.message) }
  }

  const handlePostSubmit = async () => {
    if (!postText.trim()) return
    try {
      await postsService.createPost({ board_id: groupId, title: `群讨论 ${new Date().toLocaleString()}`, content: postText, post_type: 'DISCUSSION' })
      setPostText('')
      const postsRes = await postsService.getPosts({ board_id: groupId, page: 1, per_page: 50 })
      setGroupPosts(Array.isArray(postsRes) ? postsRes : postsRes.items || [])
    } catch (e) { alert(e.message) }
  }

  const fetchFiles = async () => {
    try {
      const res = await get(`/groups/${groupId}/files?per_page=50`)
      setGroupFiles(Array.isArray(res) ? res : res.items || [])
    } catch { setGroupFiles([]) }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('group_id', groupId)
      await post(`/groups/${groupId}/files`, formData)
      fetchFiles()
    } catch (err) { alert('上传失败: ' + (err.message || '')) }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleVote = async (pollId, optionId) => {
    if (!isAuthenticated) { alert('请先登录'); return }
    setVotingPoll(pollId)
    try {
      await post(`/polls/${pollId}/vote`, { option_id: optionId })
      const res = await get(`/groups/${groupId}/polls`)
      setGroupPolls(Array.isArray(res) ? res : [])
    } catch (e) { alert('投票失败: ' + (e.message || '')) }
    finally { setVotingPoll(null) }
  }

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim()) { alert('请输入投票问题'); return }
    const validOptions = pollOptions.filter(o => o.trim())
    if (validOptions.length < 2) { alert('请至少添加2个选项'); return }
    setCreatingPoll(true)
    try {
      const postRes = await postsService.createPost({
        board_id: groupId,
        title: `投票: ${pollQuestion.trim()}`,
        content: pollQuestion.trim(),
        post_type: 'QUESTION',
      })
      if (postRes?.post_id) {
        await post('/polls', {
          post_id: postRes.post_id,
          question: pollQuestion.trim(),
          options: validOptions.map(text => ({ text })),
        })
      }
      setShowCreatePoll(false)
      setPollQuestion('')
      setPollOptions(['', ''])
      const res = await get(`/groups/${groupId}/polls`)
      setGroupPolls(Array.isArray(res) ? res : [])
    } catch (e) { alert('创建失败: ' + (e.message || '')) }
    finally { setCreatingPoll(false) }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + 'B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
  }

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
          <Link to="/groups" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            返回群组列表
          </Link>
        </div>
      </div>
    )
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
                  <button onClick={handleLeave} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                    退出群组
                  </button>
                </>
              ) : (
                <button onClick={handleJoin} disabled={joining} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {joining ? '加入中...' : '加入群组'}
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
              <div className="text-2xl font-bold text-gray-900">{group.type === 'public' ? '公开' : '私密'}</div>
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
              {groupPosts.length > 0 ? groupPosts.map((post) => (
                <Link key={post.post_id} to={`/post/${post.post_id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{post.user_id?.slice(0, 8) || '匿名'}</span>
                      </div>
                      <p className="text-gray-700 mt-2">{post.content}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span>{new Date(post.created_at).toLocaleString()}</span>
                        <span>{post.like_count || 0} 赞</span>
                        <span>{post.comment_count || 0} 评论</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                  暂无群内讨论
                </div>
              )}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">群组文件</h3>
                {group?.isMember && (
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="group-file-upload" />
                    <label htmlFor="group-file-upload" className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer text-sm">
                      <Upload className="h-4 w-4" />
                      <span>{uploading ? '上传中...' : '上传文件'}</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {groupFiles.length > 0 ? groupFiles.map((file) => (
                  <div key={file.file_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {file.file_type?.toUpperCase() || '未知'} ·
                          {file.user_nickname || file.user_id?.slice(0, 8)} ·
                          {file.created_at ? new Date(file.created_at).toLocaleDateString() : ''}
                          {file.file_size ? ` · ${formatFileSize(file.file_size)}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500">暂无文件</div>
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">群组成员 ({groupMembers.length})</h3>
              </div>
              <div className="space-y-3">
                {groupMembers.length > 0 ? groupMembers.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link to={`/profile/${member.user_id}`} className="font-medium text-gray-900 hover:text-primary-600">{member.nickname}</Link>
                          {member.role === 'OWNER' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">群主</span>}
                          {member.role === 'ADMIN' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">管理员</span>}
                        </div>
                        {member.joined_at && <span className="text-xs text-gray-500">加入于 {new Date(member.joined_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500">暂无成员</div>
                )}
              </div>
            </div>
          )}

          {/* Polls Tab */}
          {activeTab === 'polls' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                <h3 className="font-semibold">群组投票</h3>
                {group?.isMember && (
                  <button onClick={() => setShowCreatePoll(true)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                    <Plus className="h-4 w-4 mr-1" />创建投票
                  </button>
                )}
              </div>

              {groupPolls.length > 0 ? groupPolls.map((poll) => {
                const total = poll.options.reduce((s, o) => s + (o.vote_count || 0), 0) || 1
                return (
                  <div key={poll.poll_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">{poll.question}</h3>
                    <div className="space-y-3">
                      {poll.options.map((option) => {
                        const pct = Math.round((option.vote_count / total) * 100)
                        return (
                          <button key={option.option_id}
                            onClick={() => handleVote(poll.poll_id, option.option_id)}
                            disabled={poll.has_voted || votingPoll === poll.poll_id}
                            className={`w-full p-3 border rounded-lg relative text-left ${
                              poll.has_voted ? 'bg-gray-50 cursor-default' : 'hover:bg-gray-50'
                            }`}>
                            <div className="absolute left-0 top-0 h-full bg-primary-200 rounded-lg transition-all"
                              style={{ width: poll.has_voted ? `${pct}%` : '0%' }}></div>
                            <div className="relative flex items-center justify-between">
                              <span className="font-medium">{option.text}</span>
                              {poll.has_voted && <span className="text-sm text-gray-600">{pct}% ({option.vote_count}票)</span>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <span>总投票数: {poll.total_votes || 0}</span>
                      <span>{poll.has_voted ? '已投票' : '点击选项投票'}</span>
                    </div>
                  </div>
                )
              }) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无投票</p>
                  {group?.isMember && <p className="text-sm mt-2">点击上方按钮创建投票</p>}
                </div>
              )}
            </div>
          )}

          {/* Create Poll Modal */}
          {showCreatePoll && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">创建投票</h2>
                  <button onClick={() => setShowCreatePoll(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">投票问题</label>
                    <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)}
                      placeholder="输入投票问题..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">选项</label>
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center space-x-2 mb-2">
                        <input type="text" value={opt} onChange={e => {
                          const next = [...pollOptions]; next[i] = e.target.value; setPollOptions(next)
                        }} placeholder={`选项 ${i + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        {pollOptions.length > 2 && (
                          <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"><X className="h-4 w-4" /></button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setPollOptions([...pollOptions, ''])}
                      className="flex items-center text-sm text-primary-600 hover:text-primary-700 mt-2">
                      <Plus className="h-4 w-4 mr-1" />添加选项
                    </button>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button onClick={() => setShowCreatePoll(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
                    <button onClick={handleCreatePoll} disabled={creatingPoll}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                      {creatingPoll ? '创建中...' : '创建投票'}
                    </button>
                  </div>
                </div>
              </div>
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
          {groupPolls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold mb-4">进行中的投票</h3>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">{groupPolls[0].question}</p>
                <button onClick={() => setActiveTab('polls')} className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
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
