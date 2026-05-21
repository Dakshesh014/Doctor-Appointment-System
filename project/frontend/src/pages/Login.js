import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient' // Default role
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
      const endpoint = formData.role === 'superadmin' 
        ? 'http://localhost:5000/api/auth/superadmin-login'
        : 'http://localhost:5000/api/auth/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        switch (data.user.role) {
          case 'patient':
            navigate('/patient/dashboard');
            break;
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'superadmin':
            navigate('/superadmin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side - Branding */}
      <div className="auth-left">
        <div className="login-icon-container">
          🏥
        </div>
        <h1 className="brand-title auth-brand-title">
          Doctor Management System
        </h1>
        <p className="brand-subtitle auth-brand-subtitle">
          Comprehensive healthcare management platform for patients, doctors, and administrators
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-right">
        <div className="auth-form-container auth-form-container-inner">
          {/* Header */}
          <div className="auth-header">
            <h2 className="auth-title">
              Welcome Back! 👋
            </h2>
            <p className="auth-description">
              Please login to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error">
              <strong>❌ {error}</strong>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role Selection */}
            <div className="form-group">
              <label className="auth-label">
                Login As *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="login-select"
              >
                <option value="patient">👤 Patient</option>
                <option value="doctor">⚕️ Doctor</option>
                <option value="admin">🛡️ Admin</option>
                <option value="superadmin">👑 SuperAdmin</option>
              </select>
              <small className="login-helper-text">
                Select your account type
              </small>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="auth-label">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="auth-input"
              />
            </div>

            {/* Password */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? '⏳ Logging in...' : '🔐 Login'}
            </button>

            {/* Register Link */}
            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="login-link-btn"
                >
                  Register Here
                </button>
              </p>
            </div>
          </form>

          {/* END OF FORM - NO SUPERADMIN LINK */}
        </div>
      </div>
    </div>
  );
};

export default Login;