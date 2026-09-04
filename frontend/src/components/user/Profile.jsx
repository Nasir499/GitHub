import React, { useState, useEffect, useCallback } from 'react';
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

  const effectiveUserId = currentUser || localStorage.getItem('userId');
  const targetUserId = paramUserId || effectiveUserId;
  const isOwnProfile = !paramUserId || paramUserId === effectiveUserId;

  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError('');
    try {
      const [profileRes, reposRes] = await Promise.all([
        API.get(`/getProfile/${targetUserId}`),
        API.get(`/repo/user/${targetUserId}`)
      ]);
      setUser(profileRes.data);
      setRepos(Array.isArray(reposRes.data.repositories) ? reposRes.data.repositories : []);

      if (!isOwnProfile && effectiveUserId) {
        try {
          const loggedInRes = await API.get(`/getProfile/${effectiveUserId}`);
          const followingList = loggedInRes.data?.followedUsers || [];
          const checkId = (u) => (u && typeof u === 'object' ? u._id : u)?.toString();
          setIsFollowing(followingList.some(u => checkId(u) === targetUserId.toString()));
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
  }, [targetUserId, effectiveUserId, isOwnProfile, logout, navigate]);

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId, fetchProfile]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    try {
      const res = await API.post(`/user/follow/${targetUserId}`);
      setIsFollowing(res.data.isFollowing);
      fetchProfile();
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

  const followersList = user?.followers || [];
  const followingList = user?.followedUsers || [];

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
            <div
              className={`stat-card ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              <span className="stat-num">{followersList.length}</span>
              <span className="stat-text">Followers</span>
            </div>
            <div
              className={`stat-card ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              <span className="stat-num">{followingList.length}</span>
              <span className="stat-text">Following</span>
            </div>
            <div
              className={`stat-card ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="stat-num">{repos.length}</span>
              <span className="stat-text">Repositories</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="profile-main">
          {/* Navigation Tabs */}
          <div className="profile-nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📁 Overview & Repositories <span className="tab-badge">{repos.length}</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              👥 Followers <span className="tab-badge">{followersList.length}</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              👤 Following <span className="tab-badge">{followingList.length}</span>
            </button>
          </div>

          {/* Tab Content: Overview & Repositories */}
          {activeTab === 'overview' && (
            <>
              <section className="profile-section activity-section">
                <HeatMapProfile userId={targetUserId} />
              </section>

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
            </>
          )}

          {/* Tab Content: Followers */}
          {activeTab === 'followers' && (
            <section className="profile-section users-list-section">
              <div className="section-title-bar">
                <h3>Followers ({followersList.length})</h3>
              </div>

              {followersList.length === 0 ? (
                <div className="empty-state-card">
                  <span className="empty-icon">👥</span>
                  <p>This user has no followers yet.</p>
                </div>
              ) : (
                <div className="user-cards-grid">
                  {followersList.map((follower) => {
                    const fId = follower._id || follower;
                    const name = follower.username || follower.email?.split('@')[0] || "Developer";
                    const email = follower.email || "";
                    return (
                      <div key={fId} className="user-list-card">
                        <div className="user-card-avatar">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-card-details">
                          <Link to={`/user/${fId}`} className="user-card-username">
                            {name}
                          </Link>
                          {email && <span className="user-card-email">{email}</span>}
                        </div>
                        <Link to={`/user/${fId}`} className="btn-user-action">
                          View Profile
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Tab Content: Following */}
          {activeTab === 'following' && (
            <section className="profile-section users-list-section">
              <div className="section-title-bar">
                <h3>Following ({followingList.length})</h3>
              </div>

              {followingList.length === 0 ? (
                <div className="empty-state-card">
                  <span className="empty-icon">👤</span>
                  <p>This user is not following anyone yet.</p>
                </div>
              ) : (
                <div className="user-cards-grid">
                  {followingList.map((followed) => {
                    const fId = followed._id || followed;
                    const name = followed.username || followed.email?.split('@')[0] || "Developer";
                    const email = followed.email || "";
                    return (
                      <div key={fId} className="user-list-card">
                        <div className="user-card-avatar">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-card-details">
                          <Link to={`/user/${fId}`} className="user-card-username">
                            {name}
                          </Link>
                          {email && <span className="user-card-email">{email}</span>}
                        </div>
                        <Link to={`/user/${fId}`} className="btn-user-action">
                          View Profile
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;
