import React, { useState, useEffect } from 'react';
import API from '../../api.js';
import { useAuth } from '../../useAuth.js';
import Navbar from '../Navbar';
import HeatMapProfile from './HeatMap.jsx';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './profile.css';

function Profile() {
  const { currentUser, logout } = useAuth();
  const { id: paramUserId } = useParams();
  const navigate = useNavigate();

  const targetUserId = paramUserId || currentUser;
  const isOwnProfile = !paramUserId || paramUserId === currentUser;

  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileRes, reposRes] = await Promise.all([
          API.get(`/getProfile/${targetUserId}`),
          API.get(`/repo/user/${targetUserId}`)
        ]);
        setUser(profileRes.data);
        setRepos(Array.isArray(reposRes.data.repositories) ? reposRes.data.repositories : []);

        if (!isOwnProfile && currentUser) {
          try {
            const loggedInRes = await API.get(`/getProfile/${currentUser}`);
            const followingList = loggedInRes.data?.followedUsers || [];
            setIsFollowing(followingList.some(id => (id._id || id) === targetUserId));
          } catch (err) {
            console.error('Error checking followed status:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (err.response && (err.response.status === 404 || err.response.status === 401 || err.response.status === 403)) {
          if (isOwnProfile) {
            logout();
            navigate('/auth');
            return;
          }
        }
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId, currentUser, isOwnProfile, logout, navigate]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    try {
      const res = await API.post(`/user/follow/${targetUserId}`);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        {/* Left Profile Sidebar */}
        <aside className="profile-sidebar">
          <div className="avatar-wrapper">
            <div className="profile-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="profile-names">
            <h1 className="profile-username">{user?.username}</h1>
            <p className="profile-email">{user?.email}</p>
          </div>

          {!isOwnProfile && currentUser && (
            <button
              className={`btn-follow ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowToggle}
            >
              {isFollowing ? '✓ Following' : '+ Follow'}
            </button>
          )}

          <div className="profile-stats-grid">
            <div className="stat-card">
              <span className="stat-num">{repos.length}</span>
              <span className="stat-text">Repositories</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">{user?.followedUsers?.length || 0}</span>
              <span className="stat-text">Following</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">{user?.starRepos?.length || 0}</span>
              <span className="stat-text">Stars</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="profile-main">
          {/* HeatMap Activity Section */}
          <section className="profile-section activity-section">
            <HeatMapProfile userId={targetUserId} />
          </section>

          {/* Repositories Showcase Section */}
          <section className="profile-section repos-section">
            <div className="section-title-bar">
              <h3>Repositories ({repos.length})</h3>
              {isOwnProfile && (
                <Link to="/create" className="btn-new-repo">
                  + New Repository
                </Link>
              )}
            </div>

            {repos.length === 0 ? (
              <div className="empty-repos">
                <p>No public repositories found for this user.</p>
              </div>
            ) : (
              <div className="profile-repos-grid">
                {repos.map((repo) => (
                  <Link key={repo._id} to={`/repo/${repo._id}`} className="profile-repo-card">
                    <div className="profile-repo-top">
                      <h4 className="profile-repo-name">{repo.name}</h4>
                      <span className={`visibility-badge ${repo.visibility ? 'public' : 'private'}`}>
                        {repo.visibility ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <p className="profile-repo-desc">
                      {repo.description || 'No description provided.'}
                    </p>
                    <div className="profile-repo-meta">
                      <span className="lang-dot"></span>
                      <span>JavaScript</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Profile;
