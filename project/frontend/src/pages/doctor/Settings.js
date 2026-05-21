import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const DoctorSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    newsletterSubscription: false
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');

  // Password change
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/doctor/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (error) { console.error(error); }
  };

  const handleNotifToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    setNotifMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/doctor/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(notifications)
      });
      const data = await res.json();
      setNotifMessage(res.ok ? '✅ Settings saved!' : data.message);
      setTimeout(() => setNotifMessage(''), 3000);
    } catch (error) { setNotifMessage('Error saving settings'); }
    setNotifSaving(false);
  };

  const getPasswordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return { score, label: ['', 'Weak', 'Fair', 'Good', 'Strong'][score], color: ['', '#ef4444', '#f59e0b', '#10b981', '#0ea5e9'][score] };
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage('');
    setPwdError('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters');
      return;
    }
    setPwdSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/doctor/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMessage('✅ Password changed successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwdError(data.message || 'Failed to change password');
      }
    } catch (error) { setPwdError('Error changing password'); }
    setPwdSaving(false);
  };

  const pwdStrength = getPasswordStrength(passwords.newPassword);

  const ToggleSwitch = ({ checked, onChange }) => (
    <div onClick={onChange} style={{
      width: '52px', height: '28px', borderRadius: '14px', background: checked ? '#667eea' : '#d1d5db',
      cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0
    }}>
      <div style={{
        position: 'absolute', top: '3px', left: checked ? '27px' : '3px',
        width: '22px', height: '22px', background: 'white', borderRadius: '50%',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.3s'
      }} />
    </div>
  );

  const PasswordInput = ({ field, placeholder, label }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPasswords[field] ? 'text' : 'password'}
          className="form-input"
          placeholder={placeholder}
          value={passwords[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
          onChange={e => setPasswords(prev => ({ ...prev, [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value }))}
          style={{ paddingRight: '3rem', marginBottom: 0 }}
        />
        <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
          {showPasswords[field] ? '🙈' : '👁️'}
        </button>
      </div>
      {field === 'new' && passwords.newPassword && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= pwdStrength.score ? pwdStrength.color : '#e5e7eb', transition: 'background 0.3s' }} />
            ))}
          </div>
          <div style={{ fontSize: '0.78rem', color: pwdStrength.color, fontWeight: '600' }}>{pwdStrength.label}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-layout">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <DoctorTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="dashboard-content">
          <h1 className="page-title">⚙️ Settings & Preferences</h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>

            {/* Account Info */}
            {user && (
              <div className="section-card" style={{ gridColumn: '1 / -1' }}>
                <h2 style={{ fontWeight: '700', fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>👤</span> Account Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Full Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: 'Role', value: 'Doctor' },
                    { label: 'Specialization', value: user.specialization || 'N/A' }
                  ].map(f => (
                    <div key={f.label} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.78rem', color: '#6c757d', fontWeight: '600', marginBottom: '0.35rem' }}>{f.label}</div>
                      <div style={{ fontWeight: '600', color: '#2c3544', wordBreak: 'break-word' }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notification Settings */}
            <div className="section-card">
              <h2 style={{ fontWeight: '700', fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🔔</span> Notification Preferences
              </h2>

              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive appointment updates via email' },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive text alerts for urgent updates' },
                { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Reminders before each consultation' },
                { key: 'newsletterSubscription', label: 'Medical Newsletter', desc: 'Latest medical news and platform updates' }
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#2c3544', marginBottom: '0.2rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.82rem', color: '#6c757d' }}>{item.desc}</div>
                  </div>
                  <ToggleSwitch checked={notifications[item.key]} onChange={() => handleNotifToggle(item.key)} />
                </div>
              ))}

              {notifMessage && (
                <div style={{ marginTop: '1rem', padding: '0.65rem', background: notifMessage.includes('✅') ? '#d1fae5' : '#fee2e2', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600', color: notifMessage.includes('✅') ? '#065f46' : '#991b1b' }}>
                  {notifMessage}
                </div>
              )}
              <button onClick={handleSaveNotifications} disabled={notifSaving} className="form-button" style={{ marginTop: '1.5rem' }}>
                {notifSaving ? '⏳ Saving...' : '💾 Save Preferences'}
              </button>
            </div>

            {/* Change Password */}
            <div className="section-card">
              <h2 style={{ fontWeight: '700', fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🔒</span> Change Password
              </h2>
              <form onSubmit={handleChangePassword}>
                <PasswordInput field="current" label="Current Password" placeholder="Enter current password" />
                <PasswordInput field="new" label="New Password" placeholder="Enter new password" />
                <PasswordInput field="confirm" label="Confirm New Password" placeholder="Repeat new password" />

                {pwdMessage && (
                  <div style={{ padding: '0.65rem', background: '#d1fae5', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600', color: '#065f46', marginBottom: '1rem' }}>
                    {pwdMessage}
                  </div>
                )}
                {pwdError && (
                  <div style={{ padding: '0.65rem', background: '#fee2e2', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600', color: '#991b1b', marginBottom: '1rem' }}>
                    {pwdError}
                  </div>
                )}
                <button type="submit" disabled={pwdSaving} className="form-button">
                  {pwdSaving ? '⏳ Changing...' : '🔒 Change Password'}
                </button>
              </form>
            </div>

            {/* Privacy & Data */}
            <div className="section-card">
              <h2 style={{ fontWeight: '700', fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🛡️</span> Privacy & Data
              </h2>
              {[
                { icon: '📱', title: 'Two-Factor Authentication', desc: 'Adds an extra layer of security to your account', badge: 'Coming Soon' },
                { icon: '📊', title: 'Session Management', desc: 'Review devices with active sessions', badge: 'Coming Soon' },
                { icon: '📋', title: 'Data Export', desc: 'Download all your patient records and data', badge: 'Coming Soon' }
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.75rem' }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#2c3544' }}>{item.title}</div>
                      <span style={{ padding: '2px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600' }}>{item.badge}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#6c757d' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;