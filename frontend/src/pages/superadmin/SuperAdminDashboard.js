import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';

const SuperAdminDashboard = () => {

   // ✅ SIDEBAR TOGGLE STATE
    const [sidebarOpen, setSidebarOpen] = useState(false);
  
    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };


  const [dashboardData, setDashboardData] = useState({
    totalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
    securityAlerts: 0,
    auditLogs: 0
  });
  
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/superadmin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // ✅ FETCH REAL DASHBOARD SUMMARY
      const summaryRes = await fetch(`${API_URL}/dashboard/summary`, { headers });
      const summaryData = await summaryRes.json();
      setDashboardData(summaryData);

      // ✅ FETCH REAL PENDING ADMINS
      const adminsRes = await fetch(`${API_URL}/admins/pending`, { headers });
      const adminsData = await adminsRes.json();
      setPendingAdmins(adminsData);

      // ✅ FETCH REAL SECURITY ALERTS
      const alertsRes = await fetch(`${API_URL}/security/alerts`, { headers });
      const alertsData = await alertsRes.json();
      setSecurityAlerts(alertsData.slice(0, 4));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleApproveAdmin = async (adminId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admins/${adminId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Admin approved successfully!\n\nApproved by: ${data.approvedBy.name}\nEmail: ${data.approvedBy.email}\nRole: ${data.approvedBy.role}`);
        fetchDashboardData();
      }
    } catch (error) {
      alert('Error approving admin');
    }
  };

  const handleRejectAdmin = async (adminId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admins/${adminId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('❌ Admin rejected');
        fetchDashboardData();
      }
    } catch (error) {
      alert('Error rejecting admin');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content">
          <SuperAdminTopNav toggleSidebar={toggleSidebar} />
          <div className="dashboard-content">
            <h1 className="page-title">Loading Dashboard...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="main-content">
        <SuperAdminTopNav toggleSidebar={toggleSidebar} />
        
        <div className="dashboard-content">
          <h1 className="page-title">Super Admin Dashboard</h1>
          
          {/* Dashboard Cards */}
          <div className="dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem' }}>
            {/* Total Admins */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🛡️</div>
                <div style={{ color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>Total Admins</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{dashboardData.totalAdmins}</div>
                  <button style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => window.location.href = '/superadmin/manage-admins'}>
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Total Doctors */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>⚕️</div>
                <div style={{ color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>Total Doctors</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{dashboardData.totalDoctors}</div>
                  <button style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => window.location.href = '/superadmin/manage-doctors'}>
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Total Patients */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>👥</div>
                <div style={{ color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>Total Patients</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{dashboardData.totalPatients}</div>
                  <button style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => window.location.href = '/superadmin/manage-patients'}>
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Security Alerts */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>⚠️</div>
                <div style={{ color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>Security Alerts</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{dashboardData.securityAlerts}</div>
                  <button style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => window.location.href = '/superadmin/security'}>
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>📋</div>
                <div style={{ color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>Audit Logs</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{dashboardData.auditLogs}</div>
                  <button style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => window.location.href = '/superadmin/audit-logs'}>
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Records Section */}
          <div className="section-card" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">👥</span>
                Manage Records
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/superadmin/manage-admins'}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍💼</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Manage Admins</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>View Details</p>
                <button style={{
                  padding: '0.5rem 1.5rem',
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  View Details
                </button>
              </div>

              {/* Pending Admins Card */}
              <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/superadmin/pending-admins'}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Pending Admins</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>
                  {pendingAdmins.length} waiting
                </p>
                <button style={{
                  padding: '0.5rem 1.5rem',
                  background: 'white',
                  color: '#fb923c',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  Review Now
                </button>
              </div>

              <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/superadmin/manage-doctors'}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍⚕️</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Manage Doctors</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>View Details</p>
                <button style={{
                  padding: '0.5rem 1.5rem',
                  background: 'white',
                  color: '#00c9b7',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  View Details
                </button>
              </div>

              <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/superadmin/manage-patients'}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Manage Patients</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>View Details</p>
                <button style={{
                  padding: '0.5rem 1.5rem',
                  background: 'white',
                  color: '#a855f7',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="section-card" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">⚡</span>
                Quick Actions
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>


              <button
                onClick={() => window.location.href = '/superadmin/audit-logs'}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <div style={{ fontWeight: '600', color: '#2c3544' }}>View Audit Logs</div>
              </button>

              <button
                onClick={() => window.location.href = '/superadmin/pending-admins'}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  border: '2px solid #fb923c',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <div style={{ fontWeight: '600', color: '#2c3544' }}>Pending Approvals</div>
              </button>

              <button
                onClick={() => window.location.href = '/superadmin/activity-history'}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  border: '2px solid #8b5cf6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📜</div>
                <div style={{ fontWeight: '600', color: '#2c3544' }}>Activity History</div>
              </button>
            </div>
          </div>

          {/* Bottom Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
            {/* Pending Admin Approval */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">👤</span>
                  Pending Admin Approval
                </h2>
              </div>

              {pendingAdmins.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>Name</th>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>Email</th>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>Role</th>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>Requested On</th>
                        <th style={{ padding: '0.75rem', fontWeight: '600', color: '#2c3544' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingAdmins.map((admin) => (
                        <tr key={admin._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem', fontWeight: '600' }}>{admin.name}</td>
                          <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{admin.email}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: '#dbeafe',
                              color: '#1e40af',
                              borderRadius: '12px',
                              fontSize: '0.85rem'
                            }}>
                              admin
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#6c757d' }}>
                            {formatDate(admin.createdAt)}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleApproveAdmin(admin._id)}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectAdmin(admin._id)}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                  No pending admin approvals
                </p>
              )}

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <a href="/superadmin/pending-admins" style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  View All Admins
                </a>
              </div>
            </div>

            {/* Security Alerts */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🛡️</span>
                  Security Alerts
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {securityAlerts.map((alert, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    border: `2px solid ${alert.severity === 'high' ? '#ef4444' : '#fb923c'}`,
                    borderRadius: '8px',
                    background: alert.severity === 'high' ? '#fee2e2' : '#ffedd5'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: alert.severity === 'high' ? '#ef4444' : '#fb923c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        {alert.severity === 'high' ? '🔴' : '🟡'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Alert #{alert.id}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{alert.ip}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{alert.message}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{alert.date}</div>
                      <button style={{
                        padding: '0.25rem 0.75rem',
                        background: '#4a9eff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <a href="/superadmin/security" style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  View Full Logs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;