import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const PastAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastAppointments();
  }, []);

  const fetchPastAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Filter past appointments
      const past = data.filter(apt => new Date(apt.date) < new Date());
      setAppointments(past);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
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
      'Completed': 'completed',
      'Cancelled': 'pending'
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
          <h1 className="page-title">Past Appointments</h1>

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
                    <button className="btn-view">View Details</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                <h2>No Past Appointments</h2>
                <p style={{ marginTop: '1rem' }}>You don't have any past appointments yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastAppointments;