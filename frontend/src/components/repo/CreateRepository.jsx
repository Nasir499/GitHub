import React, { useState } from 'react';
import API from '../../api.js';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@primer/react/experimental';
import { Box, Button } from '@primer/react';
import Navbar from '../Navbar';
import './createRepository.css';

const CreateRepository = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await API.post('/repo/create', {
        name,
        description,
        visibility
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create repository.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-repo-wrapper">
        <div className="create-repo-heading">
          <Box sx={{ padding: 1 }}>
            <PageHeader>
              <PageHeader.TitleArea variant="large">
                <PageHeader.Title>Create a new repository</PageHeader.Title>
              </PageHeader.TitleArea>
            </PageHeader>
          </Box>
        </div>

        <form className="create-repo-form" onSubmit={handleCreate}>
          <div>
            <label className="label">Repository name *</label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="my-awesome-project"
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <input
              className="input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your repository"
            />
          </div>

          <div className="visibility-toggle">
            <label className="label">Visibility</label>
            <div className="visibility-options">
              <label className={`visibility-option ${visibility ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === true}
                  onChange={() => setVisibility(true)}
                />
                <span>🌐 Public</span>
                <small>Anyone can see this repository</small>
              </label>
              <label className={`visibility-option ${!visibility ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === false}
                  onChange={() => setVisibility(false)}
                />
                <span>🔒 Private</span>
                <small>Only you can see this repository</small>
              </label>
            </div>
          </div>

          {error && <p style={{ color: '#f85149', fontSize: '14px', margin: 0 }}>{error}</p>}

          <Button
            type="submit"
            variant="primary"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Repository'}
          </Button>
        </form>
      </div>
    </>
  );
};

export default CreateRepository;
