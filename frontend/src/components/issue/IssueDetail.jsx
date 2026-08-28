import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api.js';
import { useAuth } from '../../Authcontext.jsx';
import Navbar from '../Navbar';
import './issue.css';

function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await API.get(`/issue/${id}`);
        setIssue(response.data);
      } catch (err) {
        console.error('Error fetching issue:', err);
        setError('Issue not found');
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  const handleToggleStatus = async () => {
    try {
      const newStatus = issue.status === 'open' ? 'closed' : 'open';
      await API.put(`/issue/update/${id}`, { status: newStatus });
      setIssue({ ...issue, status: newStatus });
    } catch (err) {
      console.error('Error updating issue:', err);
      setError('Failed to update issue status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await API.delete(`/issue/delete/${id}`);
      navigate(`/repo/${issue.repository}`);
    } catch (err) {
      console.error('Error deleting issue:', err);
      setError('Failed to delete issue');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ color: 'white', textAlign: 'center' }}>Loading issue...</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <p style={{ color: '#f85149', textAlign: 'center' }}>{error}</p>
      </>
    );
  }

  const isAuthor = currentUser === issue.author?._id;

  return (
    <>
      <Navbar />
      <div className="issue-detail-container">
        <Link to={`/repo/${issue.repository}`} className="issue-back">
          &larr; Back to Repository
        </Link>

        <div className="issue-detail-header">
          <h1>{issue.title}</h1>
          <div className="issue-detail-meta">
            <span className={`issue-status-badge ${issue.status}`}>
              {issue.status === 'open' ? '🟢 Open' : '🔴 Closed'}
            </span>
            <span className="issue-meta-text">
              Opened by <strong>{issue.author?.username || 'unknown'}</strong> on{' '}
              {new Date(issue.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="issue-detail-body">
          <p>{issue.description}</p>
        </div>

        {isAuthor && (
          <div className="issue-actions">
            <button
              className={`action-btn ${issue.status === 'open' ? 'close-btn' : 'reopen-btn'}`}
              onClick={handleToggleStatus}
            >
              {issue.status === 'open' ? 'Close Issue' : 'Reopen Issue'}
            </button>
            <button className="action-btn delete-btn" onClick={handleDelete}>
              Delete Issue
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default IssueDetail;
