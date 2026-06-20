import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Search, MoreHorizontal, UserPlus, Check, Loader } from 'lucide-react'
import { messagesService, notificationsService } from '../../services'
import { get } from '../../utils/http'

export default function Messages() {
  const [searchParams] = useSearchParams()
  const toUserId = searchParams.get('to')
  const [activeTab, setActiveTab] = useState('private')
  const [conversations, setConversations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [newConvId, setNewConvId] = useState(toUserId || '')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [convRes, notifRes] = await Promise.all([
          messagesService.getMessages().catch(() => { return [] }),
          notificationsService.getNotifications({ page: 1, per_page: 50 }).catch(() => { return [] }),
        ])
        setConversations(Array.isArray(convRes) ? convRes : [])
        const n = Array.isArray(notifRes) ? notifRes : notifRes?.items || []
        setNotifications(n)

        if (toUserId) {
          const existing = (Array.isArray(convRes) ? convRes : []).find(c => c.partner_id === toUserId)
          if (existing) {
            setSelectedConv(existing)
            try {
              const msgs = await messagesService.getConversation(toUserId, { page: 1, per_page: 100 })
              setMessages(Array.isArray(msgs) ? msgs : msgs.items || [])
            } catch { setMessages([]) }
          } else {
            try {
              const userInfo = await get(`/users/${toUserId}`)
              setSelectedConv({ partner_id: toUserId, partner_nickname: userInfo.nickname || toUserId.slice(0, 8) })
              setMessages([])
            } catch { setSelectedConv({ partner_id: toUserId, partner_nickname: toUserId.slice(0, 8) }); setMessages([]) }
          }
        }
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    fetchData()
  }, [toUserId])

  const openConversation = async (conv) => {
    setSelectedConv(conv)
    try {
      const msgs = await messagesService.getConversation(conv.partner_id, { page: 1, per_page: 100 })
      setMessages(Array.isArray(msgs) ? msgs : msgs.items || [])
      await messagesService.markMessagesRead(conv.partner_id)
    } catch { setMessages([]) }
  }

  const handleSend = async () => {
    if (!messageText.trim() || !selectedConv) return
    setSending(true)
    try {
      await messagesService.sendMessage({ recipient_id: selectedConv.partner_id, content: messageText })
      setMessageText('')
      const msgs = await messagesService.getConversation(selectedConv.partner_id, { page: 1, per_page: 100 })
      setMessages(Array.isArray(msgs) ? msgs : msgs.items || [])
    } catch (e) { alert('发送失败: ' + (e.message || '')) }
    finally { setSending(false) }
  }

  const handleMarkNotifRead = async (id) => {
    try {
      await notificationsService.markNotificationsRead(id)
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n))
    } catch { /* ignore */ }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center py-20"><Loader className="h-8 w-8 animate-spin text-primary-600" /></div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('private')}
            className={`flex-1 px-6 py-4 font-medium ${activeTab === 'private' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>私信</button>
          <button onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-4 font-medium ${activeTab === 'notifications' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            通知
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">{notifications.filter(n => !n.is_read).length}</span>
            )}
          </button>
        </div>

        {activeTab === 'private' && (
          <div className="flex h-[calc(100vh-200px)]">
            <div className="w-80 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" placeholder="搜索私信..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex space-x-2">
                  <input type="text" value={newConvId} onChange={e => setNewConvId(e.target.value)}
                    placeholder="输入用户ID或昵称开始新对话..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyDown={async e => {
                      if (e.key === 'Enter' && newConvId.trim()) {
                        try {
                          const userInfo = await get(`/users/${newConvId.trim()}`).catch(() => null)
                          if (userInfo) {
                            setSelectedConv({ partner_id: userInfo.user_id, partner_nickname: userInfo.nickname })
                            setMessages([])
                          } else { alert('未找到该用户') }
                        } catch { alert('未找到该用户') }
                      }
                    }} />
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {conversations.length > 0 ? conversations.map((conv) => (
                  <button key={conv.partner_id} onClick={() => openConversation(conv)}
                    className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${selectedConv?.partner_id === conv.partner_id ? 'bg-primary-50' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">👤</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{conv.partner_nickname || conv.partner_id?.slice(0, 8)}</span>
                          <span className="text-xs text-gray-500">{conv.last_time ? new Date(conv.last_time).toLocaleString() : ''}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{conv.last_message}</p>
                        {conv.unread_count > 0 && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">{conv.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </button>
                )) : (
                  <div className="p-8 text-center text-gray-500">暂无对话</div>
                )}
              </div>
            </div>

            {selectedConv ? (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                    <span className="font-medium text-gray-900">{selectedConv.partner_nickname || selectedConv.partner_id?.slice(0, 8)}</span>
                  </div>
                  <button className="p-2 text-gray-500 hover:text-gray-700"><MoreHorizontal className="h-5 w-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.message_id} className={`flex ${msg.sender_id === selectedConv.partner_id ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.sender_id !== selectedConv.partner_id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id !== selectedConv.partner_id ? 'text-primary-200' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="输入消息..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <button onClick={handleSend} disabled={sending || !messageText.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>选择一个对话开始聊天</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-4">
            <div className="divide-y divide-gray-100">
              {notifications.length > 0 ? notifications.map((notif) => (
                <div key={notif.notification_id} className={`p-4 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">🔔</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900"><span className="font-medium">{notif.type}</span></p>
                      <p className="text-sm text-gray-500 mt-1">{notif.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                    {!notif.is_read && (
                      <button onClick={() => handleMarkNotifRead(notif.notification_id)} className="text-gray-400 hover:text-gray-600">
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500">暂无通知</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}