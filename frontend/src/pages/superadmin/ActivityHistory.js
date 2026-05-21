import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';
import './ActivityHistory.css';

const ActivityHistory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/superadmin/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch activity logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeStyle = (action) => {
    if (action.includes('login') || action.includes('auth')) return { class: 'action-login', icon: '🔑' };
    if (action.includes('approve') || action.includes('confirm')) return { class: 'action-approve', icon: '✓' };
    if (action.includes('reject') || action.includes('cancel')) return { class: 'action-reject', icon: '⚠️' };
    if (action.includes('delete') || action.includes('remove')) return { class: 'action-delete', icon: '🗑️' };
    if (action.includes('update') || action.includes('edit')) return { class: 'action-update', icon: '✏️' };
    if (action.includes('create') || action.includes('add')) return { class: 'action-create', icon: '➕' };
    return { class: 'action-default', icon: '📌' };
  };

  return (
    <div className="dashboard-layout">
      <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <SuperAdminTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content history-container">
          <div className="premium-header">
            <h1 className="premium-title">⏱️ Activity Timeline</h1>
          </div>

          <div className="timeline-card">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <h2>Loading complete system history...</h2>
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <h2>No Activity Logged Yet.</h2>
              </div>
            ) : (
              logs.map((log) => {
                const date = new Date(log.createdAt);
                const style = getNodeStyle(log.action);
                
                return (
                  <div key={log._id} className="history-item">
                    
                    <div className="history-date">
                      <div className="date-time">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="date-day">{date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                    </div>
                    
                    <div className={`history-node ${style.class}`}>
                      {style.icon}
                    </div>

                    <div className="history-content">
                      <div className="user-badge">
                        👤 {log.userName} 
                        <span className="badge-role">{log.userRole}</span>
                      </div>
                      
                      <p className="history-desc">
                        {log.description}
                      </p>
                      
                      <div className="history-meta">
                        <div className="meta-item">
                          <span>🎯</span> Action: {log.action.replace('_', ' ').toUpperCase()}
                        </div>
                        {log.targetUser && (
                          <div className="meta-item">
                            <span>👥</span> Target: {log.targetUser}
                          </div>
                        )}
                        <div className="meta-item">
                          <span>🌐</span> IP: <span style={{ fontFamily: 'monospace' }}>{log.ipAddress}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;
