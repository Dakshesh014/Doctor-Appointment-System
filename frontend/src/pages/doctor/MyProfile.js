import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodType: '',
    allergies: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/profile', {
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
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          bloodType: data.bloodType || '',
          allergies: data.allergies || ''
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Auto trigger upload
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedImage;
    if (!file) return;

    setUploadingImage(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const uploadData = new FormData();
      uploadData.append('profileImage', file);

      const response = await fetch('http://localhost:5000/api/doctor/profile/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Profile image updated successfully!');
        setSelectedImage(null);
        setImagePreview(null);
        await fetchProfile();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to upload image');
      }
    } catch (error) {
      setError('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/profile/image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('✅ Photo removed');
        await fetchProfile();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setError('Error deleting image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Profile info updated successfully!');
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
    return name ? name.charAt(0).toUpperCase() : 'D';
  };

  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (user?.profileImage) return `http://localhost:5000${user.profileImage}`;
    return null;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DoctorSidebar />
        <div className="main-content">
          <DoctorTopNav />
          <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
              <h2 style={{ color: '#2c3544' }}>Loading Profile...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DoctorSidebar />
      
      <div className="main-content">
        <DoctorTopNav />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>👤</span> My Profile
              </h1>
              <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>Manage your personal information and clinical settings</p>
            </div>
            
            <button 
              onClick={() => setEditMode(!editMode)}
              style={{
                padding: '0.75rem 1.5rem',
                background: editMode ? '#f1f5f9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: editMode ? '#475569' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                boxShadow: editMode ? 'none' : '0 4px 6px rgba(102, 126, 234, 0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {editMode ? '✕ Cancel Editing' : '✏️ Edit Profile'}
            </button>
          </div>

          {message && (
            <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Left Column: Avatar & Quick Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="section-card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  {getProfileImageUrl() ? (
                    <img
                      src={getProfileImageUrl()}
                      alt="Profile"
                      style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '4px solid white',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3.5rem',
                      color: 'white',
                      fontWeight: '700',
                      border: '4px solid white',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                      {getInitial(user?.name)}
                    </div>
                  )}

                  {/* Camera overlay button */}
                  {editMode && (
                    <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#ffffff', borderRadius: '50%', padding: '0.35rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="profile-image-input" />
                      <label htmlFor="profile-image-input" style={{ cursor: 'pointer', background: '#3b82f6', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}>
                        📷
                      </label>
                    </div>
                  )}
                </div>

                <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.25rem', fontWeight: '700' }}>
                  Dr. {user?.name || 'Doctor'}
                </h2>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.85rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1rem'
                }}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
                
                {editMode && user?.profileImage && (
                  <button onClick={handleDeleteImage} style={{ fontSize: '0.85rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Remove Photo
                  </button>
                )}

                {!editMode && (
                  <div style={{ width: '100%', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>✉️</span> {user?.email}
                    </div>
                    <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>📞</span> {user?.phone || 'No phone added'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>📍</span> {user?.address || 'No location added'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Settings / Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Personal Details</h3>
                </div>

                <div style={{ padding: '2rem' }}>
                  {!editMode ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Full Name</div>
                        <div style={{ color: '#1e293b', fontWeight: '500' }}>Dr. {user?.name || 'Not provided'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date of Birth</div>
                        <div style={{ color: '#1e293b', fontWeight: '500' }}>{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Gender</div>
                        <div style={{ color: '#1e293b', fontWeight: '500' }}>{user?.gender || 'Not provided'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Blood Type</div>
                        <div style={{ color: '#1e293b', fontWeight: '500' }}>{user?.bloodType || 'Not provided'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Emergency Contact</div>
                        <div style={{ color: '#1e293b', fontWeight: '500' }}>{user?.emergencyContact || 'Not provided'}</div>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Medical Allergies</div>
                        <div style={{ color: '#1e293b', fontWeight: '500' }}>{user?.allergies || 'None recorded'}</div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Email Address (Read-Only)</label>
                        <input type="email" value={formData.email} disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#e2e8f0', cursor: 'not-allowed', color: '#64748b' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                      </div>
                      <div>
                         <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Date of Birth</label>
                         <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                         <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Blood Type</label>
                         <select name="bloodType" value={formData.bloodType} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                            <option value="">Select</option>
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                         </select>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Emergency Contact Name & Number</label>
                        <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Allergies</label>
                        <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows="2" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', resize: 'vertical' }}></textarea>
                      </div>

                      <div style={{ gridColumn: 'span 2', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                         <button type="button" onClick={() => setEditMode(false)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                         <button type="submit" style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>Save Changes</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Clinic / Prescription Template Card */}
              <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>📄 Prescription Letterhead</h3>
                </div>
                <div style={{ padding: '2rem' }}>
                  <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    Upload an image or PDF of your clinic's letterhead. This will be used as a standardized background when generating printable prescription PDFs for your patients.
                  </p>

                  <div style={{ 
                    border: '2px dashed #cbd5e1', 
                    borderRadius: '12px', 
                    padding: '2.5rem 2rem', 
                    textAlign: 'center',
                    background: user?.prescriptionTemplate ? 'white' : '#f8fafc',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}>
                    {user?.prescriptionTemplate ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                          📄
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#1e293b' }}>Template Active</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{user.prescriptionTemplate.split('/').pop()}</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                          <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} id="template-upload-input" onChange={async (e) => {
                             const file = e.target.files[0];
                             if (!file) return;
                             const formData = new FormData(); formData.append('template', file);
                             try {
                               const token = localStorage.getItem('token');
                               const response = await fetch('http://localhost:5000/api/doctor/profile/prescription-template', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                               if (response.ok) { setMessage('✅ Template replaced!'); await fetchProfile(); setTimeout(() => setMessage(''), 3000); } else { setError('Error uploading template.'); }
                             } catch (err) { setError('Upload failed'); }
                          }} />
                          <label htmlFor="template-upload-input" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                            Replace
                          </label>
                          <button onClick={async () => {
                             if (!window.confirm('Delete this template? Prescriptions will use plain white background.')) return;
                             try {
                               const token = localStorage.getItem('token');
                               const response = await fetch('http://localhost:5000/api/doctor/profile/prescription-template', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                               if (response.ok) { setMessage('✅ Template deleted'); await fetchProfile(); setTimeout(() => setMessage(''), 3000); }
                             } catch (error) { setError('Error deleting template'); }
                          }} style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                         <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                           📭
                         </div>
                         <p style={{ margin: 0, fontWeight: '500', color: '#475569' }}>No letterhead uploaded</p>
                         <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>Supports images or PDF (Max 10MB)</p>
                         <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} id="template-upload-input" onChange={async (e) => {
                             const file = e.target.files[0];
                             if (!file) return;
                             const formData = new FormData(); formData.append('template', file);
                             try {
                               const token = localStorage.getItem('token');
                               const response = await fetch('http://localhost:5000/api/doctor/profile/prescription-template', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                               if (response.ok) { setMessage('✅ Template uploaded!'); await fetchProfile(); setTimeout(() => setMessage(''), 3000); } else { setError('Error uploading template.'); }
                             } catch (err) { setError('Upload failed'); }
                          }} />
                         <label htmlFor="template-upload-input" style={{ padding: '0.6rem 1.5rem', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)' }}>
                           Upload Letterhead
                         </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;