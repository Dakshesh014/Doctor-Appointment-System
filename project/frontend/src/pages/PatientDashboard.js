import React from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const PatientDashboard = () => {
  //const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      
      <div className="main-content">
        <PatientTopNav />
        
        <div className="dashboard-content">
          <h1 className="page-title">Patient Dashboard</h1>
          
          {/* Dashboard Cards */}
          <div className="dashboard-cards">
            {/* Upcoming Appointments */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon blue">📅</div>
                <div>
                  <div className="card-title">Upcoming Appointments</div>
                  <div className="card-value">3</div>
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
                  <div className="card-value">2</div>
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
                  <div className="card-value">5</div>
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
                  <div className="card-value">$150</div>
                </div>
              </div>
            </div>

            {/* Lab Reports */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon cyan">🧪</div>
                <div>
                  <div className="card-title">Lab Reports</div>
                  <div className="card-value">8</div>
                  <div className="card-subtitle">Total Reports</div>
                </div>
              </div>
            </div>

            {/* Vitals Status */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon amber">❤️</div>
                <div>
                  <div className="card-title">Vitals Status</div>
                </div>
              </div>
              <div className="vitals-info">
                <div className="vital-item">BP: 120/80</div>
                <div className="vital-item">Heart Rate: 72 bpm</div>
                <span className="status-badge normal">Normal</span>
              </div>
            </div>

            {/* Insurance Status */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon gray">🛡️</div>
                <div>
                  <div className="card-title">Insurance Status</div>
                </div>
              </div>
              <div className="card-details">
                <div>Active Anthem Health</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: '#6c757d' }}>
                  Valid To: 05/15/2025
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon pink">⚠️</div>
                <div>
                  <div className="card-title">Allergies</div>
                  <div className="card-value">3</div>
                  <div className="card-subtitle">Enlilargeons</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Sections */}
          <div className="dashboard-sections">
            {/* Upcoming Appointments Section */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">📅</span>
                  Upcoming Appointments
                </h2>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a9eff' }}>
                  🔍 Book Appointment
                </button>
              </div>

              {/* Calendar */}
              <div className="calendar-container">
                <div className="calendar-header">
                  <div className="calendar-nav">
                    <button className="calendar-nav-btn">‹</button>
                    <button className="calendar-nav-btn">‹‹</button>
                  </div>
                  <div className="calendar-month">April 2</div>
                  <div className="calendar-nav">
                    <button className="calendar-nav-btn">››</button>
                    <button className="calendar-nav-btn">›</button>
                  </div>
                </div>

                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-header">{day}</div>
                  ))}
                  {[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const isActive = day === 24;
                    return (
                      <div 
                        key={i} 
                        className={`calendar-day ${isActive ? 'active' : ''}`}
                      >
                        {day <= 30 ? day : ''}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Appointment List */}
              <div className="appointment-list">
                <div className="appointment-item">
                  <div className="doctor-avatar" style={{ background: '#e5e7eb' }}></div>
                  <div className="appointment-details">
                    <div className="doctor-name">Dr. Smith</div>
                    <div className="appointment-info">
                      <span>✉️ Ehkrom General History</span>
                    </div>
                  </div>
                  <div>
                    <div className="appointment-date">May 3, Rinle</div>
                    <div className="appointment-type">In Person</div>
                  </div>
                  <button className="btn-view">View ▼</button>
                </div>

                <div className="appointment-item">
                  <div className="doctor-avatar" style={{ background: '#e5e7eb' }}></div>
                  <div className="appointment-details">
                    <div className="doctor-name">Dr. Adams</div>
                    <div className="appointment-info">
                      <span>✉️ Ehkrom Dr, Artiology</span>
                    </div>
                  </div>
                  <div>
                    <div className="appointment-date">May 3, 2024</div>
                    <div className="appointment-type">Video Call</div>
                  </div>
                  <button className="btn-view">View ▼</button>
                </div>

                <div className="appointment-item">
                  <div className="doctor-avatar" style={{ background: '#e5e7eb' }}></div>
                  <div className="appointment-details">
                    <div className="doctor-name">Dr. Lee</div>
                    <div className="appointment-info">
                      <span>✉️ Ehkrom Orthopedics</span>
                    </div>
                  </div>
                  <div>
                    <div className="appointment-date">May 10, 2024</div>
                    <div className="appointment-type">In Person</div>
                  </div>
                  <button className="btn-view">View ▼</button>
                </div>
              </div>

              <div className="appointment-status">
                <span className="status-pill confirmed">✔️ Confirmed</span>
                <span className="status-pill pending">⏳ Pending</span>
                <span className="status-pill completed">✓ Completed</span>
              </div>
            </div>

            {/* Recent Lab Results */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🧪</span>
                  Recent Lab Results
                </h2>
              </div>

              <div className="lab-results-list">
                <div className="lab-result-item">
                  <div className="lab-result-info">
                    <div className="lab-test-name">Blood Test</div>
                    <div className="lab-test-date">Merro 1 - 3:04 Kyles22, 2024</div>
                  </div>
                  <button className="btn-view-details">View Details</button>
                </div>

                <div className="lab-result-item">
                  <div className="lab-result-info">
                    <div className="lab-test-name">Lipid Profile</div>
                    <div className="lab-test-date">April 5, 2024 - Mar 17, 2024</div>
                  </div>
                  <button className="btn-view-details">View Details</button>
                </div>

                <div className="lab-result-item">
                  <div className="lab-result-info">
                    <div className="lab-test-name">Thyroid Panel</div>
                    <div className="lab-test-date">Merco 1g, 2024 Mar 10, 2024</div>
                  </div>
                  <span className="lab-result-status abnormal">Abnormal</span>
                  <button className="btn-view-details">View Details</button>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button style={{ background: 'none', border: 'none', color: '#4a9eff', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Labs: History ›
                  </button>
                  <button style={{ background: 'none', border: 'none', color: '#4a9eff', cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.5rem', display: 'block' }}>
                    View Billing History
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="bottom-sections">
            {/* Upcoming Appointments List */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">📅</span>
                  Upcoming Appointments
                </h2>
              </div>

              <div className="appointment-list">
                <div className="appointment-item">
                  <div className="doctor-avatar"></div>
                  <div className="appointment-details">
                    <div className="appointment-date">April 24, 2024</div>
                    <div className="appointment-info">Last filled: 6:10.84 with Dr. Smith</div>
                  </div>
                  <button className="btn-view-details">View Details</button>
                </div>

                <div className="appointment-item">
                  <div className="doctor-avatar"></div>
                  <div className="appointment-details">
                    <div className="appointment-date">May 3, 2024</div>
                    <div className="appointment-info">Last filled: 4:00 PM with Dr. Adams</div>
                  </div>
                  <button className="btn-view-details">View Details</button>
                </div>

                <div className="appointment-item">
                  <div className="doctor-avatar"></div>
                  <div className="appointment-details">
                    <div className="appointment-date">Mar 10, 2024 at 11:00 AM</div>
                    <div className="appointment-info">Last filled: 11:00 AM with Dr. Lee</div>
                  </div>
                  <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>High Cholesterol</span>
                </div>
              </div>
            </div>

            {/* Billing Overview */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">💳</span>
                  Billing Overview (Last 6 Months)
                </h2>
              </div>

              <div className="chart-container" style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem' }}>
                {[
                  { month: 'Nov 2023', bills: 1, payments: 3 },
                  { month: 'Feb 2023', bills: 2, payments: 4.5 },
                  { month: 'Mar 2023', bills: 2, payments: 3 },
                  { month: 'Apr 2023', bills: 3, payments: 4.5 },
                  { month: 'Apr 2024', bills: 1.5, payments: 4 },
                  { month: 'Apr 2024', bills: 1, payments: 3 }
                ].map((item, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px' }}>
                      <div style={{ 
                        width: '20px', 
                        height: `${item.bills * 24}px`, 
                        background: '#60a5fa',
                        borderRadius: '4px 4px 0 0'
                      }}></div>
                      <div style={{ 
                        width: '20px', 
                        height: `${item.payments * 24}px`, 
                        background: '#2dd4bf',
                        borderRadius: '4px 4px 0 0'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6c757d', textAlign: 'center' }}>{item.month}</div>
                  </div>
                ))}
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color blue"></div>
                  <span>Bills</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color teal"></div>
                  <span>Payments</span>
                </div>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: '#4a9eff', cursor: 'pointer' }}>
                  View Billing History
                </button>
              </div>
            </div>
          </div>

          {/* Doctor's Messages and Help */}
          <div className="bottom-sections" style={{ marginTop: '1.5rem' }}>
            {/* Doctor's Messages */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">💬</span>
                  Doctor's Messages
                </h2>
              </div>

              <div className="messages-list">
                <div className="message-item">
                  <div className="message-avatar"></div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">Dr. Adams:</span>
                      <span className="message-time">2 days ago</span>
                    </div>
                    <div className="message-text">
                      Please remember to schedule your follow up appointment.
                    </div>
                  </div>
                </div>

                <div className="message-item">
                  <div className="message-avatar"></div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">Dr. Smith:</span>
                      <span className="message-time">3 days ago</span>
                    </div>
                    <div className="message-text">
                      Your blood test results are now available in the medical records section.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">❓</span>
                  Help & Support
                </h2>
              </div>

              <div className="help-section">
                <div className="help-item">❓ FAQs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;