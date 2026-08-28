import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api.js';
import Navbar from '../Navbar';
import './issue.css';

function IssueList() {
  const { repoId } = useParams();
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('open');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await API.get(`/issue/all/${repoId}`);
        setIssues(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching issues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [repoId]);

  const filteredIssues = issues.filter((issue) => issue.status === filter);
  const openCount = issues.filter((i) => i.status === 'open').length;
  const closedCount = issues.filter((i) => i.status === 'closed').length;

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ color: 'white', textAlign: 'center' }}>Loading issues...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="issue-container">
        <div className="issue-header">
          <Link to={`/repo/${repoId}`} className="issue-back">&larr; Back to Repository</Link>
          <div className="issue-header-row">
            <h2>Issues</h2>
            <Link to={`/repo/${repoId}/issues/new`} className="new-issue-btn">New Issue</Link>
          </div>
        </div>

        <div className="issue-filters">
          <button
            className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
            onClick={() => setFilter('open')}
          >
            🟢 Open ({openCount})
          </button>
          <button
            className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
            onClick={() => setFilter('closed')}
          >
            🔴 Closed ({closedCount})
          </button>
        </div>

        {filteredIssues.length === 0 ? (
          <p className="empty-message">
            No {filter} issues found.
          </p>
        ) : (
          <div className="issues-list">
            {filteredIssues.map((issue) => (
              <Link key={issue._id} to={`/issue/${issue._id}`} className="issue-card">
                <span className={`issue-status-icon ${issue.status}`}>
                  {issue.status === 'open' ? '🟢' : '🔴'}
                </span>
                <div className="issue-card-content">
                  <h4>{issue.title}</h4>
                  <p>
                    #{issue._id?.slice(-6)} • opened by{' '}
                    {issue.author?.username || 'unknown'} •{' '}
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default IssueList;
