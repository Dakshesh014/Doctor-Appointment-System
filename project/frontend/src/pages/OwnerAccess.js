import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OwnerAccess = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    secretKey: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (!formData.secretKey || !formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
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
          secretKey: formData.secretKey,
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ SuperAdmin account created successfully! Redirecting to SuperAdmin login...');
        navigate('/owner-access');
      } else {
        setError(data.message || 'Setup failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '3rem',
        width: '100%',
        maxWidth: '500px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2.5rem'
          }}>
            👑
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#2c3544', marginBottom: '0.5rem' }}>
            SuperAdmin Setup
          </h1>
          <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
            Create the master administrator account
          </p>
        </div>

        {/* Warning Box */}
        <div style={{
          padding: '1rem',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
            ⚠️ <strong>Important:</strong> This is a one-time setup. The secret key is: <code style={{
              background: '#fff',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontWeight: '700'
            }}>OWNER2024</code>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: '#991b1b'
          }}>
            <strong>❌ {error}</strong>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3544'
            }}>
              Secret Key *
            </label>
            <input
              type="text"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              placeholder="Enter secret key"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3544'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3544'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3544'
            }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3544'
            }}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {loading ? '⏳ Creating Account...' : '👑 Create SuperAdmin Account'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/owner-access')}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Already have account? Login Here
          </button>
        </form>

        {/* Info Box */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#0369a1'
        }}>
          <p style={{ margin: 0 }}>
            ℹ️ After setup, you'll be redirected to the SuperAdmin login page to access your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerAccess;