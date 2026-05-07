import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bold, Italic, List, Link as LinkIcon, Image, Paperclip, Eye, Send, X } from 'lucide-react'

export default function CreatePost() {
  const navigate = useNavigate()
  const [postType, setPostType] = useState('normal')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [section, setSection] = useState('a-stock')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState([])
  const [attachments, setAttachments] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  
  const sections = [
    { id: 'a-stock', name: 'A股讨论' },
    { id: 'hk-stock', name: '港股讨论' },
    { id: 'us-stock', name: '美股讨论' },
    { id: 'fund', name: '基金投资' },
    { id: 'value-investing', name: '价值投资专区' },
    { id: 'quantitative', name: '量化投资专区' }
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages([...images, { id: Date.now(), url: reader.result, name: file.name }])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId))
  }

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      setAttachments([...attachments, { id: Date.now(), name: file.name, size: file.size }])
    })
  }

  const handleSubmit = () => {
    console.log('Submitting post:', { postType, title, content, section, tags })
    navigate('/')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-4">发布新帖</h1>
          <div className="flex space-x-2">
            {['normal', 'long', 'poll', 'realtime'].map((type) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  postType === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'normal' ? '普通帖子' : type === 'long' ? '长文分析' : type === 'poll' ? '投票调研' : '实时讨论'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择板块</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入帖子标题"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
            <div className="border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-1 p-2 border-b border-gray-300 bg-gray-50">
                <button onClick={() => setContent(content + '**')} className="p-2 hover:bg-gray-200 rounded"><Bold className="h-4 w-4" /></button>
                <button onClick={() => setContent(content + '*')} className="p-2 hover:bg-gray-200 rounded"><Italic className="h-4 w-4" /></button>
                <button onClick={() => setContent(content + '- ')} className="p-2 hover:bg-gray-200 rounded"><List className="h-4 w-4" /></button>
                <button onClick={() => setContent(content + '[text](url)')} className="p-2 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4" /></button>
              </div>
              <textarea
                id="content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="支持Markdown格式，输入内容..."
                rows={10}
                className="w-full px-3 py-2 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="添加标签，按回车确认"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button onClick={handleAddTag} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">添加</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  #{tag}
                  <button onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-primary-900"><X className="h-4 w-4" /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图片</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="flex flex-col items-center cursor-pointer">
                <Image className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">点击上传图片</span>
              </label>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {images.map((img) => (
                  <div key={img.id} className="relative">
                    <img src={img.url} alt={img.name} className="w-full h-24 object-cover rounded" />
                    <button onClick={() => handleRemoveImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button onClick={() => navigate('/')} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
            <button onClick={() => setShowPreview(!showPreview)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Eye className="h-4 w-4 mr-2" />预览
            </button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
              <Send className="h-4 w-4 mr-2" />发布
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
