import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const PatientDashboard = () => {
  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    totalAppointments: 0,
    outstandingBalance: 0,
    medicalRecords: 0,
    labReports: 0,
    allergies: 0,
    vitals: {
      bloodPressure: 'N/A',
      heartRate: 'N/A',
      temperature: 'N/A',
      weight: 'N/A',
      height: 'N/A'
    }
  });
  
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    setUser(userInfo);
    fetchDashboardData();
    fetchUpcomingAppointments();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/dashboard/summary', {
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

  const fetchUpcomingAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/appointments/upcoming', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUpcomingAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(),
      fetchUpcomingAppointments()
    ]);
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e' },
      confirmed: { bg: '#d1fae5', text: '#065f46' },
      rejected: { bg: '#fee2e2', text: '#991b1b' },
      completed: { bg: '#e0e7ff', text: '#3730a3' },
      cancelled: { bg: '#f3f4f6', text: '#6c757d' }
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="main-content">
          <PatientTopNav toggleSidebar={toggleSidebar} />
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
      <PatientSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="main-content">
        <PatientTopNav toggleSidebar={toggleSidebar} />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="page-title">HI, {user?.name?.toUpperCase()} - Patient Dashboard</h1>
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
            {/* Upcoming Appointments */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon blue">📅</div>
                <div>
                  <div className="card-title">Upcoming Appointments</div>
                  <div className="card-value">{dashboardData.upcomingAppointments}</div>
                  <div className="card-subtitle">Upcoming</div>
                </div>
              </div>
            </div>

            {/* Active Prescriptions */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon teal">💊</div>
                <div>
                  <div className="card-title">Active Prescriptions</div>
                  <div className="card-value">{dashboardData.activePrescriptions}</div>
                  <div className="card-subtitle">Active</div>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon purple">📋</div>
                <div>
                  <div className="card-title">Medical History</div>
                  <div className="card-value">{dashboardData.medicalRecords}</div>
                  <div className="card-subtitle">Records</div>
                </div>
              </div>
            </div>

            {/* Outstanding Balance */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon orange">💰</div>
                <div>
                  <div className="card-title">Outstanding Balance</div>
                  <div className="card-value">${dashboardData.outstandingBalance.toFixed(2)}</div>
                  {dashboardData.outstandingBalance > 0 && (
                    <button
                      onClick={() => window.location.href = '/patient/billing'}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Lab Reports */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon cyan">🧪</div>
                <div>
                  <div className="card-title">Lab Reports</div>
                  <div className="card-value">{dashboardData.labReports}</div>
                  <div className="card-subtitle">Total Reports</div>
                </div>
              </div>
            </div>

            {/* Vitals Status */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon pink">❤️</div>
                <div>
                  <div className="card-title">Vitals Status</div>
                  <div className="vitals-info">
                    <div className="vital-item">BP: {dashboardData.vitals.bloodPressure}</div>
                    <div className="vital-item">Heart: {dashboardData.vitals.heartRate}</div>
                  </div>
                  <span className="status-badge normal">Normal</span>
                </div>
              </div>
            </div>

            {/* Insurance Status */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon gray">🛡️</div>
                <div>
                  <div className="card-title">Insurance Status</div>
                  <div className="card-subtitle">N/A - Not enrolled</div>
                  <div className="card-subtitle">Valid To: N/A</div>
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon pink">⚠️</div>
                <div>
                  <div className="card-title">Allergies</div>
                  <div className="card-value">{dashboardData.allergies}</div>
                  <div className="card-subtitle">Allergens</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Banner */}
          {dashboardData.upcomingAppointments === 0 && (
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              color: 'white',
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📅 No Upcoming Appointments</h3>
                <p style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                  Book an appointment with our qualified doctors today!
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/patient/book-appointment'}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '1rem'
                }}
              >
                Book Now
              </button>
            </div>
          )}

          {/* Upcoming Appointments Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">📅</span>
                  Upcoming Appointments
                </h2>
                <button 
                  onClick={fetchUpcomingAppointments}
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

              {upcomingAppointments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {upcomingAppointments.map((appointment) => (
                    <div 
                      key={appointment._id}
                      style={{
                        padding: '1.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      onClick={() => window.location.href = '/patient/appointments'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.25rem'
                        }}>
                          {appointment.doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                            Dr. {appointment.doctor?.name}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                            {appointment.doctor?.specialization || 'General'}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                            📅 {formatDate(appointment.date)} at {appointment.time}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                            {appointment.type === 'Video' ? '🎥' : '🏥'} {appointment.type}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: getStatusColor(appointment.status).bg,
                          color: getStatusColor(appointment.status).text
                        }}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Upcoming Appointments</h3>
                  <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
                    You don't have any upcoming appointments
                  </p>
                  <button
                    onClick={() => window.location.href = '/patient/book-appointment'}
                    style={{
                      padding: '0.75rem 2rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    📅 Book Appointment
                  </button>
                </div>
              )}

              {upcomingAppointments.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => window.location.href = '/patient/appointments'}
                    style={{
                      padding: '0.75rem 2rem',
                      background: 'transparent',
                      color: '#4a9eff',
                      border: '2px solid #4a9eff',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    View All Appointments
                  </button>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <span className="status-pill confirmed">✓ Confirmed</span>
                <span className="status-pill pending">⏳ Pending</span>
                <span className="status-pill completed">✓ Completed</span>
              </div>
            </div>

            {/* Health Summary */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">❤️</span>
                  Health Summary
                </h2>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{
                  padding: '1rem',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                    Blood Pressure
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                    {dashboardData.vitals.bloodPressure}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                    Heart Rate
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fb923c' }}>
                    {dashboardData.vitals.heartRate}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#dbeafe',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                    Temperature
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#4a9eff' }}>
                    {dashboardData.vitals.temperature}
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/patient/my-profile'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#4a9eff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginTop: '1rem'
                  }}
                >
                  Update Health Info
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="section-card" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">⚡</span>
                Quick Links
              </h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem', 
              marginTop: '1.5rem' 
            }}>
              <button
                onClick={() => window.location.href = '/patient/book-appointment'}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
                <div style={{ fontWeight: '600', color: '#2c3544' }}>Book Appointment</div>
              </button>

              <button
                onClick={() => window.location.href = '/patient/prescriptions'}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  border: '2px solid #8b5cf6',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💊</div>
                <div style={{ fontWeight: '600', color: '#2c3544' }}>Prescriptions</div>
              </button>

              <button
                onClick={() => window.location.href = '/patient/lab-records'}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  border: '2px solid #06b6d4',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧪</div>
                <div style={{ fontWeight: '600', color: '#2c3544' }}>Lab Records</div>
              </button>

              <button
                onClick={() => window.location.href = '/patient/messages'}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  border: '2px solid #f59e0b',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
                <div style={{ fontWeight: '600', color: '#2c3544' }}>Messages</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;