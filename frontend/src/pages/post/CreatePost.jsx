import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bold, Italic, List, Link as LinkIcon, Eye, Send, X, Plus, Trash2, FileText, BarChart3 } from 'lucide-react'
import { postsService } from '../../services'
import { post as httpPost } from '../../utils/http'
import { API_ENDPOINTS } from '../../constants/api'
import { useAuth } from '../../context/AuthContext'

export default function CreatePost() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [postType, setPostType] = useState('normal')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [section, setSection] = useState('a-stock')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const [pollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])

  const postTypeMap = {
    normal: 'DISCUSSION',
    long: 'ANALYSIS',
    poll: 'QUESTION',
    realtime: 'NEWS',
  }

  const sections = [
    { id: 'a-stock', name: 'A股讨论' },
    { id: 'hk-stock', name: '港股讨论' },
    { id: 'us-stock', name: '美股讨论' },
    { id: 'fund', name: '基金投资' },
    { id: 'value-investing', name: '价值投资专区' },
    { id: 'quantitative', name: '量化投资专区' },
    { id: 'qa', name: '问答求助' },
    { id: 'macro', name: '宏观策略' },
  ]

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!user) {
      alert('请先登录后再发帖')
      navigate('/login', { state: { from: '/create' } })
      return
    }

    if (postType === 'realtime' && !content.trim()) {
      alert('实时讨论请输入内容')
      return
    }
    if (postType !== 'realtime' && !title.trim()) {
      alert('请输入帖子标题')
      return
    }

    try {
      const payload = {
        board_id: section,
        title: postType === 'realtime' ? `实时讨论 ${new Date().toLocaleString()}` : title.trim(),
        content: content,
        tags,
        post_type: postTypeMap[postType] || 'DISCUSSION',
      }

      const created = await postsService.createPost(payload)

      if (postType === 'poll' && created?.post_id) {
        const validOptions = pollOptions.filter(o => o.trim())
        if (pollQuestion.trim() && validOptions.length >= 2) {
          await httpPost(API_ENDPOINTS.CREATE_POLL, {
            post_id: created.post_id,
            question: pollQuestion.trim(),
            options: validOptions.map(text => ({ text })),
          }).catch(() => {})
        }
      }

      if (created && created.post_id) {
        navigate(`/post/${created.post_id}`)
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error('发布帖子错误:', err)
      console.error('错误类型:', err?.name)
      console.error('错误消息:', err?.message)
      console.error('错误状态码:', err?.status)
      
      if (err.status === 401) {
        alert('登录状态已失效，请重新登录')
        navigate('/login', { state: { from: '/create' } })
        return
      }
      
      // 处理网络错误
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        alert('网络连接失败，请检查后端服务是否正常运行')
        return
      }
      
      alert(err?.message || err?.detail || '发布失败')
    }
  }

  const insertMarkdown = (prefix, suffix = '') => {
    setContent(prev => prev + prefix + suffix)
  }

  const renderPreview = () => {
    if (!content) return <p className="text-gray-400">暂无内容</p>
    const html = content
      .replace(/### (.+)/g, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/## (.+)/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/# (.+)/g, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2" />')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary-600 underline">$1</a>')
      .replace(/^- (.+)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br />')
    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-4">发布新帖</h1>
          <div className="flex space-x-2">
            {[
              { type: 'normal', label: '普通帖子', icon: FileText },
              { type: 'long', label: '长文分析', icon: Bold },
              { type: 'poll', label: '投票调研', icon: BarChart3 },
              { type: 'realtime', label: '实时讨论', icon: Eye },
            ].map(({ type, label, icon: Icon }) => (
              <button key={type} onClick={() => setPostType(type)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                  postType === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                <Icon className="h-4 w-4 mr-1" />{label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择板块</label>
            <select value={section} onChange={e => setSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {postType !== 'realtime' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder={postType === 'poll' ? '输入投票问题...' : '请输入帖子标题'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          )}

          {postType === 'realtime' && (
            <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-700">
              实时讨论：盘中简短交流，无需标题，内容将显示在对应板块的实时讨论区。
            </div>
          )}

          {postType === 'poll' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">投票选项</label>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2 mb-2">
                    <input type="text" value={opt} onChange={e => {
                      const next = [...pollOptions]; next[i] = e.target.value; setPollOptions(next)
                    }} placeholder={`选项 ${i + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    {pollOptions.length > 2 && (
                      <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPollOptions([...pollOptions, ''])}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700 mt-2">
                  <Plus className="h-4 w-4 mr-1" />添加选项
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {postType === 'realtime' ? '内容' : postType === 'long' ? '正文（支持 Markdown）' : '内容'}
            </label>
            <div className="border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-1 p-2 border-b border-gray-300 bg-gray-50">
                <button onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-gray-200 rounded" title="粗体"><Bold className="h-4 w-4" /></button>
                <button onClick={() => insertMarkdown('*', '*')} className="p-2 hover:bg-gray-200 rounded" title="斜体"><Italic className="h-4 w-4" /></button>
                <button onClick={() => insertMarkdown('\n- ')} className="p-2 hover:bg-gray-200 rounded" title="列表"><List className="h-4 w-4" /></button>
                <button onClick={() => insertMarkdown('[', '](url)')} className="p-2 hover:bg-gray-200 rounded" title="链接"><LinkIcon className="h-4 w-4" /></button>
                <button onClick={() => insertMarkdown('\n## ')} className="p-2 hover:bg-gray-200 rounded font-bold" title="标题">H</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setShowPreview(!showPreview)}
                  className={`p-2 rounded ${showPreview ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-200'}`}
                  title="预览"><Eye className="h-4 w-4" /></button>
              </div>
              {showPreview ? (
                <div className="p-4 min-h-[200px] prose max-w-none">{renderPreview()}</div>
              ) : (
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder={postType === 'realtime' ? '输入实时讨论内容...' : '支持 Markdown 格式，输入内容...'}
                  rows={postType === 'realtime' ? 3 : postType === 'long' ? 16 : 10}
                  className="w-full px-3 py-2 focus:outline-none resize-none" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <div className="flex space-x-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="添加标签，按回车确认"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <button onClick={handleAddTag} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">添加</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  #{tag}
                  <button onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-primary-900"><X className="h-4 w-4" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button onClick={() => navigate('/')} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
              <Send className="h-4 w-4 mr-2" />发布
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
