import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';

const SystemStats = () => {

   const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalLogins: 0,
    avgSessionTime: 0,
    registrationsThisWeek: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch dashboard summary
      const summaryRes = await fetch('http://localhost:5000/api/superadmin/dashboard/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const summaryData = await summaryRes.json();

      // Fetch audit logs for login count
      const logsRes = await fetch('http://localhost:5000/api/superadmin/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const logsData = await logsRes.json();

      const loginCount = logsData.filter(log => log.action === 'login').length;

      setStats({
        totalUsers: summaryData.totalAdmins + summaryData.totalDoctors + summaryData.totalPatients,
        activeToday: 0, // Calculate from logs
        totalLogins: loginCount,
        avgSessionTime: '24m',
        registrationsThisWeek: 0, // Calculate from logs
        pendingApprovals: summaryData.securityAlerts || 0
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <SuperAdminSidebar  isOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
        <div className="main-content">
          <SuperAdminTopNav toggleSidebar={toggleSidebar}/>
          <div className="dashboard-content">
            <h1 className="page-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <SuperAdminSidebar  isOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
      
      <div className="main-content">
        <SuperAdminTopNav toggleSidebar={toggleSidebar}/>
        
        <div className="dashboard-content">
          <h1 className="page-title">📊 System Statistics</h1>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
            {/* Total Users */}
            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {stats.totalUsers}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Users</div>
            </div>

            {/* Total Logins */}
            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔓</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {stats.totalLogins}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Logins</div>
            </div>

            {/* Pending Approvals */}
            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {stats.pendingApprovals}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Pending Approvals</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="section-card" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">📈 Activity Trends</h2>
            <div style={{ height: '300px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: 'Mon', logins: Math.floor(stats.totalLogins * 0.1), users: Math.floor(stats.totalUsers * 0.05) },
                    { name: 'Tue', logins: Math.floor(stats.totalLogins * 0.15), users: Math.floor(stats.totalUsers * 0.08) },
                    { name: 'Wed', logins: Math.floor(stats.totalLogins * 0.2), users: Math.floor(stats.totalUsers * 0.1) },
                    { name: 'Thu', logins: Math.floor(stats.totalLogins * 0.25), users: Math.floor(stats.totalUsers * 0.15) },
                    { name: 'Fri', logins: Math.floor(stats.totalLogins * 0.3), users: Math.floor(stats.totalUsers * 0.2) },
                    { name: 'Sat', logins: Math.floor(stats.totalLogins * 0.1), users: Math.floor(stats.totalUsers * 0.05) },
                    { name: 'Sun', logins: Math.floor(stats.totalLogins * 0.05), users: Math.floor(stats.totalUsers * 0.02) }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="logins" stroke="#00c9b7" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="users" stroke="#667eea" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;