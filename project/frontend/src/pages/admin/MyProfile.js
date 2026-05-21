import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        
        const formattedDate = data.dateOfBirth 
          ? new Date(data.dateOfBirth).toISOString().split('T')[0] 
          : '';
        
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: formattedDate,
          gender: data.gender || '',
          address: data.address || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
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
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Profile updated successfully!');
        setEditMode(false);
        await fetchProfile();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Error updating profile. Please try again.');
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar />
        <div className="main-content">
          <AdminTopNav />
          <div className="dashboard-content">
            <h1 className="page-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      
      <div className="main-content">
        <AdminTopNav />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>My Profile</h1>
            <button 
              className="form-button"
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {message && (
            <div style={{
              padding: '1rem',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '1rem'
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          <div className="section-card">
            {/* Profile Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '2rem', 
              paddingBottom: '2rem', 
              borderBottom: '2px solid #e5e7eb',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'white',
                fontWeight: '700'
              }}>
                {getInitial(user?.name)}
              </div>

              <div>
                <h2 style={{ fontSize: '2rem', color: '#2c3544', marginBottom: '0.5rem' }}>
                  {user?.name || 'Admin'}
                </h2>
                <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  {user?.email}
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: '#4a9eff20',
                  color: '#4a9eff',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  Administrator
                </span>
              </div>
            </div>

            {!editMode ? (
              // View Mode
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#2c3544', marginBottom: '0.5rem' }}>
                    Phone:
                  </label>
                  <p style={{ color: '#6c757d', fontSize: '1rem' }}>
                    {user?.phone || 'Not provided'}
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#2c3544', marginBottom: '0.5rem' }}>
                    Date of Birth:
                  </label>
                  <p style={{ color: '#6c757d', fontSize: '1rem' }}>
                    {user?.dateOfBirth 
                      ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Not provided'}
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#2c3544', marginBottom: '0.5rem' }}>
                    Gender:
                  </label>
                  <p style={{ color: '#6c757d', fontSize: '1rem' }}>
                    {user?.gender || 'Not provided'}
                  </p>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: '600', color: '#2c3544', marginBottom: '0.5rem' }}>
                    Address:
                  </label>
                  <p style={{ color: '#6c757d', fontSize: '1rem' }}>
                    {user?.address || 'Not provided'}
                  </p>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email (Read-only)</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      disabled
                      style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-input"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      className="form-select"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Address</label>
                    <textarea
                      name="address"
                      className="form-textarea"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter your address"
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="form-button" style={{ marginTop: '2rem' }}>
                  Save Changes
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;