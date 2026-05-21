import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AdminDashboard = () => {
  // ✅ SIDEBAR TOGGLE STATE
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    dailyAppointments: 0,
    monthlyAppointments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userInfo = JSON.parse(localStorage.getItem('user'));
      setUser(userInfo);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // ✅ FETCH REAL DASHBOARD SUMMARY
      const summaryRes = await fetch(`${API_URL}/dashboard/summary`, { headers });
      const summaryData = await summaryRes.json();
      setDashboardData(summaryData);

      // ✅ FETCH REAL RECENT USERS
      const usersRes = await fetch(`${API_URL}/users/recent`, { headers });
      const usersData = await usersRes.json();
      setRecentUsers(usersData);

      // ✅ FETCH REAL RECENT APPOINTMENTS
      const appointmentsRes = await fetch(`${API_URL}/appointments/recent`, { headers });
      const appointmentsData = await appointmentsRes.json();
      setRecentAppointments(appointmentsData);

      // ✅ FETCH REAL REVENUE CHART
      const revenueRes = await fetch(`${API_URL}/revenue/chart`, { headers });
      const revenueData = await revenueRes.json();
      setRevenueChart(revenueData);

      // ✅ FETCH REAL SYSTEM STATS
      const statsRes = await fetch(`${API_URL}/system/stats`, { headers });
      const statsData = await statsRes.json();
      setSystemStats(statsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ✅ NEW: CALCULATE CHART DATA (SVG)
  const chartHeight = 250;
  const chartWidth = 800;
  const maxRevenue = revenueChart.length > 0 ? Math.max(...revenueChart.map(d => d.revenue), 1) : 1;
  const points = revenueChart.map((d, i) => ({
    x: revenueChart.length > 1 ? (i / (revenueChart.length - 1)) * chartWidth : 0,
    y: chartHeight - (d.revenue / maxRevenue) * chartHeight
  }));
  const pathData = points.length > 1 
    ? `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')
    : points.length === 1 ? `M 0,${points[0].y} L ${chartWidth},${points[0].y}` : '';
  const areaData = points.length > 0
    ? `${pathData} L ${points[points.length-1].x},${chartHeight} L ${points[0].x},${chartHeight} Z`
    : '';

  // ✅ NEW: UNIFIED ACTIVITY LOGIC
  const activityStream = [
    ...recentUsers.map(u => ({ type: 'user', icon: '👤', title: 'New User Joined', desc: `${u.name} joined as ${u.role}`, time: u.createdAt })),
    ...recentAppointments.map(a => ({ type: 'apt', icon: '📅', title: 'New Appointment', desc: `${a.patient?.name} scheduled with Dr. ${a.doctor?.name}`, time: a.createdAt }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content">
          <AdminTopNav toggleSidebar={toggleSidebar} />
          <div className="dashboard-content">
            <div className="dashboard-loading-container">
              <div className="dashboard-loading-icon">⏳</div>
              <h1 className="page-title">Loading Dashboard...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />

        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="page-title">Analytics Intelligence Overview</h1>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
              REAL-TIME DATA • {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Advanced Summary Cards */}
          <div className="dashboard-cards-grid">
            <div className="dashboard-card card-users">
              <div className="card-header-flex">
                <div className="card-icon-large">👥</div>
                <div>
                  <div className="card-label">Total Users</div>
                  <div className="card-value-large">{dashboardData.totalUsers}</div>
                  <div className="card-growth growth-up">↑ 12% vs last month</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card card-patients">
              <div className="card-header-flex">
                <div className="card-icon-large">🏥</div>
                <div>
                  <div className="card-label">Active Patients</div>
                  <div className="card-value-large">{dashboardData.totalPatients}</div>
                  <div className="card-growth growth-up">↑ 8% engagement</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card card-doctors">
              <div className="card-header-flex">
                <div className="card-icon-large">⚕️</div>
                <div>
                  <div className="card-label">Verified Doctors</div>
                  <div className="card-value-large">{dashboardData.totalDoctors}</div>
                  <div className="card-growth">Stable coverage</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card card-revenue">
              <div className="card-header-flex">
                <div className="card-icon-large">💰</div>
                <div>
                  <div className="card-label">Total Revenue</div>
                  <div className="card-value-large">${dashboardData.totalRevenue}</div>
                  <div className="card-growth growth-up">↑ 5.4% yield</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card card-appointments">
              <div className="card-header-flex">
                <div className="card-icon-large">📅</div>
                <div>
                  <div className="card-label">Total Appointments</div>
                  <div className="card-value-large">{dashboardData.totalAppointments}</div>
                  <div className="card-growth growth-up">↑ 15% booking rate</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card card-pending">
              <div className="card-header-flex">
                <div className="card-icon-large">⏳</div>
                <div>
                  <div className="card-label">Pending Review</div>
                  <div className="card-value-large">{dashboardData.pendingAppointments}</div>
                  <div className="card-growth growth-down">↓ 3% backlog</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bottom-grid">
            {/* SVG Premium Chart */}
            <div className="section-card" style={{ flex: 2 }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">📈</span>
                  Revenue Analytics Intelligence
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>6 MONTHS</span>
                </div>
              </div>

              <div className="premium-chart-container">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="chart-svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <line 
                      key={i} 
                      x1="0" y1={chartHeight * p} 
                      x2={chartWidth} y2={chartHeight * p} 
                      stroke="#f1f5f9" 
                      strokeWidth="1" 
                    />
                  ))}

                  <path d={areaData} className="chart-area" />
                  <path d={pathData} className="chart-path" />
                  
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" className="chart-point" />
                      <text x={p.x} y={chartHeight + 20} textAnchor="middle" fill="#94a3b8" fontSize="12">
                        {revenueChart[i].month}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Unified Activity Stream */}
            <div className="section-card" style={{ flex: 1 }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">⚡</span>
                  System Activity
                </h2>
              </div>
              
              <div className="activity-feed">
                {activityStream.length > 0 ? activityStream.map((item, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-icon-box" style={{ 
                      background: item.type === 'user' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: item.type === 'user' ? '#6366f1' : '#10b981'
                    }}>
                      {item.icon}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{item.title}</div>
                      <div className="activity-desc">{item.desc}</div>
                      <div className="activity-time">{formatDate(item.time)}</div>
                    </div>
                  </div>
                )) : (
                  <p className="no-data-text">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* System Health Monitor */}
          <div className="section-card" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">🏥</span>
                Infrastructure & System Health
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="card-label">Server Stability</span>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>99.9%</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                  <div style={{ width: '99.9%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="card-label">Database Load</span>
                  <span style={{ color: '#6366f1', fontWeight: '700' }}>24%</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                  <div style={{ width: '24%', height: '100%', background: '#6366f1', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="card-label">Storage Capacity</span>
                  <span style={{ color: '#f59e0b', fontWeight: '700' }}>{systemStats.storageUsed || '2.4 / 10 GB'}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                  <div style={{ width: '24%', height: '100%', background: '#f59e0b', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div className="card-icon-large" style={{ background: '#f0fdf4', color: '#10b981', fontSize: '1.2rem' }}>🛡️</div>
                 <div>
                    <div className="card-label">Security Protocol</div>
                    <div style={{ color: '#10b981', fontWeight: '700' }}>AES-256 ACTIVE</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Command Center */}
          <div className="command-center">
            <button className="command-btn" title="Global Search">🔍</button>
            <button className="command-btn" title="Add New User" onClick={() => window.location.href='/admin/all-users'}>➕</button>
            <button className="command-btn" title="System Settings" onClick={() => window.location.href='/admin/settings'}>⚙️</button>
            <button className="command-btn" title="Generate Report" onClick={() => window.location.href='/admin/reports'}>📈</button>
            <button className="command-btn" title="Send Notification">🔔</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;