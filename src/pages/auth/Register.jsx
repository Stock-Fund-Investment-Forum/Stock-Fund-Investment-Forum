import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, Lock, Mail, ArrowRight, Shield, ArrowLeft } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const scrollY = location.state?.scrollY || 0

  const handleBack = () => {
    navigate(from)
    setTimeout(() => {
      window.scrollTo(0, scrollY)
    }, 0)
  }

  const handleSendCode = () => {
    if (!formData.phone) {
      alert('请先输入手机号')
      return
    }
    // TODO: Implement send verification code logic (UC-REG-001)
    setCodeSent(true)
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.agreeTerms) {
      alert('请先同意用户协议和隐私政策')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }

    if (formData.password.length < 8 || formData.password.length > 20) {
      alert('密码长度应为8-20位')
      return
    }

    // TODO: Implement registration logic (UC-REG-001)
    console.log('Registration submitted:', formData)
    navigate(from)
    setTimeout(() => {
      window.scrollTo(0, scrollY)
    }, 0)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <button onClick={handleBack} className="absolute top-8 left-8 p-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-6 w-6" />
      </button>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建新账号
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            加入投资论坛，开启投资智慧之旅
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                手机号
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入手机号"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                验证码
              </label>
              <div className="mt-1 flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请输入验证码"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                设置密码
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={20}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="8-20位，包含数字和字母"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">密码需包含数字和字母</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  maxLength={20}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
              我已阅读并同意{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                《用户协议》
              </Link>
              {' '}和{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                《隐私政策》
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <ArrowRight className="h-5 w-5 text-primary-300 group-hover:text-primary-200" />
            </span>
            完成注册
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              已有账号？{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                立即登录
              </Link>
            </span>
          </div>
        </form>

        {/* Registration Benefits */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">注册后您可以：</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 发帖讨论，分享投资见解</li>
            <li>• 关注专业投资者，获取优质内容</li>
            <li>• 加入投资群组，与志同道合者交流</li>
            <li>• 完成实名认证，解锁更多功能</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
