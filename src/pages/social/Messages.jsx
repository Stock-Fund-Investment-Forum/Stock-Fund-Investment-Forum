import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Search, MoreHorizontal, UserPlus, Bell, Check } from 'lucide-react'

export default function Messages() {
  const [activeTab, setActiveTab] = useState('private') // 'private', 'notifications'
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageText, setMessageText] = useState('')

  const conversations = [
    {
      id: 1,
      user: { name: '技术派', avatar: '👤', level: 'Lv.3', isOnline: true },
      lastMessage: '同意，估值修复需要时间，建议分批建仓',
      time: '10分钟前',
      unread: 2
    },
    {
      id: 2,
      user: { name: '量化达人', avatar: '👤', level: 'Lv.4', isOnline: false },
      lastMessage: '回测结果已经发到你邮箱了',
      time: '1小时前',
      unread: 0
    },
    {
      id: 3,
      user: { name: '基金达人', avatar: '👤', level: 'Lv.3', isOnline: true },
      lastMessage: '这个基金的持仓结构很有意思',
      time: '昨天',
      unread: 0
    }
  ]

  const notifications = [
    {
      id: 1,
      type: 'like',
      user: { name: '趋势跟踪', avatar: '👤' },
      content: '赞了你的帖子《贵州茅台2024年报深度解读》',
      time: '5分钟前',
      isRead: false
    },
    {
      id: 2,
      type: 'comment',
      user: { name: '技术派', avatar: '👤' },
      content: '评论了你的帖子《贵州茅台2024年报深度解读》',
      time: '10分钟前',
      isRead: false
    },
    {
      id: 3,
      type: 'follow',
      user: { name: '价值投资者', avatar: '👤' },
      content: '关注了你',
      time: '30分钟前',
      isRead: true
    },
    {
      id: 4,
      type: 'mention',
      user: { name: '量化达人', avatar: '👤' },
      content: '在评论中@了你',
      time: '1小时前',
      isRead: true
    },
    {
      id: 5,
      type: 'system',
      user: { name: '系统通知', avatar: '🔔' },
      content: '您的帖子《新能源板块轮动策略分享》被设为精华',
      time: '2小时前',
      isRead: true
    }
  ]

  const messages = selectedConversation ? [
    { id: 1, from: 'other', content: '你好，看了你的茅台分析，觉得很有道理', time: '14:30' },
    { id: 2, from: 'me', content: '谢谢！我也是长期跟踪茅台', time: '14:32' },
    { id: 3, from: 'other', content: '你觉得现在这个价位适合入场吗？', time: '14:35' },
    { id: 4, from: 'me', content: '我个人觉得可以分批建仓，不要一次性买入', time: '14:38' },
    { id: 5, from: 'other', content: '同意，估值修复需要时间，建议分批建仓', time: '14:40' }
  ] : []

  const handleSendMessage = () => {
    if (!messageText.trim()) return
    console.log('Sending message:', messageText)
    setMessageText('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('private')}
            className={`flex-1 px-6 py-4 font-medium ${
              activeTab === 'private'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            私信
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-4 font-medium ${
              activeTab === 'notifications'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            通知
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'private' && (
          <div className="flex h-[calc(100vh-200px)]">
            {/* Conversation List */}
            <div className="w-80 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索私信..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                          {conv.user.avatar}
                        </div>
                        {conv.user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{conv.user.name}</span>
                          <span className="text-xs text-gray-500">{conv.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                      {selectedConversation.user.avatar}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{selectedConversation.user.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{selectedConversation.user.level}</span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          msg.from === 'me'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.from === 'me' ? 'text-primary-200' : 'text-gray-500'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
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
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                      {notif.user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900">
                        <span className="font-medium">{notif.user.name}</span>
                        {notif.type === 'like' && ' 赞了你的帖子'}
                        {notif.type === 'comment' && ' 评论了你的帖子'}
                        {notif.type === 'follow' && ' 关注了你'}
                        {notif.type === 'mention' && ' 在评论中@了你'}
                        {notif.type === 'system' && ' 发送了系统通知'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{notif.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                    {!notif.isRead && (
                      <button className="text-gray-400 hover:text-gray-600">
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
