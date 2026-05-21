import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const FollowUpAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUpAppointments();
  }, []);

  const fetchFollowUpAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Filter appointments that are marked as follow-up or have "follow" in notes
      const followUps = data.filter(apt => 
        apt.notes && apt.notes.toLowerCase().includes('follow')
      );
      setAppointments(followUps);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching follow-up appointments:', error);
      setLoading(false);
    }
  };

  const handleReschedule = (id) => {
    // Navigate to book appointment page with pre-filled data
    window.location.href = '/patient/book-appointment';
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this follow-up appointment?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/patient/appointments/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Cancelled' })
        });
        fetchFollowUpAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Confirmed': 'confirmed',
      'Pending': 'pending',
      'Completed': 'completed',
      'Cancelled': 'pending'
    };
    return statusMap[status] || 'pending';
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date();
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar />
        <div className="main-content">
          <PatientTopNav />
          <div className="dashboard-content">
            <h1 className="page-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  const upcomingFollowUps = appointments.filter(apt => isUpcoming(apt.date) && apt.status !== 'Cancelled');
  const pastFollowUps = appointments.filter(apt => !isUpcoming(apt.date) || apt.status === 'Cancelled');

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      
      <div className="main-content">
        <PatientTopNav />
        
        <div className="dashboard-content">
          <h1 className="page-title">Follow-up Appointments</h1>

          {/* Info Box */}
          <div style={{ marginBottom: '2rem', padding: '1rem', background: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
              <strong style={{ color: '#1e40af' }}>About Follow-up Appointments</strong>
            </div>
            <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.9rem', lineHeight: '1.6' }}>
              These are appointments scheduled to monitor your ongoing treatment, check progress after a procedure, or review test results. It's important to attend all follow-up appointments.
            </p>
          </div>

          {/* Upcoming Follow-ups */}
          <div className="section-card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2c3544', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📅</span> Upcoming Follow-ups
            </h2>

            {upcomingFollowUps.length > 0 ? (
              <div className="dashboard-cards">
                {upcomingFollowUps.map((appointment) => (
                  <div key={appointment._id} className="dashboard-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ color: '#2c3544', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {appointment.doctorName}
                        </h3>
                        <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                          {appointment.department}
                        </p>
                      </div>
                      <span className={`status-pill ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                      <p style={{ color: '#2c3544', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>📅 Date:</strong> {formatDate(appointment.date)}
                      </p>
                      <p style={{ color: '#2c3544', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>🕐 Time:</strong> {appointment.time}
                      </p>
                      <p style={{ color: '#2c3544', fontSize: '0.9rem' }}>
                        <strong>📍 Type:</strong> {appointment.type}
                      </p>
                    </div>

                    {appointment.notes && (
                      <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', borderLeft: '4px solid #fbbf24' }}>
                        <strong style={{ color: '#92400e', fontSize: '0.85rem' }}>Follow-up Reason:</strong>
                        <p style={{ color: '#78350f', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleReschedule(appointment._id)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: '#4a9eff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Reschedule
                      </button>
                      {appointment.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handleCancel(appointment._id)}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                <p>No upcoming follow-up appointments</p>
              </div>
            )}
          </div>

          {/* Past Follow-ups */}
          {pastFollowUps.length > 0 && (
            <div className="section-card">
              <h2 style={{ marginBottom: '1.5rem', color: '#2c3544', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span> Past Follow-ups
              </h2>

              <div className="appointment-list">
                {pastFollowUps.map((appointment) => (
                  <div key={appointment._id} className="appointment-item">
                    <div className="doctor-avatar"></div>
                    <div className="appointment-details" style={{ flex: 1 }}>
                      <div className="doctor-name">{appointment.doctorName}</div>
                      <div className="appointment-info">
                        <span>📧 {appointment.department}</span>
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6c757d' }}>
                        <strong>Date:</strong> {formatDate(appointment.date)} at {appointment.time}
                      </div>
                      <span className={`status-pill ${getStatusClass(appointment.status)}`} style={{ marginTop: '0.5rem' }}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appointments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
              <h2>No Follow-up Appointments</h2>
              <p style={{ marginTop: '1rem' }}>You don't have any follow-up appointments scheduled.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpAppointments;