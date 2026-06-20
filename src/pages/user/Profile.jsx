import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Award, Eye, Clock, MessageSquare, ThumbsUp, Loader, UserPlus, UserMinus, Send } from 'lucide-react';
import { usersService, postsService } from '../../services';
import { get } from '../../utils/http';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: me, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const [userRes, postsRes, statsRes, followersRes, followingRes] = await Promise.all([
          usersService.getUser(userId),
          postsService.getPosts({ user_id: userId, page: 1, per_page: 20 }),
          get(`/users/${userId}/stats`),
          get(`/users/${userId}/followers?per_page=20`),
          get(`/users/${userId}/following?per_page=20`),
        ]);
        setUser(userRes);
        setPosts(Array.isArray(postsRes) ? postsRes : postsRes.items || []);
        setStats(statsRes);
        setFollowers(Array.isArray(followersRes) ? followersRes : []);
        setFollowing(Array.isArray(followingRes) ? followingRes : []);

        if (isAuthenticated && me?.user_id !== userId) {
          const followingList = Array.isArray(followingRes) ? followingRes : [];
          setIsFollowing(followingList.some(f => f.user_id === me?.user_id));
        }
      } catch (err) {
        setError(err.message || '获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId, isAuthenticated, me?.user_id]);

  const handleFollow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      if (isFollowing) {
        await usersService.unfollowUser(userId);
        setIsFollowing(false);
        setStats(s => ({ ...s, followers: s.followers - 1 }));
      } else {
        await usersService.followUser(userId);
        setIsFollowing(true);
        setStats(s => ({ ...s, followers: s.followers + 1 }));
      }
    } catch (e) { alert(e.message || '操作失败'); }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const n = new Date();
    const diff = n - d;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (m < 60) return `${m}分钟前`;
    if (h < 24) return `${h}小时前`;
    if (days < 7) return `${days}天前`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center py-20"><Loader className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="h-48 bg-gradient-to-r from-primary-500 to-purple-600 rounded-t-xl"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="flex items-end">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center text-4xl shadow-lg">
                {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" alt="" /> : '👤'}
              </div>
              <div className="ml-4 pb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.nickname || '用户' + user.user_id?.slice(0, 6)}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">Lv.{user.level || 1}</span>
                  {user.auth_level === 'EXPERT' && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">专业认证</span>}
                </div>
              </div>
            </div>
            {me?.user_id !== userId && (
              <div className="flex space-x-2">
                <button onClick={() => navigate(`/messages?to=${userId}`)}
                  className="flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium">
                  <Send className="h-4 w-4 mr-1" />发私信
                </button>
                <button onClick={handleFollow}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                    isFollowing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}>
                  {isFollowing ? <UserMinus className="h-4 w-4 mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
                  {isFollowing ? '已关注' : '关注'}
                </button>
              </div>
            )}
          </div>

          {user.bio && <p className="text-gray-600 mb-4">{user.bio}</p>}

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 text-center">
            <div><div className="text-xl font-bold text-gray-900">{stats.posts}</div><div className="text-xs text-gray-500">帖子</div></div>
            <div><div className="text-xl font-bold text-gray-900">{stats.following}</div><div className="text-xs text-gray-500">关注</div></div>
            <div><div className="text-xl font-bold text-gray-900">{stats.followers}</div><div className="text-xs text-gray-500">粉丝</div></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'posts', label: '帖子', count: stats.posts },
            { id: 'followers', label: '粉丝', count: stats.followers },
            { id: 'following', label: '关注', count: stats.following },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-medium ${activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {activeTab === 'posts' && (posts.length > 0 ? posts.map(post => (
            <Link key={post.post_id} to={`/post/${post.post_id}`} className="block p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {post.is_essence && <Award className="h-4 w-4 text-yellow-500" />}
                    <h3 className="font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span><Eye className="h-4 w-4 inline mr-1" />{post.view_count || 0}</span>
                    <span><ThumbsUp className="h-4 w-4 inline mr-1" />{post.like_count || 0}</span>
                    <span><MessageSquare className="h-4 w-4 inline mr-1" />{post.comment_count || 0}</span>
                    <span><Clock className="h-4 w-4 inline mr-1" />{formatTime(post.created_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          )) : <div className="p-12 text-center text-gray-500">暂无帖子</div>)}

          {activeTab === 'followers' && (
            followers.length > 0 ? followers.map(f => (
              <Link key={f.user_id} to={`/profile/${f.user_id}`} className="flex items-center space-x-3 p-4 hover:bg-gray-50">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                <span className="font-medium">{f.nickname || f.user_id.slice(0, 8)}</span>
              </Link>
            )) : <div className="p-12 text-center text-gray-500">暂无粉丝</div>
          )}

          {activeTab === 'following' && (
            following.length > 0 ? following.map(f => (
              <Link key={f.user_id} to={`/profile/${f.user_id}`} className="flex items-center space-x-3 p-4 hover:bg-gray-50">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                <span className="font-medium">{f.nickname || f.user_id.slice(0, 8)}</span>
              </Link>
            )) : <div className="p-12 text-center text-gray-500">暂未关注任何人</div>
          )}
        </div>
      </div>
    </div>
  );
}