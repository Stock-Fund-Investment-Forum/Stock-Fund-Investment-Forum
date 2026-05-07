import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight, Shield } from 'lucide-react'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: input, 2: verify, 3: reset
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
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
    if (!formData.email) {
      alert('请先输入邮箱')
      return
    }
    // TODO: Implement send verification code logic
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

  const handleVerifyCode = (e) => {
    e.preventDefault()
    // TODO: Implement code verification logic
    setStep(3)
  }

  const handleResetPassword = (e) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }

    if (formData.newPassword.length < 8) {
      alert('密码长度不能少于8位')
      return
    }

    // TODO: Implement password reset logic
    alert('密码重置成功，请使用新密码登录')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <button onClick={handleBack} className="absolute top-8 left-8 p-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-6 w-6" />
      </button>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回登录
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 1 ? '找回密码' : step === 2 ? '验证身份' : '重置密码'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 
              ? '请输入您的注册邮箱，我们将发送验证码' 
              : step === 2 
              ? '请输入邮箱收到的验证码' 
              : '请设置您的新密码'}
          </p>
        </div>

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                注册邮箱
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入注册邮箱"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ArrowRight className="h-5 w-5 text-primary-300 group-hover:text-primary-200" />
              </span>
              下一步
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
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
                  {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              验证
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  新密码
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="8-20位，包含数字和字母"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500">密码需包含数字和字母</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  确认新密码
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请再次输入新密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              重置密码
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
