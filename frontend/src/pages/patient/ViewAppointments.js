import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';
import './ViewAppointments.css';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'cancel', 'reschedule', 'review'
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Form States
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingData, setSubmittingData] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? 'http://localhost:5000/api/patient/appointments'
        : `http://localhost:5000/api/patient/appointments?status=${filter}`;
      
      const response = await fetch(url, {
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

  // ---------------- MODAL HANDLERS ----------------
  const openModal = (type, appointment) => {
    setSelectedAppointment(appointment);
    setActiveModal(type);
    if (type === 'cancel') setCancelReason('');
    if (type === 'reschedule') setRescheduleData({ date: '', time: '' });
    if (type === 'review') setReviewData({ rating: 5, comment: '' });
  };
  const closeModal = () => {
    setActiveModal(null);
    setSelectedAppointment(null);
  };

  // ---------------- CANCEL LOGIC ----------------
  const submitCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    setSubmittingData(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/patient/appointments/${selectedAppointment._id}/cancel`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (response.ok) {
        alert('✅ Appointment cancelled successfully');
        closeModal();
        fetchAppointments();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Error cancelling appointment');
    } finally {
      setSubmittingData(false);
    }
  };

  // ---------------- RESCHEDULE LOGIC ----------------
  useEffect(() => {
    if (activeModal === 'reschedule' && selectedAppointment && rescheduleData.date) {
      fetchSlots(selectedAppointment.doctor._id, rescheduleData.date);
    }
  }, [rescheduleData.date, activeModal, selectedAppointment]);

  const fetchSlots = async (doctorId, date) => {
    setFetchingSlots(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/patient/appointments/available-slots?doctorId=${doctorId}&date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
        setSuggestedSlots(data.suggestedSlots || []);
      }
    } catch (err) {
      console.error('Error fetching slots', err);
    } finally {
      setFetchingSlots(false);
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      alert('Please select both date and time.');
      return;
    }
    setSubmittingData(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/patient/appointments/${selectedAppointment._id}/reschedule`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newDate: rescheduleData.date, newTime: rescheduleData.time })
      });

      if (response.ok) {
        alert('✅ Appointment rescheduled successfully');
        closeModal();
        fetchAppointments();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Error rescheduling appointment');
    } finally {
      setSubmittingData(false);
    }
  };

  // ---------------- REVIEW LOGIC ----------------
  const submitReview = async () => {
    setSubmittingData(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/review`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          rating: reviewData.rating,
          comment: reviewData.comment
        })
      });

      if (response.ok) {
        alert('✅ Review submitted successfully');
        closeModal();
      } else {
        // Just silent close or alert, avoiding duplicate alert on 'You already reviewed'
        alert(`Review response received`);
        closeModal();
      }
    } catch (error) {
      alert('Error submitting review');
    } finally {
      setSubmittingData(false);
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
        <PatientSidebar />
        <div className="main-content">
          <PatientTopNav />
          <div className="dashboard-content view-appointments-container">
            <h1 className="premium-title">Loading...</h1>
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
        
        <div className="dashboard-content view-appointments-container">
          <div className="premium-header">
            <h1 className="premium-title">📋 My Appointments</h1>
            <button
              onClick={() => window.location.href = '/patient/book-appointment'}
              className="premium-btn-new"
            >
              📅 Book New Appointment
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="premium-filters">
            <button
              onClick={() => setFilter('all')}
              className={`premium-filter-btn all ${filter === 'all' ? 'active' : ''}`}
            >
              All ({appointments.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`premium-filter-btn pending ${filter === 'pending' ? 'active' : ''}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`premium-filter-btn confirmed ${filter === 'confirmed' ? 'active' : ''}`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`premium-filter-btn completed ${filter === 'completed' ? 'active' : ''}`}
            >
              Completed
            </button>
          </div>

          {/* Appointments List */}
          <div className="premium-table-card">
            {appointments.length > 0 ? (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Doctor Details</th>
                    <th>Consultation Details</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>
                        <div className="doctor-info-cell">
                          <div className="doctor-avatar">
                            {appointment.doctor?.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="doctor-name">Dr. {appointment.doctor?.name}</div>
                            <div className="doctor-spec">
                              {appointment.doctor?.specialization || 'General'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#475569', fontWeight: '600', marginBottom: '0.25rem' }}>
                          {appointment.department || 'General'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {appointment.type === 'Video' ? '🎥' : '🏥'} {appointment.type}
                        </div>
                      </td>
                      <td className="date-time-cell">
                        <div className="date-text">{formatDate(appointment.date)}</div>
                        <div className="time-text">🕒 {appointment.time}</div>
                      </td>
                      <td>
                        <span className={`status-badge status-${appointment.status}`}>
                          {appointment.status === 'pending' && '⏳'}
                          {appointment.status === 'confirmed' && '✓'}
                          {appointment.status === 'completed' && '🌟'}
                          {appointment.status === 'cancelled' && '✕'}
                          {appointment.status === 'rejected' && '⚠'}
                          &nbsp;{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="actions-container">
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <>
                              <button 
                                onClick={() => openModal('reschedule', appointment)}
                                className="action-btn action-reschedule"
                              >
                                🔄 Reschedule
                              </button>
                              <button 
                                onClick={() => openModal('cancel', appointment)}
                                className="action-btn action-cancel"
                              >
                                ✕ Cancel
                              </button>
                            </>
                          )}
                          {appointment.status === 'completed' && (
                            <button 
                              onClick={() => openModal('review', appointment)}
                              className="action-btn action-review"
                            >
                              ⭐ Rate Service
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="appointments-empty">
                <div className="appointments-empty-icon">📅</div>
                <h3 className="appointments-empty-title">
                  {filter === 'all' 
                    ? "You haven't booked any appointments yet"
                    : `No ${filter} appointments found`}
                </h3>
                <p className="appointments-empty-text">
                  Your health is important. Schedule a checkup with our top-rated doctors today.
                </p>
                <button
                  onClick={() => window.location.href = '/patient/book-appointment'}
                  className="premium-btn-new"
                  style={{ display: 'inline-flex', margin: '0 auto' }}
                >
                  📅 Book Your First Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="premium-modal-backdrop">
          <div className="premium-modal-container">
            {/* CANCEL MODAL */}
            {activeModal === 'cancel' && (
              <>
                <div className="premium-modal-header">
                  <h2 className="premium-modal-title">Cancel Appointment</h2>
                  <p className="premium-modal-subtitle">
                    Please provide a reason for cancelling your appointment with Dr. {selectedAppointment?.doctor?.name}.
                  </p>
                </div>
                <div className="premium-modal-body">
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="premium-modal-textarea"
                    placeholder="Reason for cancellation..."
                    rows="4"
                    required
                  />
                </div>
                <div className="premium-modal-footer">
                  <button onClick={closeModal} className="premium-modal-btn-cancel">Cancel</button>
                  <button onClick={submitCancel} disabled={submittingData} className="premium-modal-btn-confirm">
                    {submittingData ? 'Processing...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </>
            )}

            {/* RESCHEDULE MODAL */}
            {activeModal === 'reschedule' && (
              <>
                <div className="premium-modal-header">
                  <h2 className="premium-modal-title">Reschedule Appointment</h2>
                  <p className="premium-modal-subtitle">
                    Select a new date and time for Dr. {selectedAppointment?.doctor?.name}.
                  </p>
                </div>
                <div className="premium-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1e293b' }}>New Date</label>
                    <input
                      type="date"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="premium-modal-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1e293b' }}>
                      New Time {fetchingSlots && <span style={{fontSize: '0.85rem', color: '#3b82f6'}}>(Loading slots...)</span>}
                    </label>
                    <select
                      value={rescheduleData.time}
                      onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                      disabled={!rescheduleData.date || fetchingSlots || availableSlots.length === 0}
                      className="premium-modal-select"
                    >
                      <option value="">
                        {!rescheduleData.date ? 'Select a date first...' : availableSlots.length === 0 ? 'No slots available' : 'Select new time...'}
                      </option>
                      {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                    
                    {suggestedSlots.length > 0 && rescheduleData.date && (
                      <div style={{ marginTop: '1rem' }}>
                        <span style={{ color: '#059669', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>💡 Suggested: </span>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {suggestedSlots.map(slot => (
                            <span 
                              key={slot} 
                              onClick={() => setRescheduleData(prev => ({ ...prev, time: slot }))}
                              style={{ 
                                cursor: 'pointer', 
                                background: rescheduleData.time === slot ? '#10b981' : 'white', 
                                padding: '6px 14px', 
                                borderRadius: '20px', 
                                border: rescheduleData.time === slot ? '2px solid #10b981' : '2px solid #e2e8f0', 
                                color: rescheduleData.time === slot ? 'white' : '#64748b',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                              }}
                            >
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="premium-modal-footer">
                  <button onClick={closeModal} className="premium-modal-btn-cancel">Cancel</button>
                  <button onClick={submitReschedule} disabled={submittingData} className="premium-modal-btn-confirm reschedule">
                    {submittingData ? 'Processing...' : 'Confirm Reschedule'}
                  </button>
                </div>
              </>
            )}

            {/* REVIEW MODAL */}
            {activeModal === 'review' && (
              <>
                <div className="premium-modal-header">
                  <h2 className="premium-modal-title" style={{ textAlign: 'center' }}>Rate Service</h2>
                  <p className="premium-modal-subtitle" style={{ textAlign: 'center' }}>
                    How was your experience with Dr. {selectedAppointment?.doctor?.name}?
                  </p>
                </div>
                <div className="premium-modal-body">
                  <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                      {[1,2,3,4,5].map(star => (
                        <span 
                          key={star} 
                          onClick={() => setReviewData({...reviewData, rating: star})} 
                          className="star-rating"
                          style={{ filter: reviewData.rating >= star ? 'drop-shadow(0 0 5px rgba(251, 191, 36, 0.5))' : 'grayscale(100%) opacity(30%)' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      {reviewData.rating === 5 ? 'Excellent' : reviewData.rating === 4 ? 'Good' : reviewData.rating === 3 ? 'Average' : reviewData.rating === 2 ? 'Poor' : 'Terrible'}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#1e293b' }}>Any additional comments?</label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                      className="premium-modal-textarea"
                      rows="4"
                      placeholder="Share your experience (optional)..."
                    />
                  </div>
                </div>
                <div className="premium-modal-footer">
                  <button onClick={closeModal} className="premium-modal-btn-cancel">Cancel</button>
                  <button onClick={submitReview} disabled={submittingData} className="premium-modal-btn-confirm review">
                    {submittingData ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAppointments;