import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    newsletterSubscription: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleToggle = async (setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    setSettings(newSettings);
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/patient/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      setSettings(settings);
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long!');
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setError('Error changing password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '#e5e7eb' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
      { strength: 1, label: 'Very Weak', color: '#ef4444' },
      { strength: 2, label: 'Weak', color: '#f97316' },
      { strength: 3, label: 'Fair', color: '#eab308' },
      { strength: 4, label: 'Strong', color: '#22c55e' },
      { strength: 5, label: 'Very Strong', color: '#10b981' }
    ];
    return levels[Math.min(score, 5) - 1] || { strength: 0, label: '', color: '#e5e7eb' };
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const pwStrength = getPasswordStrength(passwordData.newPassword);

  const settingsOptions = [
    { key: 'emailNotifications', icon: '📧', title: 'Email Notifications', description: 'Receive appointment updates and alerts via email', badge: 'Recommended' },
    { key: 'smsNotifications', icon: '📱', title: 'SMS Notifications', description: 'Receive text message alerts on your phone', badge: null },
    { key: 'appointmentReminders', icon: '⏰', title: 'Appointment Reminders', description: 'Get reminded about upcoming appointments 24hrs before', badge: 'Recommended' },
    { key: 'newsletterSubscription', icon: '📰', title: 'Newsletter Subscription', description: 'Receive health tips and clinic updates monthly', badge: null }
  ];

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="main-content">
          <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="dashboard-content"><h1 className="page-title">Loading Settings...</h1></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-content">
        <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="dashboard-content">
          <h1 className="page-title">⚙️ Settings</h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Account Info */}
              <div className="section-card">
                <h2 style={{ marginBottom: '1.5rem', color: '#2c3544', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>👤</span> Account Information
                </h2>
                <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', borderRadius: '12px', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #00c9b7, #00a896)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1.5rem', flexShrink: 0 }}>
                    {user.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>{user.name || 'Patient'}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>{user.email}</div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <button
                        onClick={() => window.location.href = '/patient/my-profile'}
                        style={{ padding: '0.4rem 1rem', background: '#00c9b7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                      >
                        Edit Profile →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ color: '#2c3544', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <span>🔔</span> Notification Preferences
                  </h2>
                  {savingSettings && <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Saving...</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {settingsOptions.map((option, index) => (
                    <div key={option.key} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1.25rem 0', borderBottom: index < settingsOptions.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ color: '#2c3544', fontWeight: '600', fontSize: '0.95rem' }}>{option.title}</div>
                            {option.badge && <span style={{ padding: '2px 8px', background: '#d1fae5', color: '#065f46', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700' }}>{option.badge}</span>}
                          </div>
                          <div style={{ color: '#6c757d', fontSize: '0.82rem', marginTop: '0.15rem' }}>{option.description}</div>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer', flexShrink: 0 }}>
                        <input type="checkbox" checked={settings[option.key]} onChange={() => handleToggle(option.key)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settings[option.key] ? '#00c9b7' : '#cbd5e1', transition: '.3s', borderRadius: '28px' }}>
                          <span style={{ position: 'absolute', height: '22px', width: '22px', left: settings[option.key] ? '26px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.3s', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></span>
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Change Password */}
              <div className="section-card">
                <h2 style={{ marginBottom: '1.5rem', color: '#2c3544', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🔒</span> Change Password
                </h2>

                {message && (
                  <div style={{ padding: '0.75rem 1rem', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', color: '#065f46', marginBottom: '1rem', fontWeight: '600' }}>
                    {message}
                  </div>
                )}
                {error && (
                  <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', marginBottom: '1rem', fontWeight: '600' }}>
                    ❌ {error}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                  {[
                    { name: 'currentPassword', label: 'Current Password', key: 'current' },
                    { name: 'newPassword', label: 'New Password', key: 'new' },
                    { name: 'confirmPassword', label: 'Confirm New Password', key: 'confirm' }
                  ].map(field => (
                    <div className="form-group" key={field.name}>
                      <label className="form-label">{field.label} *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords[field.key] ? 'text' : 'password'}
                          name={field.name}
                          className="form-input"
                          value={passwordData[field.name]}
                          onChange={handlePasswordChange}
                          required
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          style={{ paddingRight: '3rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#6c757d' }}
                        >
                          {showPasswords[field.key] ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {/* Password strength bar for new password */}
                      {field.name === 'newPassword' && passwordData.newPassword && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= pwStrength.strength ? pwStrength.color : '#e5e7eb', transition: 'background 0.3s' }}></div>
                            ))}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: pwStrength.color, fontWeight: '600' }}>{pwStrength.label}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="form-button"
                    disabled={changingPassword}
                    style={{ background: changingPassword ? '#94a3b8' : '#00c9b7' }}
                  >
                    {changingPassword ? '⏳ Changing Password...' : '🔒 Update Password'}
                  </button>
                </form>
              </div>

              {/* Privacy & Data */}
              <div className="section-card">
                <h2 style={{ marginBottom: '1rem', color: '#2c3544', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🛡️</span> Privacy & Data
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { icon: '📊', title: 'Data Sharing', desc: 'Your medical data is only shared with your treating doctors', color: '#d1fae5' },
                    { icon: '🔐', title: 'Two-Factor Auth', desc: 'Contact admin to enable 2FA for extra security', color: '#eff6ff' },
                    { icon: '📋', title: 'Data Export', desc: 'Request a copy of your medical records from your doctor', color: '#fef3c7' }
                  ].map(item => (
                    <div key={item.title} style={{ padding: '0.75rem 1rem', background: item.color, borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.82rem', color: '#6c757d', marginTop: '0.15rem' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;