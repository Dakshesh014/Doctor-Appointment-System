import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const MyProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    bloodType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    allergies: '',
    medicalHistory: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          bloodType: data.bloodType || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || '',
          allergies: data.allergies || '',
          medicalHistory: data.medicalHistory || ''
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Error loading profile' });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
        setEditing(false);
        
        // Update localStorage user
        const user = JSON.parse(localStorage.getItem('user'));
        user.name = profile.name;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Refresh profile data
        await fetchProfile();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || '❌ Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: '❌ Error updating profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setMessage({ type: '', text: '' });
    fetchProfile(); // Reset to original data
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar />
        <div className="main-content">
          <PatientTopNav />
          <div className="dashboard-content">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '80vh',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '3rem' }}>⏳</div>
              <h1 className="page-title">Loading Profile...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      
      <div className="main-content">
        <PatientTopNav />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="page-title">👤 My Profile</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#4a9eff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {/* Success/Error Message */}
          {message.text && (
            <div style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              borderRadius: '8px',
              background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>
                {message.type === 'success' ? '✓' : '⚠️'}
              </span>
              <span>{message.text}</span>
            </div>
          )}

          <div className="section-card">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  marginBottom: '1.5rem', 
                  color: '#2c3544',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  📋 Personal Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="form-input"
                      disabled={!editing}
                      required
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      className="form-input"
                      disabled
                      style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                      title="Email cannot be changed"
                    />
                    <small style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
                      Email cannot be changed
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter phone number"
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                      className="form-select"
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profile.dateOfBirth}
                      onChange={handleChange}
                      className="form-input"
                      disabled={!editing}
                      max={new Date().toISOString().split('T')[0]}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <select
                      name="bloodType"
                      value={profile.bloodType}
                      onChange={handleChange}
                      className="form-select"
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  marginBottom: '1.5rem', 
                  color: '#2c3544',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  📍 Address Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter street address"
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter city"
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      value={profile.state}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter state"
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={profile.zipCode}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter zip code"
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  marginBottom: '1.5rem', 
                  color: '#2c3544',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  🚨 Emergency Contact
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={profile.emergencyContact}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter emergency contact name"
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={profile.emergencyPhone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter emergency contact phone"
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  marginBottom: '1.5rem', 
                  color: '#2c3544',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  ⚕️ Medical Information
                </h3>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Known Allergies</label>
                    <textarea
                      name="allergies"
                      value={profile.allergies}
                      onChange={handleChange}
                      className="form-textarea"
                      rows="3"
                      placeholder="e.g., Penicillin, Peanuts, Latex, etc."
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                    <small style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
                      Separate multiple allergies with commas
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Medical History</label>
                    <textarea
                      name="medicalHistory"
                      value={profile.medicalHistory}
                      onChange={handleChange}
                      className="form-textarea"
                      rows="4"
                      placeholder="Any chronic conditions, past surgeries, family history, etc."
                      disabled={!editing}
                      style={!editing ? { background: '#f9fafb' } : {}}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'flex-end', 
                  marginTop: '2rem',
                  paddingTop: '2rem',
                  borderTop: '2px solid #e5e7eb'
                }}>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    style={{
                      padding: '0.75rem 2rem',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    ✕ Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.75rem 2rem',
                      background: saving ? '#94a3b8' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {saving ? (
                      <>
                        <span>⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* View Mode Info */}
              {!editing && (
                <div style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: '#0369a1' }}>
                    ℹ️ Click "Edit Profile" button above to update your information
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;