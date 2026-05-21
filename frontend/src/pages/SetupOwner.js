import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const SetupOwner = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupAllowed, setSetupAllowed] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSetupAvailable();
  }, []);

  const checkSetupAvailable = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/check-setup-allowed');
      const data = await response.json();

      if (!data.allowed) {
        setError('Setup has already been completed. SuperAdmin account exists.');
        setSetupAllowed(false);
      } else {
        setSetupAllowed(true);
      }
    } catch (error) {
      setError('Error checking setup status.');
    } finally {
      setCheckingSetup(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.secretKey !== 'OWNER2024') {
      setError('Invalid setup key. Contact system administrator.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/setup-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          secretKey: formData.secretKey
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Owner account created successfully! You can now login.');
        navigate('/owner-access');
      } else {
        setError(data.message || 'Setup failed');
      }
    } catch (error) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Checking setup status...
      </div>
    );
  }

  if (!setupAllowed) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔒</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Setup Not Available</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          SuperAdmin account already exists.<br />
          This setup can only be used once.
        </p>
        <a
          href="/owner-access"
          style={{
            padding: '1rem 2rem',
            background: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1 className="auth-logo">⚙️</h1>
          <h2 className="auth-tagline">First-Time Setup</h2>
          <p className="auth-description">
            Create the main owner account.
            <br />
            This can only be done once.
          </p>
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            <p>⚠️ <strong>Important:</strong></p>
            <p style={{ marginTop: '0.5rem' }}>
              This creates the SuperAdmin account with full system control.
              Keep credentials secure.
            </p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Create Owner Account</h2>
          <p className="auth-form-subtitle">One-time setup process</p>

          {error && (
            <div style={{
              padding: '1rem',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="owner@yourdomain.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Setup Key</label>
              <input
                type="password"
                name="secretKey"
                className="form-input"
                placeholder="Enter setup key"
                value={formData.secretKey}
                onChange={handleChange}
                required
              />
              <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
                Setup key: <strong>OWNER2024</strong>
              </p>
            </div>

            <button
              type="submit"
              className="form-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Owner Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupOwner;