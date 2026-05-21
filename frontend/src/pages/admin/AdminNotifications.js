import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AdminNotifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: 'System Announcement',
          message: broadcastMessage,
          type: 'alert'
        })
      });

      if (response.ok) {
        alert('🚀 Broadcast sent to all portal users successfully!');
        setBroadcastMessage('');
        fetchNotifications();
      }
      setSending(false);
    } catch (error) {
      console.error('Broadcast failed:', error);
      setSending(false);
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
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>Communication Hub</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Dispatch system-wide alerts and monitor automated activity logs</p>
            </div>
            <button onClick={fetchNotifications} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#4a5568' }}>🔄 Refresh Logs</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
             
             {/* Notification Dispatch */}
             <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#1a202c' }}>🚀 Global Broadcast</h3>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Send a real-time notification to all active patients, doctors, and staff members across the portal.</p>
                
                <form onSubmit={handleBroadcast}>
                   <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Message Content</label>
                      <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Type your system-wide announcement here..." style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', border: '1px solid #e2e8f0', minHeight: '150px', fontSize: '1rem', outline: 'none', background: '#f8fafc', transition: '0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#667eea'} />
                   </div>
                   <button type="submit" disabled={sending} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(102,126,234,0.3)', transition: '0.2s' }}>{sending ? 'Dispatching...' : 'Dispatch Global Alert'}</button>
                </form>

                <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: '#fffbeb', borderRadius: '16px', border: '1px solid #f59e0b20' }}>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>💡</span>
                      <div>
                         <div style={{ fontWeight: '800', color: '#b45309', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Admin Tip</div>
                         <p style={{ margin: 0, fontSize: '0.8rem', color: '#d97706', lineHeight: '1.5' }}>Use broadcasts for scheduled maintenance, port-wide updates, or critical health alerts.</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Activity Log / Notifications */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.5rem', flex: 1 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1a202c' }}>System Activity</h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#667eea', background: '#667eea10', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>LATEST 10</span>
                   </div>

                   {loading ? (
                      <div style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>⏳ Loading latest events...</div>
                   ) : notifications.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {notifications.map((notif, idx) => (
                           <div key={idx} style={{ padding: '1rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                              <div style={{ fontSize: '1.25rem', background: 'white', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>🔔</div>
                              <div style={{ flex: 1 }}>
                                 <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#2d3748' }}>{notif.action}</div>
                                 <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>{new Date(notif.timestamp).toLocaleString()}</div>
                              </div>
                           </div>
                        ))}
                      </div>
                   ) : (
                      <div style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>No recent activity logs recorded.</div>
                   )}
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;