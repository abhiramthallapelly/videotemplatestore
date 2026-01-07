import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5050').trim().replace(/\s+/g, '');

// Helper function to build API URLs
const buildApiUrl = (path) => {
  const base = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.replace(/^\//, ''); // Remove leading slash
  return `${base}/${cleanPath}`;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [projects, setProjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkBackendHealth();
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const checkBackendHealth = async () => {
    try {
      const healthUrl = buildApiUrl('/api/health');
      console.log('Checking backend health at:', healthUrl);
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('Health check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend health check successful:', data);
        setBackendStatus('connected');
      } else {
        console.error('Backend health check failed with status:', response.status);
        setBackendStatus('error');
      }
    } catch (error) {
      console.error('Backend health check error:', error);
      console.error('Error details:', error.message);
      console.error('Full error:', error);
      setBackendStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const retryConnection = () => {
    setBackendStatus('checking');
    setLoading(true);
    checkBackendHealth();
  };

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const response = await fetch(buildApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', result.token);
        setIsAuthenticated(true);
        alert('Login successful!');
      } else {
        alert(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check if backend is running.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setProjects([]);
  };

  const loadProjects = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(buildApiUrl('/api/admin/projects'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const token = localStorage.getItem('adminToken');

    if (!token) {
      alert('Please login first');
      return;
    }

    setUploading(true);

    try {
      const response = await fetch(buildApiUrl('/api/admin/projects'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Template uploaded successfully!');
        e.target.reset();
        setShowUploadForm(false);
        loadProjects();
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(buildApiUrl(`/api/admin/projects/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert('Template deleted successfully!');
        loadProjects();
      } else {
        alert(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-box">
            <h1>Admin Dashboard</h1>
            <h2>ABHIRAM CREATIONS</h2>
            <div className={`backend-status ${backendStatus}`}>
              Backend: {backendStatus === 'connected' ? '✓ Connected' : backendStatus === 'checking' ? 'Checking...' : '✗ Not Connected'}
            </div>
            {backendStatus !== 'connected' && (
              <div className="warning">
                <p>⚠️ Backend server is not running or not accessible.</p>
                <p>Please start the backend server on port 5050 first.</p>
                <button onClick={retryConnection} className="btn-retry" style={{marginTop: '10px', width: '100%'}}>
                  Retry Connection
                </button>
                <p style={{marginTop: '10px', fontSize: '0.85rem', color: '#999'}}>
                  If backend is running, check browser console (F12) for errors.
                </p>
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" name="username" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" required />
              </div>
              <button type="submit" className="btn-primary">Login</button>
            </form>
            <div className="login-help">
              <p>Don't have an admin account?</p>
              <p>Register one via API: POST /api/admin/register</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Admin Dashboard - ABHIRAM CREATIONS</h1>
        <div className="header-actions">
          <button onClick={() => setShowUploadForm(!showUploadForm)} className="btn-upload">
            {showUploadForm ? 'Cancel' : '+ Upload Template'}
          </button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>
      <main className="app-main">
        <div className="dashboard-container">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Templates</h3>
              <p className="stat-number">{projects.length}</p>
            </div>
            <div className="stat-card">
              <h3>Free Templates</h3>
              <p className="stat-number">{projects.filter(p => p.is_free).length}</p>
            </div>
            <div className="stat-card">
              <h3>Paid Templates</h3>
              <p className="stat-number">{projects.filter(p => !p.is_free).length}</p>
            </div>
          </div>

          {showUploadForm && (
            <div className="upload-section">
              <h2>Upload New Template</h2>
              <form onSubmit={handleUpload} className="upload-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title *</label>
                    <input type="text" name="title" required placeholder="Template name" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" name="category" placeholder="e.g., Video Templates" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" rows="3" placeholder="Template description"></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pricing</label>
                    <select name="is_free" onChange={(e) => {
                      const priceInput = e.target.form.querySelector('input[name="price"]');
                      priceInput.disabled = e.target.value === '1';
                      if (e.target.value === '1') priceInput.value = '0';
                    }}>
                      <option value="1">Free</option>
                      <option value="0">Paid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (in cents, e.g., 999 = $9.99)</label>
                    <input type="number" name="price" min="0" defaultValue="0" disabled />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Template File *</label>
                    <input type="file" name="file" required accept="*/*" />
                    <small>Max 100MB</small>
                  </div>
                  <div className="form-group">
                    <label>Preview Image (Optional)</label>
                    <input type="file" name="image" accept="image/*" />
                    <small>JPG, PNG, or GIF</small>
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Template'}
                </button>
              </form>
            </div>
          )}

          <div className="projects-section">
            <div className="section-header">
              <h2>All Templates ({projects.length})</h2>
              <button onClick={loadProjects} className="btn-refresh">Refresh</button>
            </div>
            {projects.length === 0 ? (
              <div className="empty-state">
                <p>No templates uploaded yet.</p>
                <p>Click "Upload Template" to add your first template.</p>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map(project => (
                  <div key={project.id} className="project-card">
                    {project.image_path && (
                      <div className="project-image">
                        <img 
                          src={buildApiUrl(`/uploads/images/${project.image_path}`)} 
                          alt={project.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="project-content">
                      <h3>{project.title}</h3>
                      <p className="project-description">{project.description || 'No description'}</p>
                      <div className="project-meta">
                        <span className={`badge ${project.is_free ? 'badge-free' : 'badge-paid'}`}>
                          {project.is_free ? 'FREE' : `$${(project.price / 100).toFixed(2)}`}
                        </span>
                        <span className="project-category">{project.category || 'template'}</span>
                      </div>
                      <div className="project-stats">
                        <span>Downloads: {project.download_count || 0}</span>
                        <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="project-actions">
                        <button 
                          onClick={() => handleDelete(project.id)} 
                          className="btn-delete"
                        >
                          Delete
                        </button>
                        <a 
                          href={buildApiUrl(`/uploads/${project.file_path}`)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-download"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
