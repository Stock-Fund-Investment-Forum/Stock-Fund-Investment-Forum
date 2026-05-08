import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Bell, Shield, Globe, ChevronRight, Camera, Check } from 'lucide-react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    nickname: '价值猎人',
    bio: '专注价值投资，相信复利的力量。分享投资心得，与志同道合者交流。',
    location: '上海',
    website: 'https://example.com',
    email: 'user@example.com',
    phone: '138****8888'
  });
  const [investmentPreferences, setInvestmentPreferences] = useState({
    markets: ['A股', '港股'],
    style: '进取型',
    industries: ['科技', '消费']
  });
  const [notificationSettings, setNotificationSettings] = useState({
    newFollower: true,
    commentNotification: true,
    likeNotification: true,
    mentionNotification: true,
    messageNotification: true,
    systemNotification: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    bioVisible: 'everyone',
    followingVisible: 'everyone',
    favoritesVisible: 'everyone',
    allowMention: true
  });

  const sections = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'security', label: '账号安全', icon: Lock },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'privacy', label: '隐私设置', icon: Shield },
    { id: 'preferences', label: '投资偏好', icon: Globe }
  ];

  const handleSaveProfile = () => {
    console.warn('Saving profile:', formData);
    alert('资料保存成功');
  };

  const handleSavePreferences = () => {
    console.warn('Saving preferences:', investmentPreferences);
    alert('偏好保存成功');
  };

  const handleSavePrivacy = () => {
    console.warn('Saving privacy:', privacySettings);
    alert('隐私设置保存成功');
  };

  const handleSaveNotifications = () => {
    console.warn('Saving notifications:', notificationSettings);
    alert('通知设置保存成功');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <section.icon className="h-5 w-5" />
                  <span>{section.label}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">个人资料</h2>

              {/* Avatar */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-5xl relative">
                  👤
                  <button className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">头像</h3>
                  <p className="text-sm text-gray-500 mt-1">支持 JPG、PNG 格式，建议尺寸 200x200</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="介绍一下自己..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">所在地</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">个人网站</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button onClick={handleSaveProfile} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    保存修改
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">账号安全</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">修改密码</h3>
                    <p className="text-sm text-gray-500 mt-1">定期修改密码以保护账号安全</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    修改
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">实名认证</h3>
                    <p className="text-sm text-gray-500 mt-1">完成实名认证以解锁更多功能</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">已认证</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">专业认证</h3>
                    <p className="text-sm text-gray-500 mt-1">申请专业投资者认证，获得加V标识</p>
                  </div>
                  <Link to="/settings/professional" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    申请认证
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">风险评估</h3>
                    <p className="text-sm text-gray-500 mt-1">完成投资者适当性评估</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">进取型</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">绑定手机</h3>
                    <p className="text-sm text-gray-500 mt-1">{formData.phone}</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    更换
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">绑定邮箱</h3>
                    <p className="text-sm text-gray-500 mt-1">{formData.email}</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    更换
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">通知设置</h2>

              <div className="space-y-4">
                {[
                  { key: 'newFollower', label: '新粉丝通知', desc: '当有新用户关注你时通知' },
                  { key: 'commentNotification', label: '评论通知', desc: '当有人评论你的帖子时通知' },
                  { key: 'likeNotification', label: '点赞通知', desc: '当有人点赞你的内容时通知' },
                  { key: 'mentionNotification', label: '@提及通知', desc: '当有人@你时通知' },
                  { key: 'messageNotification', label: '私信通知', desc: '当收到新私信时通知' },
                  { key: 'systemNotification', label: '系统通知', desc: '接收系统公告和活动通知' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[item.key]}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          [item.key]: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div
                        className="relative w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300"
                        style={{
                          backgroundColor: notificationSettings[item.key] ? '#0284c7' : '#d1d5db'
                        }}
                      >
                        <span
                          className="absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-all"
                          style={{
                            transform: notificationSettings[item.key] ? 'translateX(20px)' : 'translateX(0)'
                          }}
                        ></span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button onClick={handleSaveNotifications} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  保存设置
                </button>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">隐私设置</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">个人简介可见范围</label>
                  <select
                    value={privacySettings.bioVisible}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, bioVisible: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="everyone">所有人</option>
                    <option value="followers">仅粉丝</option>
                    <option value="self">仅自己</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">关注列表可见范围</label>
                  <select
                    value={privacySettings.followingVisible}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, followingVisible: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="everyone">所有人</option>
                    <option value="followers">仅粉丝</option>
                    <option value="self">仅自己</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">收藏夹可见范围</label>
                  <select
                    value={privacySettings.favoritesVisible}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, favoritesVisible: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="everyone">所有人</option>
                    <option value="followers">仅粉丝</option>
                    <option value="self">仅自己</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">允许他人@我</h3>
                    <p className="text-sm text-gray-500 mt-1">关闭后其他用户无法在帖子中@你</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.allowMention}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, allowMention: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300"
                      style={{
                        backgroundColor: privacySettings.allowMention ? '#0284c7' : '#d1d5db'
                      }}
                    >
                      <span
                        className="absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-all"
                        style={{
                          transform: privacySettings.allowMention ? 'translateX(20px)' : 'translateX(0)'
                        }}
                      ></span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button onClick={handleSavePrivacy} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    保存设置
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Investment Preferences */}
          {activeSection === 'preferences' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">投资偏好</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">关注市场</label>
                  <div className="flex flex-wrap gap-2">
                    {['A股', '港股', '美股', '基金', '期货'].map((market) => (
                      <button
                        key={market}
                        onClick={() => {
                          if (investmentPreferences.markets.includes(market)) {
                            setInvestmentPreferences({
                              ...investmentPreferences,
                              markets: investmentPreferences.markets.filter(m => m !== market)
                            });
                          } else {
                            setInvestmentPreferences({
                              ...investmentPreferences,
                              markets: [...investmentPreferences.markets, market]
                            });
                          }
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                          investmentPreferences.markets.includes(market)
                            ? 'bg-primary-50 border-primary-600 text-primary-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {investmentPreferences.markets.includes(market) && (
                          <Check size={16} />
                        )}
                        {market}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">风险偏好</label>
                  <div className="flex flex-wrap gap-2">
                    {['保守型', '稳健型', '进取型'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setInvestmentPreferences({ ...investmentPreferences, style })}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                          investmentPreferences.style === style
                            ? 'bg-primary-50 border-primary-600 text-primary-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {investmentPreferences.style === style && (
                          <Check size={16} />
                        )}
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">关注行业</label>
                  <div className="flex flex-wrap gap-2">
                    {['科技', '消费', '金融', '医疗', '新能源', '半导体', '地产'].map((industry) => (
                      <button
                        key={industry}
                        onClick={() => {
                          if (investmentPreferences.industries.includes(industry)) {
                            setInvestmentPreferences({
                              ...investmentPreferences,
                              industries: investmentPreferences.industries.filter(i => i !== industry)
                            });
                          } else {
                            setInvestmentPreferences({
                              ...investmentPreferences,
                              industries: [...investmentPreferences.industries, industry]
                            });
                          }
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                          investmentPreferences.industries.includes(industry)
                            ? 'bg-primary-50 border-primary-600 text-primary-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {investmentPreferences.industries.includes(industry) && (
                          <Check size={16} />
                        )}
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    设置投资偏好后，系统将根据您的偏好推荐相关内容，帮助您发现更有价值的讨论。
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button onClick={handleSavePreferences} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    保存偏好
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
