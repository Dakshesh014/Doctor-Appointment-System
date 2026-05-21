import React, { useState } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('Week'); // Week or Day
  
  // Dummy data for schedule blocks
  const [scheduleBlocks, setScheduleBlocks] = useState([
    { id: 1, day: 'Monday', time: '09:00 AM - 01:00 PM', type: 'Available', color: '#10b981' },
    { id: 2, day: 'Monday', time: '02:00 PM - 05:00 PM', type: 'Available', color: '#10b981' },
    { id: 3, day: 'Tuesday', time: '10:00 AM - 04:00 PM', type: 'Available', color: '#10b981' },
    { id: 4, day: 'Wednesday', time: '09:00 AM - 12:00 PM', type: 'Blocked', color: '#ef4444' }, // Out of office
    { id: 5, day: 'Thursday', time: '09:00 AM - 05:00 PM', type: 'Available', color: '#10b981' },
    { id: 6, day: 'Friday', time: '09:00 AM - 01:00 PM', type: 'Available', color: '#10b981' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    type: 'Available'
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddBlock = (e) => {
    e.preventDefault();
    const newBlock = {
      id: Date.now(),
      day: formData.day,
      time: `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`,
      type: formData.type,
      color: formData.type === 'Available' ? '#10b981' : '#ef4444'
    };
    setScheduleBlocks([...scheduleBlocks, newBlock]);
    setShowModal(false);
  };

  const removeBlock = (id) => {
    setScheduleBlocks(scheduleBlocks.filter(b => b.id !== id));
  };

  // Helper to format 24h to 12h AM/PM
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  return (
    <div className="dashboard-layout">
      <DoctorSidebar />
      
      <div className="main-content">
        <DoctorTopNav />
        
        <div className="dashboard-content">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>📆</span> Schedule & Availability
              </h1>
              <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>Manage your appointment slots, working hours, and time off</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setView('Week')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: view === 'Week' ? '#f1f5f9' : 'white',
                    color: view === 'Week' ? '#334155' : '#64748b',
                    border: 'none',
                    fontWeight: view === 'Week' ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Week View
                </button>
                <button 
                  onClick={() => setView('Day')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: view === 'Day' ? '#f1f5f9' : 'white',
                    color: view === 'Day' ? '#334155' : '#64748b',
                    border: 'none',
                    fontWeight: view === 'Day' ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderLeft: '1px solid #e2e8f0'
                  }}
                >
                  Day View
                </button>
              </div>

              <button 
                onClick={() => setShowModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(14, 165, 233, 0.2)',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                + Add Time Block
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', alignItems: 'start' }}>
            {/* Main Calendar View Area */}
            <div className="section-card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>◀</button>
                  <h3 style={{ margin: 0, color: '#1e293b' }}>
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>▶</button>
                </div>
                <button style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500', color: '#475569', cursor: 'pointer' }}>
                  Today
                </button>
              </div>

              {/* Weekly Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#e2e8f0', gap: '1px' }}>
                {daysOfWeek.map((day, idx) => (
                  <div key={day} style={{ background: 'white', minHeight: '600px' }}>
                    <div style={{ padding: '1rem 0', textAlign: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{day.substring(0, 3)}</div>
                    </div>
                    
                    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {scheduleBlocks.filter(b => b.day === day).map(block => (
                        <div 
                          key={block.id}
                          style={{
                            background: `${block.color}15`,
                            borderLeft: `4px solid ${block.color}`,
                            padding: '0.5rem',
                            borderRadius: '4px',
                            position: 'relative',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                            transition: 'transform 0.1s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: block.color }}>
                            {block.type}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '500' }}>
                            {block.time}
                          </div>
                          
                          <button 
                            onClick={() => removeBlock(block.id)}
                            style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                            title="Remove Block"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Stats and Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="section-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📊 Weekly Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Available</span>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>32 Hours</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Appt. Slots</span>
                    <span style={{ fontWeight: '700', color: '#3b82f6' }}>~64</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Blocked/Off</span>
                    <span style={{ fontWeight: '700', color: '#ef4444' }}>3 Hours</span>
                  </div>
                </div>
              </div>

              <div className="section-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.1rem' }}>
                   ⚡ Quick Settings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#475569', cursor: 'pointer' }}>
                     <input type="checkbox" defaultChecked /> Auto-approve bookings
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#475569', cursor: 'pointer' }}>
                     <input type="checkbox" defaultChecked /> Send me reminders
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#475569', cursor: 'pointer' }}>
                     <input type="checkbox" /> Block weekends automatically
                   </label>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Add Time Block Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⏱️ Add Time Block
            </h2>
            <form onSubmit={handleAddBlock}>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Block Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label style={{ 
                    padding: '1rem', 
                    border: `2px solid ${formData.type === 'Available' ? '#10b981' : '#e2e8f0'}`, 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    background: formData.type === 'Available' ? '#ecfdf5' : 'white',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <input type="radio" name="type" value="Available" checked={formData.type === 'Available'} onChange={handleInputChange} style={{ display: 'none' }} />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontWeight: '600', color: '#065f46' }}>Available</span>
                  </label>
                  
                  <label style={{ 
                    padding: '1rem', 
                    border: `2px solid ${formData.type === 'Blocked' ? '#ef4444' : '#e2e8f0'}`, 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    background: formData.type === 'Blocked' ? '#fef2f2' : 'white',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <input type="radio" name="type" value="Blocked" checked={formData.type === 'Blocked'} onChange={handleInputChange} style={{ display: 'none' }} />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ef4444' }}></div>
                    <span style={{ fontWeight: '600', color: '#991b1b' }}>Blocked / Off</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Day of Week</label>
                <select 
                  name="day" 
                  value={formData.day} 
                  onChange={handleInputChange} 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                >
                  {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Start Time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={formData.startTime} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>End Time</label>
                  <input 
                    type="time" 
                    name="endTime" 
                    value={formData.endTime} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Save Time Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;