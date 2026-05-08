# 快速参考指南

## 🎯 常用导入

### UI 组件
```javascript
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  Badge, 
  Alert, 
  Input, 
  Textarea,
  LoadingSpinner 
} from '@components/ui';
```

### Hooks
```javascript
import { 
  useAsync, 
  useFetch, 
  useLocalStorage, 
  useDebounce,
  useClickOutside,
  useMediaQuery
} from '@hooks';
```

### 工具函数
```javascript
import { 
  formatTimeAgo, 
  formatNumber, 
  isValidEmail, 
  validatePassword,
  debounce,
  throttle
} from '@utils/string';

import { 
  setStorage, 
  getStorage, 
  removeStorage,
  clearStorage
} from '@utils/storage';

import { cn } from '@utils/classname';

import { 
  get, 
  post, 
  put, 
  deleteRequest 
} from '@utils/http';
```

### 常量
```javascript
import { MAIN_NAV, ROUTES, SORT_OPTIONS } from '@constants/navigation';
import { API_ENDPOINTS, HTTP_STATUS } from '@constants/api';
import { COLORS, SPACING, SHADOWS, Z_INDEX } from '@constants/theme';
```

### 其他
```javascript
import { useAuth } from '@context/AuthContext';
import ErrorBoundary from '@components/common/ErrorBoundary';
```

## 🔧 常见代码片段

### 按钮变体
```javascript
<Button variant="primary" size="md">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="danger">危险按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="outline">轮廓按钮</Button>
```

### 输入表单
```javascript
const [formData, setFormData] = useState({ email: '', password: '' });

<Input 
  type="email"
  label="邮箱"
  placeholder="Enter email"
  value={formData.email}
  onChange={(e) => setFormData({...formData, email: e.target.value})}
  error={error?.email}
  required
/>

<Textarea 
  label="描述"
  placeholder="Enter description"
  rows={4}
/>

<Select 
  label="选项"
  options={[
    { value: '1', label: '选项1' },
    { value: '2', label: '选项2' }
  ]}
/>
```

### 卡片布局
```javascript
<Card>
  <CardHeader>
    <h2>标题</h2>
  </CardHeader>
  <CardBody>
    <p>内容</p>
  </CardBody>
  <CardFooter>
    <Button>确定</Button>
  </CardFooter>
</Card>
```

### 警告提示
```javascript
<Alert 
  type="success" 
  title="成功" 
  message="操作成功完成"
  onClose={() => {}}
/>

<Alert type="error" message="发生错误" />
<Alert type="warning" message="请注意" />
<Alert type="info" message="提示信息" />
```

### 加载状态
```javascript
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" className="text-blue-600" />

// 全屏加载
<FullScreenLoader message="正在加载..." />
```

### 数据获取
```javascript
// 使用 useFetch
const { data, loading, error } = useFetch('/api/posts');

// 使用 useAsync
const { execute, status, data } = useAsync(async () => {
  return fetch('/api/posts').then(r => r.json());
});

// 使用 http 工具
import { get } from '@utils/http';

const [data, setData] = useState(null);
useEffect(() => {
  get('/posts').then(setData).catch(console.error);
}, []);
```

### 表单验证
```javascript
import { isValidEmail, validatePassword } from '@utils/string';

const email = 'test@example.com';
if (!isValidEmail(email)) {
  console.error('Invalid email');
}

const password = 'Pass@word123';
const { isValid, strength } = validatePassword(password);
console.log(`密码强度: ${strength}/5`);
```

### 防抖和节流
```javascript
import { debounce, throttle } from '@utils/string';

// 搜索输入防抖
const handleSearch = debounce((query) => {
  console.log('搜索:', query);
}, 500);

// 滚动事件节流
const handleScroll = throttle(() => {
  console.log('滚动');
}, 300);
```

### 本地存储
```javascript
import { setStorage, getStorage, removeStorage } from '@utils/storage';

// 保存
setStorage('user', { id: 1, name: 'John' });

// 读取
const user = getStorage('user', null);

// 删除
removeStorage('user');
```

### 合并类名
```javascript
import { cn } from '@utils/classname';

const baseClass = 'px-4 py-2 rounded';
const variantClass = variant === 'primary' ? 'bg-blue-600' : 'bg-gray-200';
const customClass = isActive ? 'shadow-lg' : '';

const className = cn(baseClass, variantClass, customClass);
```

### 创建自定义页面
```javascript
import { useState } from 'react';
import { Card, Button, Alert } from '@components/ui';
import { useFetch } from '@hooks';
import { ROUTES } from '@constants/navigation';

export default function MyPage() {
  const [error, setError] = useState(null);
  const { data, loading } = useFetch('/api/data');

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-bold mb-4">我的页面</h1>
          {/* Content */}
        </CardBody>
      </Card>
    </div>
  );
}
```

### 认证相关
```javascript
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/navigation';

export default function ProtectedPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  return (
    <div>
      <p>欢迎，{user.username}</p>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

### 响应式设计
```javascript
import { useMediaQuery } from '@hooks';

export default function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return (
    <div className="flex flex-col md:flex-row lg:flex-row-reverse">
      {isMobile && <MobileMenu />}
      {isTablet && <TabletLayout />}
    </div>
  );
}
```

## 📚 快速查阅

### 文件位置
- UI 组件: `src/components/ui/`
- 通用组件: `src/components/common/`
- 自定义 Hooks: `src/hooks/index.js`
- 工具函数: `src/utils/`
- 常量: `src/constants/`
- 页面: `src/pages/`

### 常用命令
```bash
# 检查代码质量
npm run lint

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 环境变量
```bash
# 复制模板
cp .env.example .env.local

# 编辑 .env.local 文件
# VITE_API_URL=http://localhost:3000/api
```

### 路径别名
```javascript
// 使用别名简化导入
import Button from '@components/ui/Button';        // ✅
import Button from '../../../../components/ui/Button'; // ❌

import { formatDate } from '@utils/string';
import config from '@constants/api';
```

## 💡 最佳实践

1. **组件命名**: 使用 PascalCase (MyComponent.jsx)
2. **函数命名**: 使用 camelCase (myFunction)
3. **常量命名**: 使用 UPPER_SNAKE_CASE (MY_CONSTANT)
4. **类名合并**: 总是使用 `cn()` 工具函数
5. **错误处理**: 使用 try-catch 和错误边界
6. **加载状态**: 使用 LoadingSpinner 或 Skeleton
7. **表单验证**: 使用工具函数验证输入
8. **API 调用**: 使用 useFetch 或 useAsync Hooks
9. **本地存储**: 使用 storage 工具函数
10. **JSDoc 注释**: 为所有函数添加注释

## 🆘 常见问题

**Q: 如何导入 UI 组件?**
A: 使用路径别名 `import { Button } from '@components/ui'`

**Q: 如何创建新的 Hooks?**
A: 在 `src/hooks/index.js` 中添加，遵循 `useXxx` 命名规范

**Q: 如何验证表单输入?**
A: 使用 `isValidEmail()`, `validatePassword()` 工具函数

**Q: 如何处理错误?**
A: 使用 ErrorBoundary 包装组件，或使用 Alert 显示错误信息

**Q: 如何存储用户数据?**
A: 使用 `setStorage('key', data)` 存储，`getStorage('key')` 读取

---

更多信息请查阅 `FRONTEND_STANDARDS.md` 完整规范文档
