import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api.js';
import Navbar from '../Navbar';
import './issue.css';

function CreateIssue() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Issue title is required');
      return;
    }
    if (!description.trim()) {
      setError('Issue description is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await API.post(`/issue/create/${repoId}`, { title, description });
      navigate(`/repo/${repoId}`);
    } catch (err) {
      console.error('Error creating issue:', err);
      setError(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-issue-container">
        <Link to={`/repo/${repoId}`} className="issue-back">&larr; Back to Repository</Link>
        <h2>Create New Issue</h2>

        {error && <p className="issue-error">{error}</p>}

        <form onSubmit={handleSubmit} className="create-issue-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={8}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Issue'}
          </button>
        </form>
      </div>
    </>
  );
}

export default CreateIssue;
