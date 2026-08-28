import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api.js";
import Navbar from "../Navbar";
import "./dashboard.css";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await API.get(`/repo/user/${userId}`);
        const data = response.data;
        setRepositories(Array.isArray(data.repositories) ? data.repositories : []);
      } catch (err) {
        console.error("Error fetching repositories:", err);
        setRepositories([]);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await API.get('/repo/all');
        const data = response.data;
        setSuggestedRepositories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching suggested repositories:", err);
        setSuggestedRepositories([]);
      }
    };

    Promise.all([fetchRepositories(), fetchSuggestedRepositories()])
      .finally(() => setLoading(false));
  }, []);

  const searchResults = searchQuery === ""
    ? repositories
    : repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        {/* Left Column: Suggested Repositories */}
        <aside className="dashboard-aside-left">
          <div className="aside-header">
            <h3>Explore Repositories</h3>
          </div>
          <div className="suggested-list">
            {suggestedRepositories.length === 0 ? (
              <p className="empty-text">No suggested repositories</p>
            ) : (
              suggestedRepositories.slice(0, 6).map((repo) => (
                <Link
                  key={repo._id}
                  to={`/repo/${repo._id}`}
                  className="suggested-card"
                >
                  <div className="suggested-card-header">
                    <span className="repo-icon">📁</span>
                    <span className="repo-title">{repo.name}</span>
                  </div>
                  <p className="repo-desc">
                    {repo.description || "No description provided"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </aside>

        {/* Main Column: User Repositories & Search */}
        <main className="dashboard-main-content">
          <div className="main-header">
            <h2>Your Repositories</h2>
            <Link to="/create" className="btn-create-small">
              + New Repository
            </Link>
          </div>

          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              placeholder="🔍 Search your repositories..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="repo-grid">
            {searchResults.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <h3>No repositories found</h3>
                <p>Get started by creating your first repository.</p>
                <Link to="/create" className="btn-create-large">
                  Create Repository
                </Link>
              </div>
            ) : (
              searchResults.map((repo) => (
                <Link
                  key={repo._id}
                  to={`/repo/${repo._id}`}
                  className="dashboard-repo-card"
                >
                  <div className="card-top">
                    <span className="card-repo-icon">📁</span>
                    <h4 className="card-repo-name">{repo.name}</h4>
                    <span
                      className={`badge-visibility ${
                        repo.visibility ? "public" : "private"
                      }`}
                    >
                      {repo.visibility ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="card-repo-desc">
                    {repo.description || "No description provided."}
                  </p>
                  <div className="card-footer">
                    <span className="language-dot"></span>
                    <span className="language-name">JavaScript</span>
                    <span className="updated-text">
                      Updated {new Date(repo.updatedAt || repo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>

        {/* Right Column: News & Events */}
        <aside className="dashboard-aside-right">
          <div className="aside-header">
            <h3>Upcoming Events</h3>
          </div>
          <div className="events-card">
            <ul className="events-list">
              <li>
                <div className="event-date">DEC 15</div>
                <div className="event-info">
                  <strong>Tech Conference 2026</strong>
                  <p>Keynotes & Web Dev Workstation</p>
                </div>
              </li>
              <li>
                <div className="event-date">DEC 25</div>
                <div className="event-info">
                  <strong>Developer Meetup</strong>
                  <p>Open Source Project Showcase</p>
                </div>
              </li>
              <li>
                <div className="event-date">JAN 05</div>
                <div className="event-info">
                  <strong>React 19 Summit</strong>
                  <p>Server Components & State</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;