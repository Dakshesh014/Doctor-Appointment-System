import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [systemStats, setSystemStats] = useState([]);
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

      // Fetch dashboard summary
      const summaryRes = await fetch(`${API_URL}/dashboard/summary`, { headers });
      const summaryData = await summaryRes.json();
      setDashboardData(summaryData);

      // Fetch recent users
      const usersRes = await fetch(`${API_URL}/users/recent`, { headers });
      const usersData = await usersRes.json();
      setRecentUsers(usersData.slice(0, 5));

      // Fetch recent appointments
      const appointmentsRes = await fetch(`${API_URL}/appointments/recent`, { headers });
      const appointmentsData = await appointmentsRes.json();
      setRecentAppointments(appointmentsData.slice(0, 5));

      // Fetch revenue chart
      const revenueRes = await fetch(`${API_URL}/revenue/chart`, { headers });
      const revenueData = await revenueRes.json();
      setRevenueChart(revenueData);

      // Fetch system stats
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

  if (loading) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar />
        <div className="main-content">
          <AdminTopNav />
          <div className="dashboard-content">
            <h1 className="page-title">Loading Dashboard...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      
      <div className="main-content">
        <AdminTopNav />
        
        <div className="dashboard-content">
          <h1 className="page-title">
            Welcome, {user?.name?.toUpperCase() || 'ADMIN'} - Admin Dashboard
          </h1>
          
          {/* Dashboard Cards - Row 1 */}
          <div className="dashboard-cards">
            {/* Total Users */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-header">
                <div className="card-icon" style={{ fontSize: '2rem' }}>👥</div>
                <div style={{ color: 'white' }}>
                  <div className="card-title" style={{ color: 'white' }}>Total Users</div>
                  <div className="card-value" style={{ color: 'white', fontSize: '2.5rem' }}>{dashboardData.totalUsers || 0}</div>
                  <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Registered Users</div>
                </div>
              </div>
            </div>

            {/* Total Patients */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)' }}>
              <div className="card-header">
                <div className="card-icon" style={{ fontSize: '2rem' }}>🏥</div>
                <div style={{ color: 'white' }}>
                  <div className="card-title" style={{ color: 'white' }}>Total Patients</div>
                  <div className="card-value" style={{ color: 'white', fontSize: '2.5rem' }}>{dashboardData.totalPatients || 0}</div>
                  <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Active Patients</div>
                </div>
              </div>
            </div>

            {/* Total Doctors */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}>
              <div className="card-header">
                <div className="card-icon" style={{ fontSize: '2rem' }}>⚕️</div>
                <div style={{ color: 'white' }}>
                  <div className="card-title" style={{ color: 'white' }}>Total Doctors</div>
                  <div className="card-value" style={{ color: 'white', fontSize: '2.5rem' }}>{dashboardData.totalDoctors || 0}</div>
                  <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Medical Staff</div>
                </div>
              </div>
            </div>

            {/* Total Appointments */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }}>
              <div className="card-header">
                <div className="card-icon" style={{ fontSize: '2rem' }}>📅</div>
                <div style={{ color: 'white' }}>
                  <div className="card-title" style={{ color: 'white' }}>Total Appointments</div>
                  <div className="card-value" style={{ color: 'white', fontSize: '2.5rem' }}>{dashboardData.totalAppointments || 0}</div>
                  <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>All Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Cards - Row 2 */}
          <div className="dashboard-cards" style={{ marginTop: '1.5rem' }}>
            {/* Pending Appointments */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
              <div className="card-header">
                <div className="card-icon" style={{ fontSize: '2rem' }}>⏳</div>
                <div style={{ color: 'white' }}>
                  <div className="card-title" style={{ color: 'white' }}>Pending Appointments</div>
                  <div className="card-value" style={{ color: 'white', fontSize: '2.5rem' }}>{dashboardData.pendingAppointments || 0}</div>
                  <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Awaiting Confirmation</div>
                </div>
              </div>
            </div>

            {/* Completed Appointments */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <div className="card-header">
                <div className="card-icon" style={{ fontSize: '2rem' }}>✅</div>
                <div style={{ color: 'white' }}>
                  <div className="card-title" style={{ color: 'white' }}>Completed Appointments</div>
                  <div className="card-value" style={{ color: 'white', fontSize: '2.5rem' }}>{dashboardData.completedAppointments || 0}</div>
                  <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>This Month</div>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
              <div className="card-header">
                <div className="card-icon" style={{ fontSize: '2rem' }}>💰</div>
                <div style={{ color: 'white' }}>
                  <div className="card-title" style={{ color: 'white' }}>Total Revenue</div>
                  <div className="card-value" style={{ color: 'white', fontSize: '2.5rem' }}>${dashboardData.totalRevenue || 0}</div>
                  <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>All Time</div>
                </div>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <div className="card-header">
                <div className="card-icon" style={{ fontSize: '2rem' }}>📊</div>
                <div style={{ color: 'white' }}>
                  <div className="card-title" style={{ color: 'white' }}>Monthly Revenue</div>
                  <div className="card-value" style={{ color: 'white', fontSize: '2.5rem' }}>${dashboardData.monthlyRevenue || 0}</div>
                  <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>This Month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              👥 Manage Users
            </button>
            <button 
              onClick={() => window.location.href = '/admin/appointments'}
              style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              📅 View Appointments
            </button>
            <button 
              onClick={() => window.location.href = '/admin/reports'}
              style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              📊 Generate Reports
            </button>
            <button 
              onClick={() => window.location.href = '/admin/settings'}
              style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              ⚙️ System Settings
            </button>
          </div>

          {/* Main Content Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
            {/* Recent Users */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">👥</span>
                  Recent Users
                </h2>
                <a href="/admin/users" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                  View All →
                </a>
              </div>

              {recentUsers.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>User</th>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>Role</th>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>Email</th>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>Joined</th>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#667eea',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '600'
                              }}>
                                {user.name?.charAt(0) || 'U'}
                              </div>
                              <span style={{ fontWeight: '600' }}>{user.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              background: user.role === 'doctor' ? '#dbeafe' : user.role === 'patient' ? '#d1fae5' : '#fef3c7',
                              color: user.role === 'doctor' ? '#1e40af' : user.role === 'patient' ? '#065f46' : '#92400e'
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#6c757d' }}>{user.email}</td>
                          <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#6c757d' }}>{formatDate(user.createdAt)}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <button style={{
                              padding: '0.25rem 0.75rem',
                              background: '#4a9eff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                  No recent users
                </p>
              )}
            </div>

            {/* System Stats */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">💻</span>
                  System Stats
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Server Status</div>
                    <div style={{ fontWeight: '600', color: '#10b981' }}>● Online</div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Database</div>
                    <div style={{ fontWeight: '600', color: '#10b981' }}>● Connected</div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Active Sessions</div>
                    <div style={{ fontWeight: '600', color: '#2c3544' }}>24</div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Storage Used</div>
                    <div style={{ fontWeight: '600', color: '#2c3544' }}>2.4 GB / 10 GB</div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>Last Backup</div>
                    <div style={{ fontWeight: '600', color: '#2c3544' }}>2 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
            {/* Recent Appointments */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">📅</span>
                  Recent Appointments
                </h2>
              </div>

              {recentAppointments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentAppointments.map((apt) => (
                    <div key={apt._id} style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {apt.patientName} → {apt.doctorName}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          {formatDate(apt.date)} | {apt.department}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        background: apt.status === 'Confirmed' ? '#d1fae5' : '#fef3c7',
                        color: apt.status === 'Confirmed' ? '#065f46' : '#92400e'
                      }}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                  No recent appointments
                </p>
              )}
            </div>

            {/* Revenue Chart */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">💰</span>
                  Revenue Overview (Last 6 Months)
                </h2>
              </div>

              {revenueChart.length > 0 ? (
                <>
                  <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem' }}>
                    {revenueChart.map((item, index) => (
                      <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{
                          width: '100%',
                          height: `${Math.min((item.amount / 10000) * 100, 100)}%`,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '4px 4px 0 0',
                          minHeight: '20px',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          paddingBottom: '0.25rem'
                        }}>
                          ${(item.amount / 1000).toFixed(1)}k
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', textAlign: 'center' }}>{item.month}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                  No revenue data
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;