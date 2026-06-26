import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Save, ArrowLeft, Loader } from 'lucide-react'
import { groupsService } from '../../services'

export default function GroupSettings() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [accessLevel, setAccessLevel] = useState('PUBLIC')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await groupsService.getGroup(groupId)
        if (!data.is_owner && !data.is_admin) {
          alert('仅群主或管理员可管理群组')
          navigate(`/groups/${groupId}`)
          return
        }
        setName(data.name)
        setDescription(data.description || '')
        setAccessLevel(data.access_level || 'PUBLIC')
      } catch (e) {
        setError(e.message || '获取群组信息失败')
      } finally { setLoading(false) }
    }
    fetch()
  }, [groupId, navigate])

  const handleSave = async () => {
    if (!name.trim()) { alert('群组名称不能为空'); return }
    setSaving(true)
    try {
      alert('群组信息更新成功（后端接口待完善）')
    } catch (e) { alert('保存失败: ' + (e.message || '')) }
    finally { setSaving(false) }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center py-20"><Loader className="h-8 w-8 animate-spin text-primary-600" /></div>
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => navigate(`/groups/${groupId}`)} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg">返回</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => navigate(`/groups/${groupId}`)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">群组设置</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">群组名称</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" maxLength={50} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">群组描述</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" maxLength={500} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">访问权限</label>
            <select value={accessLevel} onChange={e => setAccessLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="PUBLIC">公开 - 任何人可加入</option>
              <option value="NEED_APPROVAL">审核制 - 需要管理员审核</option>
              <option value="PRIVATE">私密 - 仅邀请可加入</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              <Save className="h-5 w-5 mr-2" />
              {saving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}