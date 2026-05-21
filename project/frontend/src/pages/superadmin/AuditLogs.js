import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';
import './AuditLogs.css';

const AuditLogs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/superadmin/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('login') || action.includes('auth')) return 'action-login';
    if (action.includes('approve') || action.includes('confirm')) return 'action-approve';
    if (action.includes('reject') || action.includes('cancel')) return 'action-reject';
    if (action.includes('delete') || action.includes('remove')) return 'action-delete';
    if (action.includes('update') || action.includes('edit')) return 'action-update';
    if (action.includes('create') || action.includes('add')) return 'action-create';
    return 'action-default';
  };

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;
    
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action Type', 'Description', 'Target User', 'IP Address'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        `"${new Date(log.createdAt).toLocaleString()}"`,
        `"${log.userName}"`,
        `"${log.userRole}"`,
        `"${log.action.toUpperCase()}"`,
        `"${log.description}"`,
        `"${log.targetUser || 'N/A'}"`,
        `"${log.ipAddress || 'Unknown'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `System_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetUser && log.targetUser.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;

    return matchesSearch && matchesAction && matchesRole;
  });

  return (
    <div className="dashboard-layout">
      <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <SuperAdminTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content audit-logs-container">
          <div className="premium-header">
            <h1 className="premium-title">🛡️ System Audit Logs</h1>
          </div>

          <div className="actions-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search logs by user, action details, target..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filters-group">
              <select 
                className="filter-select"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="all">All Actions</option>
                <option value="login">Logins</option>
                <option value="approve">Approvals</option>
                <option value="reject">Rejections</option>
                <option value="delete">Deletions</option>
                <option value="update">Updates</option>
                <option value="create">Creations</option>
              </select>

              <select 
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="superadmin">SuperAdmins</option>
                <option value="admin">Admins</option>
                <option value="doctor">Doctors</option>
                <option value="patient">Patients</option>
              </select>

              <button onClick={exportToCSV} className="btn-export">
                📥 Export CSV
              </button>
            </div>
          </div>

          <div className="premium-table-card">
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                <h2>Loading complete audit trail...</h2>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                <h2>No Records Found</h2>
                <p>Try adjusting your search filters.</p>
              </div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor (User)</th>
                    <th>Action Executed</th>
                    <th>Target User</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log._id}>
                      <td className="timestamp">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ fontWeight: '800', color: '#1e293b' }}>{log.userName}</div>
                        <span className="role-badge">{log.userRole}</span>
                      </td>
                      <td>
                        <div style={{ marginBottom: '0.4rem' }}>
                          <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                            {log.action.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.description}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600', color: '#334155' }}>{log.targetUser || '-'}</span>
                      </td>
                      <td>
                        <span className="ip-address">{log.ipAddress || 'Unknown IP'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
