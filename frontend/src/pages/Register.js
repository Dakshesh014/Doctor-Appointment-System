import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    // Doctor specific fields
    specialization: '',
    licenseNumber: '',
    qualification: '',
    experience: '',
    // SuperAdmin specific
    secretKey: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Doctor field validation
    if (formData.role === 'doctor') {
      if (!formData.specialization || !formData.licenseNumber || !formData.qualification) {
        setError('Please fill all doctor-specific fields');
        return;
      }
    }

    // Superadmin field validation
    if (formData.role === 'superadmin' && !formData.secretKey) {
      setError('Setup secret key is required for SuperAdmin registration');
      return;
    }

    setLoading(true);

    try {
      const endpoint = formData.role === 'superadmin'
        ? 'http://localhost:5000/api/auth/setup-owner'
        : 'http://localhost:5000/api/auth/register';

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        qualification: formData.qualification,
        experience: formData.experience
      };

      if (formData.role === 'superadmin') {
        payload.secretKey = formData.secretKey;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Show different messages based on role
        let message = 'Registration successful! Please login.';
        if (formData.role === 'superadmin') {
          message = 'Owner account created successfully! You can now login.';
        } else if (formData.role === 'doctor') {
          message = 'Doctor registration submitted! Please wait for admin/superadmin approval before logging in.';
        } else if (formData.role === 'admin') {
          message = 'Admin registration submitted! Please wait for superadmin approval before logging in.';
        }

        alert(message);
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side - Branding */}
      <div className="auth-left">
        <div className="auth-branding">
          <div className="brand-icon">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="30" fill="white" opacity="0.1" />
              <path d="M30 15C21.7 15 15 21.7 15 30C15 38.3 21.7 45 30 45C38.3 45 45 38.3 45 30C45 21.7 38.3 15 30 15ZM30 42C23.4 42 18 36.6 18 30C18 23.4 23.4 18 30 18C36.6 18 42 23.4 42 30C42 36.6 36.6 42 30 42Z" fill="white" />
              <path d="M35 28H32V25C32 23.9 31.1 23 30 23C28.9 23 28 23.9 28 25V28H25C23.9 28 23 28.9 23 30C23 31.1 23.9 32 25 32H28V35C28 36.1 28.9 37 30 37C31.1 37 32 36.1 32 35V32H35C36.1 32 37 31.1 37 30C37 28.9 36.1 28 35 28Z" fill="white" />
            </svg>
          </div>
          <h1 className="brand-title">Join Our Healthcare Community</h1>
          <p className="brand-subtitle">Start your journey to better health</p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Quick & Easy Registration</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Instant Access to Services</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Secure Data Protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-description">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role Selection */}
            <div className="form-group">
              <label className="auth-label">Register as</label>
              <div className="role-selector">
                <label className={`role-option ${formData.role === 'patient' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === 'patient'}
                    onChange={handleChange}
                  />
                  <div className="role-content">
                    <div className="role-icon">👤</div>
                    <span>Patient</span>
                  </div>
                </label>
                <label className={`role-option ${formData.role === 'doctor' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={formData.role === 'doctor'}
                    onChange={handleChange}
                  />
                  <div className="role-content">
                    <div className="role-icon">⚕️</div>
                    <span>Doctor</span>
                  </div>
                </label>
                <label className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                  />
                  <div className="role-content">
                    <div className="role-icon">👨‍💼</div>
                    <span>Admin</span>
                  </div>
                </label>
                <label className={`role-option ${formData.role === 'superadmin' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="superadmin"
                    checked={formData.role === 'superadmin'}
                    onChange={handleChange}
                  />
                  <div className="role-content">
                    <div className="role-icon">👑</div>
                    <span>Owner</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Approval Notice */}
            {(formData.role === 'doctor' || formData.role === 'admin') && (
              <div className="auth-notice-warning">
                <strong>⚠️ Note:</strong> {formData.role === 'doctor' ? 'Doctor' : 'Admin'} registration requires approval from {formData.role === 'doctor' ? 'admin/superadmin' : 'superadmin'} before you can login.
              </div>
            )}

            {/* Full Name */}
            <div className="form-group">
              <label className="auth-label">Full Name</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  name="name"
                  className="auth-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="auth-label">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* SuperAdmin Specific Field */}
            {formData.role === 'superadmin' && (
              <div className="form-group">
                <label className="auth-label" style={{ color: '#ef4444' }}>Setup Secret Key *</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="password"
                    name="secretKey"
                    className="auth-input"
                    placeholder="Enter owner verification key"
                    value={formData.secretKey}
                    onChange={handleChange}
                    style={{ borderColor: '#fca5a5' }}
                    required
                  />
                </div>
              </div>
            )}

            {/* Doctor Specific Fields */}
            {formData.role === 'doctor' && (
              <>
                <div className="form-group">
                  <label className="auth-label">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    className="auth-input"
                    placeholder="e.g., Cardiology, Neurology"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="auth-label">License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="auth-input"
                    placeholder="Medical license number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="auth-label">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    className="auth-input"
                    placeholder="e.g., MBBS, MD"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="auth-label">Years of Experience</label>
                  <input
                    type="number"
                    name="experience"
                    className="auth-input"
                    placeholder="Years"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div className="form-group">
              <label className="auth-label">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  type="password"
                  name="password"
                  className="auth-input"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="auth-label">Confirm Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  type="password"
                  name="confirmPassword"
                  className="auth-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <div className="form-extras">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>I agree to the Terms & Conditions</span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-footer">
            <p>Already have an account? <a href="/login" className="signup-link">Login</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;