import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';
import './Schedule.css';

const AdminSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date and View State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  
  // Details Modal
  const [activeModal, setActiveModal] = useState(null);
  const [selectedApt, setSelectedApt] = useState(null);

  // Time slots generation (9 AM to 6 PM)
  const timeSlots = [];
  for (let i = 9; i <= 18; i++) {
    timeSlots.push(`${i > 12 ? i - 12 : i}:00 ${i >= 12 ? 'PM' : 'AM'}`);
    if (i !== 18) {
      timeSlots.push(`${i > 12 ? i - 12 : i}:30 ${i >= 12 ? 'PM' : 'AM'}`);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch schedule', err);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const formatDateLabel = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleAptClick = (apt) => {
    setSelectedApt(apt);
    setActiveModal('details');
  };

  // Filter appointments for the currently selected date
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date).toLocaleDateString();
    const currDate = currentDate.toLocaleDateString();
    const matchesDoctor = selectedDoctor === 'all' || (apt.doctor && apt.doctor._id === selectedDoctor);
    return aptDate === currDate && matchesDoctor;
  });

  // Extract unique doctors for the column headers
  const uniqueDoctors = [];
  filteredAppointments.forEach(apt => {
    if (apt.doctor && !uniqueDoctors.find(d => d._id === apt.doctor._id)) {
      uniqueDoctors.push(apt.doctor);
    }
  });

  return (
    <div className="dashboard-layout">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <AdminTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content schedule-container">
          <div className="premium-header">
            <h1 className="premium-title">🗓️ Master Schedule</h1>
          </div>

          <div className="schedule-controls">
            <div className="date-navigator">
              <button onClick={() => changeDate(-1)} className="nav-btn">←</button>
              <div className="current-date">{formatDateLabel(currentDate)}</div>
              <button onClick={() => changeDate(1)} className="nav-btn">→</button>
            </div>
            
            <button 
              onClick={() => setCurrentDate(new Date())} 
              className="filter-select" 
              style={{ background: '#3b82f6', color: 'white', border: 'none' }}
            >
              Today
            </button>
          </div>

          <div className="premium-table-card" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading schedule...</div>
            ) : uniqueDoctors.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Appointments Scheduled</h2>
                <p>There are no appointments booked for this date.</p>
              </div>
            ) : (
              <>
                <div className="schedule-header-row" style={{ gridTemplateColumns: `100px repeat(${uniqueDoctors.length}, 1fr)` }}>
                  <div className="time-header-cell">Time</div>
                  {uniqueDoctors.map(doc => (
                    <div key={doc._id} className="doctor-header-cell">
                      Dr. {doc.name}
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{doc.specialization}</div>
                    </div>
                  ))}
                </div>
                
                <div className="schedule-body">
                  {timeSlots.map(time => (
                    <div key={time} className="time-row" style={{ gridTemplateColumns: `100px repeat(${uniqueDoctors.length}, 1fr)` }}>
                      <div className="time-label-cell">{time}</div>
                      
                      {uniqueDoctors.map(doc => {
                        // Find appointment for this doctor at this time
                        const slotApts = filteredAppointments.filter(a => a.doctor._id === doc._id && a.time === time);
                        
                        return (
                          <div key={`${doc._id}-${time}`} className="slot-cell">
                            {slotApts.map(apt => (
                              <div 
                                key={apt._id} 
                                className={`appointment-block status-${apt.status}`}
                                onClick={() => handleAptClick(apt)}
                              >
                                <span className="apt-patient">{apt.patient?.name || 'Unknown'}</span>
                                <span className="apt-type">{apt.type} • {apt.status}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {activeModal === 'details' && selectedApt && (
        <div className="premium-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="premium-modal-container" onClick={e => e.stopPropagation()}>
            <h2 className="premium-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Appointment Details</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>PATIENT</label>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{selectedApt.patient?.name || 'N/A'}</div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>DOCTOR</label>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>Dr. {selectedApt.doctor?.name || 'N/A'}</div>
              <div style={{ color: '#475569', fontSize: '0.9rem' }}>{selectedApt.doctor?.specialization}</div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>DATE & TIME</label>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{new Date(selectedApt.date).toLocaleDateString()} at {selectedApt.time}</div>
              </div>
              <div>
                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>STATUS</label>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#10b981', textTransform: 'capitalize' }}>{selectedApt.status}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>REASON FOR VISIT</label>
              <div style={{ color: '#334155', lineHeight: '1.5' }}>{selectedApt.reason || 'No reason provided.'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setActiveModal(null)} 
                style={{ padding: '0.8rem 2rem', background: '#e2e8f0', color: '#0f172a', fontWeight: '700', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedule;
