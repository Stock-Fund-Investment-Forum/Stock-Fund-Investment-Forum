import { useState, useEffect } from 'react'
import { LayoutDashboard, Award, ClipboardList, CheckCircle, XCircle, Loader, Users, FileText, AlertTriangle, Ban, Activity, MessageSquare } from 'lucide-react'
import { get, post } from '../../utils/http'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [certs, setCerts] = useState([])
  const [assessments, setAssessments] = useState([])
  const [violations, setViolations] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [statsRes, certsRes, assessRes, violRes, usersRes, logsRes] = await Promise.all([
        get('/admin/stats').catch(() => null),
        get('/admin/certifications').catch(() => []),
        get('/admin/risk-assessments').catch(() => []),
        get('/admin/violations').catch(() => []),
        get('/admin/users').catch(() => []),
        get('/admin/audit-logs').catch(() => []),
      ])
      setStats(statsRes)
      setCerts(Array.isArray(certsRes) ? certsRes : [])
      setAssessments(Array.isArray(assessRes) ? assessRes : [])
      setViolations(Array.isArray(violRes) ? violRes : [])
      setAdminUsers(Array.isArray(usersRes) ? usersRes : [])
      setAuditLogs(Array.isArray(logsRes) ? logsRes : [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const searchUsers = async () => {
    try {
      const res = await get(`/admin/users?q=${encodeURIComponent(userSearch)}`)
      setAdminUsers(Array.isArray(res) ? res : [])
    } catch { /* ignore */ }
  }

  const handleReview = async (path, id, action) => {
    try { await post(`${path}/${id}/review?action=${action}`); fetchAll() }
    catch (e) { alert('操作失败: ' + (e.message || '')) }
  }

  const handleUserStatus = async (userId, status) => {
    if (!confirm(`确定将该用户状态改为 ${status}？`)) return
    try { await post(`/admin/users/${userId}/status?status=${status}`); fetchAll() }
    catch (e) { alert('操作失败: ' + (e.message || '')) }
  }

  useEffect(() => { fetchAll() }, [])

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center py-20"><Loader className="h-8 w-8 animate-spin text-primary-600" /></div>

  const tabs = [
    { id: 'overview', label: '概览', icon: LayoutDashboard },
    { id: 'certs', label: `认证(${certs.filter(c => c.status === 'PENDING').length})`, icon: Award },
    { id: 'assessments', label: `评估(${assessments.filter(a => a.status === 'PENDING').length})`, icon: ClipboardList },
    { id: 'violations', label: `违规(${violations.filter(v => v.status === 'PENDING').length})`, icon: AlertTriangle },
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'audit', label: '审计日志', icon: Activity },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium min-w-[80px] ${activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            <tab.icon className="h-4 w-4 inline mr-1" />{tab.label}
          </button>
        ))}
      </div>

      {/* 概览 */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '总用户', value: stats.total_users, icon: Users, color: 'blue' },
            { label: '总帖子', value: stats.total_posts, icon: FileText, color: 'green' },
            { label: '总评论', value: stats.total_comments, icon: MessageSquare, color: 'purple' },
            { label: '待处理违规', value: stats.pending_violations, icon: AlertTriangle, color: 'red' },
            { label: '今日新增帖', value: stats.today_posts, icon: FileText, color: 'indigo' },
            { label: '今日注册', value: stats.today_users, icon: Users, color: 'teal' },
            { label: '已封禁', value: stats.banned_users, icon: Ban, color: 'gray' },
            { label: '已认证', value: stats.certified_users, icon: Award, color: 'yellow' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <s.icon className={`h-6 w-6 text-${s.color}-500 mb-2`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 认证审核 */}
      {activeTab === 'certs' && renderList(certs, 'cert_id', 'cert_type', '/admin/certifications', 'cert_type', handleReview)}

      {/* 风险评估 */}
      {activeTab === 'assessments' && renderList(assessments, 'assessment_id', 'risk_level', '/admin/risk-assessments', 'score', handleReview)}

      {/* 违规管理 */}
      {activeTab === 'violations' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b font-semibold">违规举报 ({violations.length})</div>
          {violations.length > 0 ? violations.map(v => (
            <div key={v.violation_id} className="p-4 border-t flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">{v.target_type}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    v.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    v.status === 'REJECTED' ? 'bg-gray-100 text-gray-600' :
                    v.status === 'FLAGGED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{v.status}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{v.reason}</p>
                <p className="text-xs text-gray-400 mt-1">目标: {v.target_id?.slice(0, 12)} | 举报人: {v.reporter_id?.slice(0, 8) || '系统'}</p>
              </div>
              {v.status === 'PENDING' && (
                <div className="flex space-x-2 ml-4">
                  <button onClick={() => handleReview('/admin/violations', v.violation_id, 'APPROVED')} className="px-3 py-1 bg-green-600 text-white rounded text-sm"><CheckCircle className="h-4 w-4 mr-1 inline" />通过</button>
                  <button onClick={() => handleReview('/admin/violations', v.violation_id, 'REJECTED')} className="px-3 py-1 bg-red-600 text-white rounded text-sm"><XCircle className="h-4 w-4 mr-1 inline" />驳回</button>
                </div>
              )}
              {v.status === 'FLAGGED' && (
                <div className="flex space-x-2 ml-4">
                  <button onClick={() => handleReview('/admin/violations', v.violation_id, 'APPROVED')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">确认违规</button>
                  <button onClick={() => handleReview('/admin/violations', v.violation_id, 'REJECTED')} className="px-3 py-1 bg-gray-600 text-white rounded text-sm">误报</button>
                </div>
              )}
            </div>
          )) : <div className="p-8 text-center text-gray-500">无违规记录</div>}
        </div>
      )}

      {/* 用户管理 */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b flex items-center space-x-4">
            <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchUsers()}
              placeholder="搜索用户 (昵称/邮箱)..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <button onClick={searchUsers} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">搜索</button>
          </div>
          {adminUsers.length > 0 ? adminUsers.map(u => (
            <div key={u.user_id} className="p-4 border-t flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{u.nickname}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    u.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' :
                    u.status === 'BANNED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.status}</span>
                  {u.auth_level === 'EXPERT' && <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">V</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">{u.email || u.phone || '无联系方式'} | Lv.{u.level} | {u.points}分</p>
              </div>
              <div className="flex space-x-2">
                {u.status !== 'BANNED' && <button onClick={() => handleUserStatus(u.user_id, 'BANNED')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">封号</button>}
                {u.status !== 'SUSPENDED' && <button onClick={() => handleUserStatus(u.user_id, 'SUSPENDED')} className="px-3 py-1 bg-yellow-600 text-white rounded text-sm">禁言</button>}
                {u.status !== 'ACTIVE' && <button onClick={() => handleUserStatus(u.user_id, 'ACTIVE')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">解封</button>}
              </div>
            </div>
          )) : <div className="p-8 text-center text-gray-500">无用户数据</div>}
        </div>
      )}

      {/* 审计日志 */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b font-semibold">审计日志 ({auditLogs.length})</div>
          {auditLogs.length > 0 ? auditLogs.map(log => (
            <div key={log.audit_id} className="p-3 border-t text-sm">
              <span className="text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
              <span className="ml-2 font-medium">{log.action}</span>
              <span className="ml-2 text-gray-500">| {log.target_type}:{log.target_id?.slice(0, 12)}</span>
              {log.details && <span className="ml-2 text-gray-400">- {log.details}</span>}
            </div>
          )) : <div className="p-8 text-center text-gray-500">无审计日志</div>}
        </div>
      )}
    </div>
  )
}

function renderList(items, idField, titleField, basePath, descField, onReview) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b font-semibold">{items.length} 条记录</div>
      {items.length > 0 ? items.map(item => (
        <div key={item[idField]} className="p-4 border-t flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{item[titleField] || item[descField] || '未命名'}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                item.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                item.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{item.status}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">用户: {item.user_id?.slice(0, 8)} {item.score ? `| 得分: ${item.score}` : ''} {item.risk_level ? `| 等级: ${item.risk_level}` : ''}</p>
          </div>
          {item.status === 'PENDING' && (
            <div className="flex space-x-2 ml-4">
              <button onClick={() => onReview(basePath, item[idField], 'APPROVED')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">通过</button>
              <button onClick={() => onReview(basePath, item[idField], 'REJECTED')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">驳回</button>
            </div>
          )}
        </div>
      )) : <div className="p-8 text-center text-gray-500">暂无数据</div>}
    </div>
  )
}