import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Search from './pages/Search';
import Messages from './pages/social/Messages';
import Groups from './pages/social/Groups';
import GroupDetail from './pages/social/GroupDetail';
import GroupSettings from './pages/social/GroupSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import HotTopics from './pages/HotTopics';
import FollowingFeed from './pages/FollowingFeed';
import Favorites from './pages/Favorites';
import EssencePosts from './pages/EssencePosts';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth routes without layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Routes with layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="hot" element={<HotTopics />} />
                <Route path="following" element={<FollowingFeed />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="essence" element={<EssencePosts />} />
                <Route path="profile/:userId" element={<Profile />} />
                <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="post/:postId" element={<PostDetail />} />
                <Route path="create" element={<CreatePost />} />
                <Route path="search" element={<Search />} />
                <Route path="messages" element={<Messages />} />
                <Route path="groups" element={<Groups />} />
                <Route path="groups/:groupId" element={<GroupDetail />} />
                <Route path="groups/:groupId/settings" element={<ProtectedRoute><GroupSettings /></ProtectedRoute>} />
                <Route path="admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              </Route>
              <Route path="/forum/:section" element={<Layout />}>
                <Route index element={<ForumSection />} />
              </Route>
            </Routes>
          </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
