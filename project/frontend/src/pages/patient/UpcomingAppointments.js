import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/appointments?upcoming=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
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
        fetchAppointments(); // Refresh list
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
      'Completed': 'completed'
    };
    return statusMap[status] || 'pending';
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

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      
      <div className="main-content">
        <PatientTopNav />
        
        <div className="dashboard-content">
          <h1 className="page-title">Upcoming Appointments</h1>

          <div className="section-card">
            {appointments.length > 0 ? (
              <div className="appointment-list">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-item">
                    <div className="doctor-avatar"></div>
                    <div className="appointment-details" style={{ flex: 1 }}>
                      <div className="doctor-name">{appointment.doctorName}</div>
                      <div className="appointment-info">
                        <span>📧 {appointment.department}</span>
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6c757d' }}>
                        <strong>Date:</strong> {formatDate(appointment.date)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                        <strong>Time:</strong> {appointment.time}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                        <strong>Type:</strong> {appointment.type}
                      </div>
                      {appointment.notes && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6c757d' }}>
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}
                      <span className={`status-pill ${getStatusClass(appointment.status)}`} style={{ marginTop: '0.5rem' }}>
                        {appointment.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button className="btn-view">View Details</button>
                      {appointment.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handleCancel(appointment._id)}
                          style={{ 
                            padding: '0.5rem 1rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
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
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                <h2>No Upcoming Appointments</h2>
                <p style={{ marginTop: '1rem' }}>You don't have any upcoming appointments scheduled.</p>
                <button 
                  className="form-button" 
                  style={{ marginTop: '2rem', maxWidth: '300px', margin: '2rem auto' }}
                  onClick={() => window.location.href = '/patient/book-appointment'}
                >
                  Book an Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingAppointments;