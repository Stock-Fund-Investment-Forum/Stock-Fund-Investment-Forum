# 前端代码规范和最佳实践

本文档定义了股基论坛前端项目的代码规范和最佳实践。

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── common/         # 通用组件 (ErrorBoundary等)
│   ├── layout/         # 布局组件 (Layout, Header, Sidebar, Footer)
│   ├── ui/             # UI组件库 (Button, Card, Input等)
│   └── [页面相关]/      # 页面特定组件
├── pages/              # 页面级组件
├── hooks/              # 自定义 Hooks
├── context/            # Context (状态管理)
├── utils/              # 工具函数
├── constants/          # 常量和配置
├── config/             # 配置文件
├── styles/             # 全局样式
└── App.jsx             # 应用入口
```

## 🎨 命名规范

### 文件和文件夹
- 组件文件: PascalCase (Button.jsx, Header.jsx)
- 工具/工具函数: camelCase (string.js, storage.js)
- 常量文件: camelCase (navigation.js, api.js)
- 文件夹: 小写 (components, pages, utils)

### 变量和函数
- 变量: camelCase (userName, postData)
- 常量: UPPER_SNAKE_CASE (API_BASE_URL, MAX_RETRY)
- 函数: camelCase (formatDate, validateEmail)
- React 组件: PascalCase (MyComponent)
- Hook: 以 'use' 开头 (useAuth, useFetch)

## 📝 代码风格

### 导入顺序
```javascript
// 1. 外部库
import React from 'react';
import { useState } from 'react';

// 2. 第三方库
import { useNavigate } from 'react-router-dom';

// 3. 项目内部 - utils
import { formatDate } from '../utils/string';

// 4. 项目内部 - 常量
import { ROUTES } from '../constants/navigation';

// 5. 项目内部 - 组件
import { Button } from '../components/ui';
import Header from '../components/layout/Header';
```

### 组件模板
```javascript
/**
 * 组件描述
 * @component
 * @example
 * return <MyComponent prop="value" />
 */
import { useState } from 'react';
import { cn } from '../utils/classname';

export default function MyComponent({ prop, className, ...props }) {
  const [state, setState] = useState(null);

  return (
    <div className={cn('base-class', className)} {...props}>
      {/* Content */}
    </div>
  );
}
```

### 函数文档
```javascript
/**
 * 函数描述
 * @param {type} paramName - 参数描述
 * @returns {type} 返回值描述
 */
export const myFunction = (paramName) => {
  // Implementation
};
```

## 🔧 React 最佳实践

### 使用函数组件和 Hooks
- 优先使用函数组件
- 使用自定义 Hooks 复用逻辑
- 正确处理 useEffect 的依赖数组

### 性能优化
- 使用 React.memo 包装不必要重新渲染的组件
- 使用 useCallback 缓存回调函数
- 使用 useMemo 缓存计算结果
- 实现代码分割

```javascript
import { lazy, Suspense } from 'react';

const MyComponent = lazy(() => import('./MyComponent'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MyComponent />
    </Suspense>
  );
}
```

### Props 验证
```javascript
// 好的做法：在组件顶部清晰地说明 props
export default function MyComponent({ 
  title,           // 标题
  onSubmit,       // 提交回调
  isLoading,      // 加载状态
  className,      // 额外的 CSS 类
  ...props        // 其他属性
}) {
  // ...
}
```

## 🎯 样式指南

### Tailwind CSS 使用
- 使用 Tailwind 的工具类
- 避免内联 CSS
- 使用 `cn()` 工具函数合并类名

```javascript
import { cn } from '../utils/classname';

export const Button = ({ variant = 'primary', className, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-200 text-gray-900',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
};
```

### 响应式设计
```javascript
// 使用 Tailwind 的响应式前缀
<div className="flex flex-col md:flex-row lg:flex-row-reverse">
  {/* Content */}
</div>
```

## ✅ 错误处理

### 使用 ErrorBoundary
```javascript
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 异步错误处理
```javascript
const { execute, error, data } = useAsync(fetchData);

try {
  await execute();
} catch (err) {
  console.error('Failed:', err.message);
  // 显示错误消息给用户
}
```

## 🔒 安全最佳实践

- 不要在代码中硬编码敏感信息
- 使用环境变量存储 API URLs
- 验证用户输入
- 实现 CSRF 保护
- 使用 HTTPS

## 📦 依赖管理

- 定期更新依赖
- 审查新依赖的大小和质量
- 移除未使用的依赖
- 使用 npm audit 检查安全漏洞

## 🧪 测试

- 为工具函数编写单元测试
- 为关键业务逻辑编写集成测试
- 使用 Jest 和 React Testing Library

## 💡 常见模式

### 使用自定义 Hook
```javascript
// hooks/useForm.js
export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return { values, errors, handleChange, handleSubmit };
};
```

### 创建高阶组件
```javascript
const withAuth = (Component) => {
  return (props) => {
    const { user } = useAuth();

    if (!user) {
      return <Navigate to="/login" />;
    }

    return <Component {...props} />;
  };
};
```

## 🚀 部署清单

- [ ] 运行 `npm run lint` 检查代码
- [ ] 运行 `npm run build` 检查构建
- [ ] 验证所有路由
- [ ] 测试响应式设计
- [ ] 检查控制台错误
- [ ] 验证环境变量
- [ ] 测试在多个浏览器中

## 📚 参考资源

- [React 官方文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [React Router 文档](https://reactrouter.com)
- [Vite 文档](https://vitejs.dev)
