import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api.js';
import Navbar from '../Navbar';
import './repoDetail.css';

function RepoDetail() {
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [s3Files, setS3Files] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingFileContent, setLoadingFileContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRepoAndFiles = async () => {
      try {
        const [repoRes, s3Res] = await Promise.all([
          API.get(`/repo/${id}`),
          API.get('/repo/s3-files').catch(() => ({ data: { files: [] } }))
        ]);
        setRepo(repoRes.data);
        setS3Files(Array.isArray(s3Res.data?.files) ? s3Res.data.files : []);
      } catch (err) {
        console.error('Error fetching repository:', err);
        setError('Repository not found or access denied');
      } finally {
        setLoading(false);
      }
    };
    fetchRepoAndFiles();
  }, [id]);

  const handleOpenFile = async (fileKey, fileName) => {
    setSelectedFile(fileName);
    setLoadingFileContent(true);
    try {
      const res = await API.get(`/repo/s3-content?key=${encodeURIComponent(fileKey)}`);
      setFileContent(res.data.content);
    } catch (err) {
      console.error('Error loading file content:', err);
      setFileContent('Error loading file content from S3.');
    } finally {
      setLoadingFileContent(false);
    }
  };

  const closeModal = () => {
    setSelectedFile(null);
    setFileContent('');
  };

  if (loading) {
    return (
      <div className="repo-page">
        <Navbar />
        <div className="repo-loading">
          <div className="spinner"></div>
          <p>Loading repository & files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repo-page">
        <Navbar />
        <div className="repo-error">{error}</div>
      </div>
    );
  }

  const allFiles = [
    ...(repo.content || []).map(f => ({ name: f, source: 'database' })),
    ...s3Files.map(f => ({ ...f, source: 's3' }))
  ];

  return (
    <div className="repo-page">
      <Navbar />
      <div className="repo-detail-container">
        <div className="repo-detail-header">
          <div className="repo-detail-title">
            <Link to="/" className="repo-detail-back">&larr; Back</Link>
            <h1>
              <span className="repo-owner">{repo.owner?.username || 'Unknown'}</span>
              <span className="repo-separator">/</span>
              <span className="repo-name">{repo.name}</span>
            </h1>
            <span className={`visibility-badge ${repo.visibility ? 'public' : 'private'}`}>
              {repo.visibility ? 'Public' : 'Private'}
            </span>
          </div>
          <p className="repo-description">{repo.description || 'No description provided.'}</p>
          <p className="repo-meta">Created: {new Date(repo.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Pushed Files Section */}
        <div className="repo-detail-section">
          <div className="section-header">
            <h3>Files & Commits ({allFiles.length})</h3>
            <span className="s3-cloud-badge">☁️ AWS S3 Synced</span>
          </div>

          {allFiles.length > 0 ? (
            <div className="file-list-table">
              <div className="file-table-header">
                <span>Name</span>
                <span>Commit ID</span>
                <span>Size</span>
                <span>Last Modified</span>
              </div>
              {allFiles.map((file, index) => (
                <div
                  key={index}
                  className={`file-table-row ${file.key ? 'clickable' : ''}`}
                  onClick={() => file.key && handleOpenFile(file.key, file.name)}
                >
                  <div className="file-name-cell">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file.name}</span>
                  </div>
                  <span className="file-commit-cell">
                    {file.commitId ? file.commitId.slice(0, 8) : 'initial'}
                  </span>
                  <span className="file-size-cell">
                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : '-'}
                  </span>
                  <span className="file-date-cell">
                    {file.lastModified
                      ? new Date(file.lastModified).toLocaleDateString()
                      : '-'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-files-box">
              <span className="box-icon">📁</span>
              <p>No pushed files yet. Run <code>node index.js push</code> in CLI to upload files to S3!</p>
            </div>
          )}
        </div>

        {/* Issues Section */}
        <div className="repo-detail-section">
          <div className="section-header">
            <h3>Issues ({repo.issues?.length || 0})</h3>
            <Link to={`/repo/${id}/issues/new`} className="new-issue-btn">New Issue</Link>
          </div>
          {repo.issues && repo.issues.length > 0 ? (
            <div className="issues-list">
              {repo.issues.map((issue) => (
                <Link key={issue._id} to={`/issue/${issue._id}`} className="issue-item">
                  <span className={`issue-status ${issue.status}`}>
                    {issue.status === 'open' ? '🟢' : '🔴'}
                  </span>
                  <div className="issue-info">
                    <h4>{issue.title}</h4>
                    <p>#{issue._id?.slice(-6)} • {issue.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-message">No issues yet.</p>
          )}
        </div>
      </div>

      {/* Code Viewer Modal */}
      {selectedFile && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 {selectedFile}</h3>
              <button className="modal-close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              {loadingFileContent ? (
                <div className="code-loading">Loading file from S3...</div>
              ) : (
                <pre className="code-viewer">{fileContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepoDetail;
