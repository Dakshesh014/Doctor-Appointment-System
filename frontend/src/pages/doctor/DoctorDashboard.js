import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const DoctorDashboard = () => {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [dashboardData, setDashboardData] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
    completedThisMonth: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    setUser(userInfo);
    fetchDashboardData();
    fetchTodayAppointments();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/dashboard/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/appointments/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTodayAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(),
      fetchTodayAppointments()
    ]);
    setRefreshing(false);
  };

  const formatTime = (time) => {
    return time;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e' },
      confirmed: { bg: '#d1fae5', text: '#065f46' },
      completed: { bg: '#e0e7ff', text: '#3730a3' },
      rejected: { bg: '#fee2e2', text: '#991b1b' }
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
         <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content">
          <DoctorTopNav toggleSidebar={toggleSidebar} />
          <div className="dashboard-content">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '80vh',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '3rem' }}>⏳</div>
              <h1 className="page-title">Loading Dashboard...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="main-content">
        <DoctorTopNav toggleSidebar={toggleSidebar} />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="page-title">Welcome, Dr. {user?.name}</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: '0.75rem 1.5rem',
                background: refreshing ? '#94a3b8' : '#4a9eff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Dashboard Cards */}
          <div className="dashboard-cards">
            {/* Total Appointments */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon blue">📅</div>
                <div>
                  <div className="card-title">Total Appointments</div>
                  <div className="card-value">{dashboardData.totalAppointments}</div>
                  <div className="card-subtitle">All time</div>
                </div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon orange">⏳</div>
                <div>
                  <div className="card-title">Pending Requests</div>
                  <div className="card-value">{dashboardData.pendingAppointments}</div>
                  <div className="card-subtitle">Needs attention</div>
                  {dashboardData.pendingAppointments > 0 && (
                    <button
                      onClick={() => navigate('/doctor/appointments/pending')}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        background: '#fb923c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Review Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon teal">📆</div>
                <div>
                  <div className="card-title">Today's Schedule</div>
                  <div className="card-value">{dashboardData.todayAppointments}</div>
                  <div className="card-subtitle">Appointments</div>
                </div>
              </div>
            </div>

            {/* Total Patients */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon purple">👥</div>
                <div>
                  <div className="card-title">Total Patients</div>
                  <div className="card-value">{dashboardData.totalPatients}</div>
                  <div className="card-subtitle">Unique patients</div>
                </div>
              </div>
            </div>

            {/* Completed This Month */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon green">✓</div>
                <div>
                  <div className="card-title">Completed This Month</div>
                  <div className="card-value">{dashboardData.completedThisMonth || 0}</div>
                  <div className="card-subtitle">This month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Appointments Alert */}
          {dashboardData.pendingAppointments > 0 && (
            <div style={{
              padding: '1.5rem',
              marginTop: '2rem',
              marginBottom: '2rem',
              background: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>⚠️</div>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>{dashboardData.pendingAppointments} Pending Appointment Request(s)</strong>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: '#92400e' }}>
                    You have appointment requests waiting for your review and approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/doctor/appointments/pending')}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#fb923c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '1rem',
                  whiteSpace: 'nowrap'
                }}
              >
                Review Now →
              </button>
            </div>
          )}

          {/* Today's Appointments */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📆</span>
                Today's Appointments
              </h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: '#e0e7ff',
                  color: '#4c51bf',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <button
                  onClick={fetchTodayAppointments}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#4a9eff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {todayAppointments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    style={{
                      padding: '1.5rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4a9eff';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 158, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.5rem'
                      }}>
                        {appointment.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                          {appointment.patient?.name}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                          📧 {appointment.patient?.email}
                        </div>
                        {appointment.patient?.phone && (
                          <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                            📱 {appointment.patient.phone}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', color: '#4a9eff', fontWeight: '600' }}>
                            ⏰ {formatTime(appointment.time)}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                            {appointment.type === 'Video' ? '🎥' : '🏥'} {appointment.type}
                          </span>
                          {appointment.patient?.bloodType && (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: '#fee2e2',
                              color: '#991b1b',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>
                              🩸 {appointment.patient.bloodType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        background: getStatusColor(appointment.status).bg,
                        color: getStatusColor(appointment.status).text,
                        display: 'block',
                        marginBottom: '1rem'
                      }}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/appointments/${appointment._id}`);
                          }}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: '#4a9eff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Appointments Today</h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                  You have a clear schedule for today!
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="section-card" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">⚡</span>
                Quick Actions
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => navigate('/doctor/appointments/pending')}
                style={{
                  padding: '2rem',
                  background: 'white',
                  border: '2px solid #fb923c',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(251, 146, 60, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
                <div style={{ fontWeight: '700', color: '#2c3544', fontSize: '1.05rem' }}>Pending Requests</div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem' }}>
                  {dashboardData.pendingAppointments} waiting
                </div>
              </button>

              <button
                onClick={() => navigate('/doctor/patients')}
                style={{
                  padding: '2rem',
                  background: 'white',
                  border: '2px solid #667eea',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                <div style={{ fontWeight: '700', color: '#2c3544', fontSize: '1.05rem' }}>My Patients</div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem' }}>
                  {dashboardData.totalPatients} total
                </div>
              </button>

              <button
                onClick={() => navigate('/doctor/appointments')}
                style={{
                  padding: '2rem',
                  background: 'white',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
                <div style={{ fontWeight: '700', color: '#2c3544', fontSize: '1.05rem' }}>All Appointments</div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem' }}>
                  {dashboardData.totalAppointments} total
                </div>
              </button>

              <button
                onClick={() => navigate('/doctor/my-schedule')}
                style={{
                  padding: '2rem',
                  background: 'white',
                  border: '2px solid #8b5cf6',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(139, 92, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗓️</div>
                <div style={{ fontWeight: '700', color: '#2c3544', fontSize: '1.05rem' }}>My Schedule</div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem' }}>
                  Manage availability
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;