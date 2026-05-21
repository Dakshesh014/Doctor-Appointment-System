import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';
import './BookAppointment.css';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    type: 'In Person',
    reason: '',
    department: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  useEffect(() => {
    fetchAvailableDoctors();
  }, []);

  useEffect(() => {
    let intervalId;
    if (formData.doctor && formData.date) {
      fetchSlots(formData.doctor, formData.date);
      
      // Auto-refresh slots every 30 seconds
      intervalId = setInterval(() => {
        fetchSlots(formData.doctor, formData.date);
      }, 30000);
    } else {
      setAvailableSlots([]);
      setSuggestedSlots([]);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [formData.doctor, formData.date]);

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

  const fetchAvailableDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/doctors/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill department when doctor is selected
    if (name === 'doctor') {
      const selectedDoctor = doctors.find(d => d._id === value);
      if (selectedDoctor) {
        setFormData(prev => ({
          ...prev,
          department: selectedDoctor.specialization || ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctor || !formData.date || !formData.time || !formData.reason) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Appointment booked successfully! Waiting for doctor confirmation.' 
        });
        // Reset form
        setFormData({
          doctor: '',
          date: '',
          time: '',
          type: 'In Person',
          reason: '',
          department: ''
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/patient/appointments';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to book appointment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error booking appointment. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar />
        <div className="main-content">
          <PatientTopNav />
          <div className="dashboard-content book-appointment-container">
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
        
        <div className="dashboard-content book-appointment-container">
          <h1 className="premium-title">✨ Book Appointment</h1>

          {message.text && (
            <div className={`premium-alert ${message.type}`}>
              {message.type === 'success' ? '✅' : '❌'} {message.text}
            </div>
          )}

          {doctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">😔</div>
              <h3 className="empty-title">No Doctors Available</h3>
              <p className="empty-text">
                There are currently no approved doctors available for appointments.
              </p>
            </div>
          ) : (
            <div className="premium-card">
              <form onSubmit={handleSubmit}>
                <div className="premium-form-grid">
                  {/* Select Doctor */}
                  <div className="premium-form-group">
                    <label className="premium-label">Select Doctor *</label>
                    <select
                      name="doctor"
                      value={formData.doctor}
                      onChange={handleChange}
                      className="premium-select"
                      required
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} - {doctor.specialization || 'General'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div className="premium-form-group">
                    <label className="premium-label">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="premium-input"
                      placeholder="Auto-filled based on doctor"
                      readOnly
                    />
                  </div>

                  {/* Appointment Date */}
                  <div className="premium-form-group">
                    <label className="premium-label">Appointment Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="premium-input"
                      min={getMinDate()}
                      required
                    />
                  </div>

                  {/* Appointment Time */}
                  <div className="premium-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="premium-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Appointment Time *</span>
                      {fetchingSlots && <span style={{ color: '#3b82f6', fontSize: '0.85rem' }}><i className="fas fa-circle-notch fa-spin"></i> Loading slots...</span>}
                    </label>
                    
                    {!formData.doctor || !formData.date ? (
                      <div className="time-slot-message">
                         Please select a doctor and date first to see available time slots.
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="time-slot-message error">
                         No time slots available for this date. Please select another date.
                      </div>
                    ) : (
                      <div className="time-slots-grid">
                        {availableSlots.map(slot => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                            className={`time-slot-btn ${formData.time === slot ? 'selected' : ''}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {suggestedSlots.length > 0 && formData.doctor && formData.date && (
                      <div className="suggested-slots-container">
                        <div style={{ color: '#059669', fontWeight: '800', marginBottom: '0.25rem' }}>💡 Suggested best slots:</div>
                        {suggestedSlots.map(slot => (
                          <span 
                            key={slot} 
                            onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                            className={`suggested-slot ${formData.time === slot ? 'selected' : ''}`}
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Appointment Type */}
                  <div className="premium-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="premium-label">Consultation Type *</label>
                    <div className="type-selector">
                      <label className={`type-label ${formData.type === 'In Person' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="type"
                          value="In Person"
                          checked={formData.type === 'In Person'}
                          onChange={handleChange}
                        />
                        🏥 In Person
                      </label>
                      <label className={`type-label ${formData.type === 'Video' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="type"
                          value="Video"
                          checked={formData.type === 'Video'}
                          onChange={handleChange}
                        />
                        🎥 Video Consultation
                      </label>
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  <div className="premium-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="premium-label">Reason for Visit *</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      className="premium-textarea"
                      rows="4"
                      placeholder="Please describe your symptoms or reason for visit in detail..."
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="premium-btn-submit"
                  >
                    {submitting ? 'Processing Booking...' : '📅 Confirm Booking'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/patient/appointments'}
                    className="premium-btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;