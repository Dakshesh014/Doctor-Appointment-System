import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';
import './Security.css';

const Security = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Local Settings State (Since there's no dedicated system settings API yet, we simulate it)
  const [settings, setSettings] = useState({
    require2FA: true,
    strictPasswords: true,
    sessionTimeout: true,
    blockMultipleLogins: false,
    publicRegistration: true,
    maintenanceMode: false
  });

  useEffect(() => {
    fetchSecurityAlerts();
  }, []);

  const fetchSecurityAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/superadmin/security/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const saveSettings = () => {
    // Simulated API call
    alert('Global security settings have been updated and applied to all instances.');
  };

  return (
    <div className="dashboard-layout">
      <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <SuperAdminTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content security-container">
          <div className="premium-header">
            <h1 className="premium-title">🛡️ System Security Center</h1>
          </div>

          <div className="security-grid">
            
            {/* Left Column: Settings */}
            <div className="security-main">
              
              <div className="security-card">
                <div className="card-header">
                  <div className="header-icon icon-blue">🔒</div>
                  <h2 className="card-title">Authentication Policies</h2>
                </div>
                
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Require Two-Factor Authentication (2FA)</h4>
                    <p>Enforce 2FA for all Admin and Doctor accounts upon next login.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.require2FA} onChange={() => handleToggle('require2FA')} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Strict Password Requirements</h4>
                    <p>Require minimum 12 characters, numbers, and special symbols for all new passwords.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.strictPasswords} onChange={() => handleToggle('strictPasswords')} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Prevent Concurrent Logins</h4>
                    <p>Block users from being logged into the same account from multiple devices simultaneously.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.blockMultipleLogins} onChange={() => handleToggle('blockMultipleLogins')} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="security-card">
                <div className="card-header">
                  <div className="header-icon icon-purple">⚙️</div>
                  <h2 className="card-title">System Controls</h2>
                </div>
                
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Allow Public Doctor Registration</h4>
                    <p>If disabled, doctors can only be created manually by Admins.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.publicRegistration} onChange={() => handleToggle('publicRegistration')} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Maintenance Mode</h4>
                    <p>Disables frontend access for non-SuperAdmins. Shows a "Down for Maintenance" page.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.maintenanceMode} onChange={() => handleToggle('maintenanceMode')} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <button onClick={saveSettings} className="btn-save-settings">
                  💾 Save Global Security Configuration
                </button>
              </div>

            </div>

            {/* Right Column: Active Threats / Alerts */}
            <div className="security-sidebar">
              <div className="security-card" style={{ height: '100%' }}>
                <div className="card-header">
                  <div className="header-icon icon-red">⚠️</div>
                  <h2 className="card-title">Recent Event Alerts</h2>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>Scanning logs...</div>
                ) : alerts.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    No security threats or critical actions detected recently.
                  </div>
                ) : (
                  <div className="alerts-list">
                    {alerts.map((alert, index) => (
                      <div key={alert.id || index} className={`alert-item severity-${alert.severity}`}>
                        <div className="alert-icon">
                          {alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                        </div>
                        <div className="alert-content">
                          <h4>Elevated Action Detected</h4>
                          <p>{alert.message}</p>
                          <div className="alert-meta">
                            <span>Actor: {alert.user}</span>
                            <span>IP: {alert.ip || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
