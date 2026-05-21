import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const AppointmentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentRequests();
  }, []);

  const fetchAppointmentRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/appointments?status=Pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment request?')) {
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
        fetchAppointmentRequests();
      } catch (error) {
        console.error('Error cancelling request:', error);
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
          <h1 className="page-title">Appointment Requests</h1>
          
          <div className="section-card">
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
              <p style={{ margin: 0, color: '#856404' }}>
                <strong>ℹ️ Pending Requests:</strong> These appointments are awaiting confirmation from the doctor's office. You will be notified once they are confirmed.
              </p>
            </div>

            {requests.length > 0 ? (
              <div className="dashboard-cards">
                {requests.map((request) => (
                  <div key={request._id} className="dashboard-card">
                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#2c3544', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {request.doctorName}
                        </h3>
                        <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          <strong>Department:</strong> {request.department}
                        </p>
                      </div>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        background: '#fbbf2420',
                        color: '#fbbf24'
                      }}>
                        Pending
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
                      <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>Requested Date:</strong> {formatDate(request.date)}
                      </p>
                      <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>Time:</strong> {request.time}
                      </p>
                      <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>Type:</strong> {request.type}
                      </p>
                      
                      {request.notes && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '4px' }}>
                          <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Your Notes:</strong>
                          <p style={{ marginTop: '0.5rem', color: '#6c757d', fontSize: '0.85rem' }}>
                            {request.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleCancelRequest(request._id)}
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
                        Cancel Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                <h2>No Pending Requests</h2>
                <p style={{ marginTop: '1rem' }}>You don't have any pending appointment requests.</p>
                <button 
                  className="form-button" 
                  style={{ marginTop: '2rem', maxWidth: '300px', margin: '2rem auto' }}
                  onClick={() => window.location.href = '/patient/book-appointment'}
                >
                  Book New Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentRequests;