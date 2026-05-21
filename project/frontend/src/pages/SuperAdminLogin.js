import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: 'superadmin' // Force superadmin role
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Verify the user is actually a superadmin
        if (data.user.role !== 'superadmin') {
          setError('Access Denied: Only SuperAdmin can login here');
          setLoading(false);
          return;
        }

        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to superadmin dashboard
        navigate('/superadmin/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-container">
      <div className="superadmin-card">
        {/* Header */}
        <div className="superadmin-header">
          <div className="superadmin-icon-wrapper">
            👑
          </div>
          <h1 className="superadmin-title">
            SuperAdmin Access
          </h1>
          <p className="superadmin-subtitle">
            Restricted Area - Authorized Personnel Only
          </p>
        </div>

        {/* Security Warning */}
        <div className="superadmin-security-notice">
          <span style={{ fontSize: '1.5rem' }}>🔒</span>
          <div>
            <p className="superadmin-security-text">
              <strong>Security Notice:</strong> This is a restricted access area. Only authorized SuperAdmin accounts can login here.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="superadmin-error">
            <span style={{ fontSize: '1.25rem' }}>❌</span>
            <strong>{error}</strong>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="auth-label">
              SuperAdmin Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your SuperAdmin email"
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label className="auth-label">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="superadmin-btn"
          >
            {loading ? '⏳ Authenticating...' : '👑 Login as SuperAdmin'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="superadmin-back-btn"
          >
            ← Back to Main Login
          </button>
        </form>

        {/* Setup Link */}
        <div className="superadmin-setup-box">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1' }}>
            ℹ️ First time? Need to setup SuperAdmin account?{' '}
            <button
              onClick={() => navigate('/setup-owner')}
              className="superadmin-link-btn"
            >
              Click here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;