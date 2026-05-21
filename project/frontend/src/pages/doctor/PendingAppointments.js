import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const PendingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/appointments/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    const notes = prompt('Add any notes for the patient (optional):');
    const videoLink = prompt('For video consultations, add meeting link (optional):');

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doctor/appointments/${id}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes, videoLink })
      });

      if (response.ok) {
        alert('✅ Appointment accepted successfully!');
        fetchPendingAppointments();
      } else {
        alert('❌ Failed to accept appointment');
      }
    } catch (error) {
      alert('Error accepting appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doctor/appointments/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('❌ Appointment rejected');
        fetchPendingAppointments();
      } else {
        alert('Failed to reject appointment');
      }
    } catch (error) {
      alert('Error rejecting appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DoctorSidebar />
        <div className="main-content">
          <DoctorTopNav />
          <div className="dashboard-content">
            <h1 className="page-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DoctorSidebar />
      
      <div className="main-content">
        <DoctorTopNav />
        
        <div className="dashboard-content">
          <h1 className="page-title">⏳ Pending Appointment Requests</h1>

          {appointments.length > 0 && (
            <div style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ fontSize: '1.5rem' }}>⚠️</div>
              <div>
                <strong>{appointments.length} Appointment Request(s) Pending</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                  Please review and respond to patient appointment requests
                </p>
              </div>
            </div>
          )}

          <div className="section-card">
            {appointments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {appointments.map((appointment) => (
                  <div 
                    key={appointment._id}
                    style={{
                      padding: '2rem',
                      border: '2px solid #fb923c',
                      borderRadius: '12px',
                      background: '#fffbeb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                            {appointment.patient?.name}
                          </h3>
                          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                            📧 {appointment.patient?.email}
                          </div>
                          {appointment.patient?.phone && (
                            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                              📱 {appointment.patient.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          background: '#fef3c7',
                          color: '#92400e'
                        }}>
                          ⏳ Pending Response
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '1.5rem',
                      marginBottom: '1.5rem',
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                          📅 Date
                        </div>
                        <div style={{ fontWeight: '600' }}>{formatDate(appointment.date)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                          ⏰ Time
                        </div>
                        <div style={{ fontWeight: '600' }}>{appointment.time}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                          📍 Type
                        </div>
                        <div style={{ fontWeight: '600' }}>
                          {appointment.type === 'Video' ? '🎥' : '🏥'} {appointment.type}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                          🏥 Department
                        </div>
                        <div style={{ fontWeight: '600' }}>{appointment.department || 'General'}</div>
                      </div>
                    </div>

                    <div style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                        📝 Reason for Visit:
                      </div>
                      <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                        {appointment.reason}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleReject(appointment._id)}
                        disabled={actionLoading}
                        style={{
                          padding: '0.75rem 2rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '1rem'
                        }}
                      >
                        ❌ Reject
                      </button>
                      <button
                        onClick={() => handleAccept(appointment._id)}
                        disabled={actionLoading}
                        style={{
                          padding: '0.75rem 2rem',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '1rem'
                        }}
                      >
                        ✅ Accept Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>All Caught Up!</h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                  No pending appointment requests at this time
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingAppointments;