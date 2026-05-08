import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import PostDetail from './pages/post/PostDetail';
import CreatePost from './pages/post/CreatePost';
import ForumSection from './pages/forum/ForumSection';
import SearchPage from './pages/Search';
import Messages from './pages/social/Messages';
import Groups from './pages/social/Groups';
import GroupDetail from './pages/social/GroupDetail';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Auth routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile/:userId" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="post/:postId" element={<PostDetail />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="messages" element={<Messages />} />
            <Route path="groups" element={<Groups />} />
            <Route path="groups/:groupId" element={<GroupDetail />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
          <Route path="/forum/:section" element={<Layout />}>
            <Route index element={<ForumSection />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
