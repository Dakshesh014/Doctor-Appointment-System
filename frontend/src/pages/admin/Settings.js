import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    clinicianRegistration: true,
    patientSelfOnboarding: true,
    maintenanceMode: false,
    systemName: 'CareSync Pro',
    contactEmail: 'admin@caresync.com'
  });

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSystemSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async (updates) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setSystemSettings(data.data);
        setMessage('✅ System configuration updated successfully');
        setTimeout(() => setMessage(''), 3000);
      }
      setLoading(false);
    } catch (error) {
      console.error('Update failed:', error);
      setLoading(false);
    }
  };

  const handleToggle = (setting) => {
    const newVal = !systemSettings[setting];
    updateSettings({ [setting]: newVal });
  };

  const handleIdentityUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {
      name: formData.get('name'),
      email: formData.get('email')
    };

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setMessage('✅ Profile identity updated successfully');
        setTimeout(() => setMessage(''), 3000);
      }
      setLoading(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        <div className="dashboard-content" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>System Preferences</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Configure portal-wide parameters and manage your administrative profile</p>
            </div>
            {message && <div style={{ background: '#fefce8', color: '#854d0e', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '700', border: '1px solid #fef08a' }}>{message}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
             {/* Settings Navigation */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { id: 'profile', label: 'Admin Profile', icon: '👤' },
                  { id: 'security', label: 'Security & Access', icon: '🛡️' },
                  { id: 'system', label: 'Portal Config', icon: '⚙️' },
                  { id: 'appearance', label: 'UI & Branding', icon: '🎨' },
                  { id: 'database', label: 'Data Management', icon: '🗄️' }
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveSection(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '16px', border: 'none', background: activeSection === item.id ? '#667eea' : 'white', color: activeSection === item.id ? 'white' : '#4a5568', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: '0.2s', textAlign: 'left', boxShadow: activeSection === item.id ? '0 10px 15px -3px rgba(102,126,234,0.25)' : 'none' }}>
                     <span style={{ fontSize: '1.2rem' }}>{item.icon}</span> {item.label}
                  </button>
                ))}
             </div>

             {/* Settings Content */}
             <div style={{ background: 'white', borderRadius: '28px', border: '1px solid #e2e8f0', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                {activeSection === 'profile' && (
                  <div>
                     <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#1a202c' }}>Administrative Identity</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', fontWeight: '800' }}>{user.name?.charAt(0)}</div>
                        <div>
                           <button style={{ padding: '0.6rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginBottom: '0.5rem' }}>Upload Avatar</button>
                           <p style={{ margin: 0, fontSize: '0.75rem', color: '#a0aec0' }}>Allowed JPG, GIF or PNG. Max size of 800kB</p>
                        </div>
                     </div>
                     <form onSubmit={handleIdentityUpdate}>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          <div>
                             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Name</label>
                             <input name="name" type="text" defaultValue={user.name} style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }} />
                          </div>
                          <div>
                             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Email Address</label>
                             <input name="email" type="email" defaultValue={user.email} disabled style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: '0.95rem', cursor: 'not-allowed' }} />
                          </div>
                       </div>
                       <button type="submit" disabled={loading} style={{ marginTop: '2.5rem', padding: '1rem 2rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>{loading ? 'Processing...' : 'Update Identity'}</button>
                     </form>
                  </div>
                )}

                {activeSection === 'system' && (
                  <div>
                     <h3 style={{ margin: '0 0 2.5rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#1a202c' }}>Portal Configuration</h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {[
                          { id: 'clinicianRegistration', label: 'Clinician Registration', desc: 'Allow new doctors to apply for portal access via registration page.' },
                          { id: 'patientSelfOnboarding', label: 'Patient Self-Onboarding', desc: 'Enable guest users to create patient accounts autonomously.' },
                          { id: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Lock the portal for all non-admin users for system updates.' }
                        ].map(s => {
                          const active = systemSettings[s.id];
                          return (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                               <div style={{ maxWidth: '400px' }}>
                                  <div style={{ fontWeight: '800', color: '#2d3748', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.label}</div>
                                  <div style={{ fontSize: '0.85rem', color: '#718096' }}>{s.desc}</div>
                               </div>
                               <div onClick={() => handleToggle(s.id)} style={{ width: '50px', height: '26px', background: active ? '#10b981' : '#cbd5e0', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                                  <div style={{ position: 'absolute', top: '3px', left: active ? '27px' : '3px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.2s' }}></div>
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                )}

                {activeSection === 'security' && (
                   <div style={{ maxWidth: '600px' }}>
                      <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#1a202c' }}>Access & Credentials</h3>
                      
                      <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #3b82f620', marginBottom: '2.5rem' }}>
                         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                               <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                               <div>
                                  <div style={{ fontWeight: '800', color: '#1e40af', fontSize: '0.9rem' }}>Two-Factor Authentication</div>
                                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#3b82f6', lineHeight: '1.5' }}>Protect your account with an extra layer of security via simulated MFA.</p>
                               </div>
                            </div>
                            <button 
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await fetch('http://localhost:5000/api/admin/profile/2fa', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ enabled: true })
                                  });
                                  const data = await res.json();
                                  alert(data.message);
                                } catch (e) { alert('Failed to toggle 2FA'); }
                              }}
                              style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Configure
                            </button>
                         </div>
                      </div>

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const current = e.target.currentPassword.value;
                        const newPass = e.target.newPassword.value;
                        if (!current || !newPass) return alert('Both fields are required');
                        
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch('http://localhost:5000/api/admin/profile/password', {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ currentPassword: current, newPassword: newPass })
                          });
                          const data = await res.json();
                          alert(data.message);
                          if (res.ok) e.target.reset();
                        } catch (err) { alert('Update failed'); }
                      }}>
                        <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '400px' }}>
                           <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Password</label>
                              <input name="currentPassword" type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                           </div>
                           <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase', marginBottom: '0.5rem' }}>New Secure Password</label>
                              <input name="newPassword" type="password" style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                           </div>
                        </div>
                        <button type="submit" style={{ marginTop: '2rem', padding: '1rem 2rem', background: '#1a202c', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>Rotate Credentials</button>
                      </form>
                   </div>
                )}

                {activeSection !== 'profile' && activeSection !== 'system' && activeSection !== 'security' && (
                  <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>
                     <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
                     <h3>Configurable Advanced module coming soon</h3>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;