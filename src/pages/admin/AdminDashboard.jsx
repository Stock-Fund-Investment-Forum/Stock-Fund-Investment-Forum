import { useState, useEffect } from 'react'
import { LayoutDashboard, MessageSquare, Users, Shield, AlertTriangle, CheckCircle, XCircle, Eye, Ban, TrendingUp, Award, Loader } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    pendingPosts: 0,
    pendingReports: 0,
    totalUsers: 0,
    activeUsers: 0,
    todayPosts: 0,
    todayReports: 0
  })
  const [pendingPosts, setPendingPosts] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // TODO: 当后端提供管理员API时，集成以下端点：
  // - GET /admin/posts/pending - 获取待审核帖子
  // - GET /admin/reports - 获取举报信息
  // - GET /admin/stats - 获取统计数据
  // - POST /admin/posts/{postId}/approve - 批准帖子
  // - POST /admin/posts/{postId}/reject - 拒绝帖子
  // - POST /admin/reports/{reportId}/resolve - 解决举报

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 临时使用模拟数据，等待后端管理员API实现
        // const [statsRes, postsRes, reportsRes] = await Promise.all([
        //   adminService.getStats(),
        //   adminService.getPendingPosts(),
        //   adminService.getReports()
        // ])

        // 模拟数据 - 仅用于UI演示
        setStats({
          pendingPosts: 8,
          pendingReports: 3,
          totalUsers: 12500,
          activeUsers: 8900,
          todayPosts: 234,
          todayReports: 12
        })
        setPendingPosts([])
        setReports([])
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const handleApprovePost = async (postId) => {
    try {
      console.log('Approving post:', postId)
      // TODO: await adminService.approvePost(postId)
      // TODO: 重新加载列表
    } catch (err) {
      console.error('Failed to approve post:', err)
    }
  }

  const handleRejectPost = async (postId) => {
    try {
      console.log('Rejecting post:', postId)
      // TODO: await adminService.rejectPost(postId)
      // TODO: 重新加载列表
    } catch (err) {
      console.error('Failed to reject post:', err)
    }
  }

  const handleResolveReport = async (reportId, action) => {
    try {
      console.log('Resolving report:', reportId, action)
      // TODO: await adminService.resolveReport(reportId, action)
      // TODO: 重新加载列表
    } catch (err) {
      console.error('Failed to resolve report:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">加载失败: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待审核内容</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingPosts}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待处理举报</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingReports}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总用户数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">今日活跃</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: '概览', icon: LayoutDashboard },
              { id: 'content', label: '内容审核', icon: MessageSquare },
              { id: 'reports', label: '举报处理', icon: AlertTriangle },
              { id: 'users', label: '用户管理', icon: Users },
              { id: 'settings', label: '系统设置', icon: Shield }
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">待处理任务</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium">{stats.pendingPosts} 条内容待审核</span>
                  </div>
                  <button onClick={() => setActiveTab('content')} className="text-sm text-primary-600 hover:text-primary-700">
                    处理
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium">{stats.pendingReports} 条举报待处理</span>
                  </div>
                  <button onClick={() => setActiveTab('reports')} className="text-sm text-primary-600 hover:text-primary-700">
                    处理
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">最近活动</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-gray-900">审核通过帖子《新能源行业分析》</p>
                    <p className="text-gray-500 text-xs mt-1">5分钟前</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-gray-900">拒绝用户举报</p>
                    <p className="text-gray-500 text-xs mt-1">15分钟前</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <Ban className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-gray-900">禁言用户X（高频发帖）</p>
                    <p className="text-gray-500 text-xs mt-1">30分钟前</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">内容审核队列</h2>
              <p className="text-sm text-gray-500 mt-1">自动审核系统标记的可疑内容需要人工审核</p>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingPosts.map((post) => (
                <div key={post.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          {post.reason}
                        </span>
                        <span className="text-xs text-gray-500">{post.time}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                      <p className="text-xs text-gray-500">发布者: {post.author}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleApprovePost(post.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        通过
                      </button>
                      <button
                        onClick={() => handleRejectPost(post.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        拒绝
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">举报处理队列</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {reports.map((report) => (
                <div key={report.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {report.type === 'spam' ? '垃圾信息' : report.type === 'inappropriate' ? '不当言论' : '违规行为'}
                        </span>
                        <span className="text-xs text-gray-500">{report.time}</span>
                      </div>
                      <p className="text-sm text-gray-900 mb-1">
                        <span className="font-medium">{report.reporter}</span> 举报了 <span className="font-medium">{report.reportedUser}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">原因: {report.reason}</p>
                      <p className="text-sm text-gray-600">内容: {report.content}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleResolveReport(report.id, 'confirm')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        确认违规
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, 'dismiss')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        驳回
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Suspicious Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">异常用户监控</h2>
                <p className="text-sm text-gray-500 mt-1">系统检测到的异常行为用户</p>
              </div>
              <div className="divide-y divide-gray-100">
                {suspiciousUsers.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            {user.issue}
                          </span>
                          <span className="text-xs text-gray-500">质量评分: {user.qualityScore}/10</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{user.name}</h3>
                        <p className="text-sm text-gray-600">
                          {user.posts} 帖子 / {user.timeRange}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </button>
                        <button className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center">
                          <Ban className="h-4 w-4 mr-1" />
                          限制
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">用户管理</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="搜索用户..."
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                    <option>全部状态</option>
                    <option>正常</option>
                    <option>禁言</option>
                    <option>封禁</option>
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { id: 1, name: '价值猎人', level: 'Lv.5', posts: 128, followers: 1234, status: 'normal', isVerified: true, isProfessional: true },
                  { id: 2, name: '技术派', level: 'Lv.3', posts: 56, followers: 234, status: 'normal', isVerified: false, isProfessional: false },
                  { id: 3, name: '趋势跟踪', level: 'Lv.4', posts: 89, followers: 567, status: 'muted', isVerified: true, isProfessional: false },
                  { id: 4, name: '量化达人', level: 'Lv.4', posts: 67, followers: 445, status: 'normal', isVerified: false, isProfessional: true },
                  { id: 5, name: '基金达人', level: 'Lv.3', posts: 45, followers: 189, status: 'banned', isVerified: false, isProfessional: false }
                ].map((user) => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{user.name}</span>
                            {user.isVerified && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                <Shield className="h-3 w-3 mr-0.5" />
                                实名
                              </span>
                            )}
                            {user.isProfessional && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Award className="h-3 w-3 mr-0.5" />
                                加V
                              </span>
                            )}
                            {user.status === 'muted' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                禁言
                              </span>
                            )}
                            {user.status === 'banned' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                封禁
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                            <span>{user.level}</span>
                            <span>{user.posts} 帖子</span>
                            <span>{user.followers} 粉丝</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                          查看
                        </button>
                        {user.status === 'normal' && (
                          <>
                            <button className="px-3 py-1 border border-orange-300 text-orange-600 rounded text-sm hover:bg-orange-50">
                              禁言
                            </button>
                            <button className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50">
                              封禁
                            </button>
                          </>
                        )}
                        {user.status === 'muted' && (
                          <button className="px-3 py-1 border border-green-300 text-green-600 rounded text-sm hover:bg-green-50">
                            解禁
                          </button>
                        )}
                        {user.status === 'banned' && (
                          <button className="px-3 py-1 border border-green-300 text-green-600 rounded text-sm hover:bg-green-50">
                            解封
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">显示 1-5 共 12,500 条</div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
                    上一页
                  </button>
                  <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm">1</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">3</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">下一页</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">系统设置</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">自动审核设置</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-700">敏感词过滤</span>
                    <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-700">重复内容检测</span>
                    <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-700">荐股关键词检测</span>
                    <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">用户行为监控</h3>
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <label className="block text-sm text-gray-700 mb-2">高频发帖阈值 (帖子/小时)</label>
                    <input type="number" defaultValue={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <label className="block text-sm text-gray-700 mb-2">内容质量评分阈值</label>
                    <input type="number" defaultValue={3} step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  保存设置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
