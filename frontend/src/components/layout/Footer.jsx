import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { footerNavigators, forumSections } from '../../config/navigation'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">投资论坛</h3>
            <p className="text-sm text-gray-400">
              专业的股票基金投资交流平台，汇聚投资者智慧，分享投资经验。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white">关于我们</Link></li>
              <li><Link to="/terms" className="hover:text-white">用户协议</Link></li>
              <li><Link to="/privacy" className="hover:text-white">隐私政策</Link></li>
              <li><Link to="/help" className="hover:text-white">帮助中心</Link></li>
            </ul>
          </div>

          {/* Forum Sections */}
          <div>
            <h3 className="text-white font-semibold mb-4">板块</h3>
            <ul className="space-y-2 text-sm">
              {footerNavigators.map(section => (
                <li key={section}>
                  <Link to={forumSections[section].path} className="hover:text-white">{forumSections[section].title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">联系我们</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 投资论坛. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
