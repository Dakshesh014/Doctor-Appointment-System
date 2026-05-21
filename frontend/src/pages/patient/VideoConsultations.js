import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const VideoConsultations = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchVideoConsultations();
    const ticker = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const fetchVideoConsultations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const video = data.filter(apt => apt.type === 'Video' || apt.type === 'Video Call');
        setAppointments(video);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getCountdown = (dateString, timeString) => {
    try {
      const [time, period] = timeString.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      const apptDate = new Date(dateString);
      apptDate.setHours(h, m, 0, 0);
      const diff = apptDate - now;
      if (diff < 0) return null;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) return `${days}d ${hours}h ${mins}m`;
      if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
      return `${mins}m ${secs}s`;
    } catch { return null; }
  };

  const isJoinable = (dateString, timeString, status) => {
    if (status !== 'confirmed') return false;
    try {
      const [time, period] = timeString.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      const apptDate = new Date(dateString);
      apptDate.setHours(h, m, 0, 0);
      const diff = apptDate - now;
      return diff <= 5 * 60 * 1000 && diff >= -60 * 60 * 1000; // 5 min before to 1hr after
    } catch { return false; }
  };

  const getStatusColor = (status) => {
    const map = {
      pending: { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
      confirmed: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
      completed: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
      cancelled: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' },
      rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
    };
    return map[status] || map.pending;
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => ['pending', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date()).length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => ['cancelled', 'rejected'].includes(a.status)).length
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="main-content">
          <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="dashboard-content">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>⏳</div>
              <h2 className="page-title">Loading Video Consultations...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-content">
        <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 className="page-title">🎥 Video Consultations</h1>
            <button
              onClick={() => navigate('/patient/book-appointment')}
              style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              📅 Book Video Consultation
            </button>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Sessions', value: stats.total, icon: '🎥', color: '#667eea' },
              { label: 'Upcoming', value: stats.upcoming, icon: '📅', color: '#10b981' },
              { label: 'Completed', value: stats.completed, icon: '✅', color: '#4a9eff' },
              { label: 'Cancelled', value: stats.cancelled, icon: '❌', color: '#ef4444' }
            ].map(s => (
              <div key={s.label} style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: filter === f ? '#667eea' : '#e5e7eb',
                  background: filter === f ? '#667eea' : 'white',
                  color: filter === f ? 'white' : '#6c757d',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span style={{ marginLeft: '0.4rem', opacity: 0.8 }}>
                  ({f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length})
                </span>
              </button>
            ))}
          </div>

          {/* Consultation Cards */}
          {filtered.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filtered.map((apt) => {
                const countdown = getCountdown(apt.date, apt.time);
                const joinable = isJoinable(apt.date, apt.time, apt.status);
                const statusStyle = getStatusColor(apt.status);

                return (
                  <div key={apt._id} style={{
                    background: 'white',
                    border: `2px solid ${joinable ? '#10b981' : statusStyle.border}`,
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: joinable ? '0 4px 20px rgba(16, 185, 129, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'box-shadow 0.2s',
                    position: 'relative'
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = joinable ? '0 4px 20px rgba(16,185,129,0.15)' : '0 2px 8px rgba(0,0,0,0.06)'}
                  >
                    {joinable && (
                      <div style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: '#10b981', color: 'white', padding: '0.35rem 1rem',
                        borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
                        animation: 'pulse 2s infinite'
                      }}>
                        🔴 LIVE - Join Now
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      {/* Doctor Avatar */}
                      <div style={{
                        width: '70px', height: '70px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '800', fontSize: '1.75rem', flexShrink: 0
                      }}>
                        {apt.doctor?.name?.charAt(0) || 'D'}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                              Dr. {apt.doctor?.name}
                            </h3>
                            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                              {apt.doctor?.specialization || 'General Physician'}
                            </div>
                          </div>
                          <span style={{
                            padding: '0.5rem 1.25rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700',
                            background: statusStyle.bg, color: statusStyle.text
                          }}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                          <div style={{ padding: '0.75rem 1rem', background: '#f0f9ff', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>Date</div>
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>📅 {formatDate(apt.date)}</div>
                          </div>
                          <div style={{ padding: '0.75rem 1rem', background: '#f0f9ff', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>Time</div>
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>🕒 {apt.time}</div>
                          </div>
                          {apt.reason && (
                            <div style={{ padding: '0.75rem 1rem', background: '#f0f9ff', borderRadius: '8px' }}>
                              <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>Reason</div>
                              <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{apt.reason}</div>
                            </div>
                          )}
                        </div>

                        {/* Countdown */}
                        {countdown && apt.status === 'confirmed' && (
                          <div style={{
                            padding: '0.75rem 1.25rem', background: joinable ? '#d1fae5' : '#eff6ff',
                            borderRadius: '8px', marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem'
                          }}>
                            <span style={{ fontSize: '1.25rem' }}>{joinable ? '🔔' : '⏱️'}</span>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{joinable ? 'Consultation is LIVE!' : 'Starts in'}</div>
                              <div style={{ fontWeight: '800', color: joinable ? '#065f46' : '#1e40af', fontSize: '1.1rem' }}>{countdown}</div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => alert(joinable ? '🚀 Joining video call... (Video integration would launch here)' : 'Video call will be available 5 minutes before your appointment')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: joinable ? 'linear-gradient(135deg, #10b981, #059669)' : '#e5e7eb',
                              color: joinable ? 'white' : '#9ca3af',
                              border: 'none', borderRadius: '8px', cursor: joinable ? 'pointer' : 'not-allowed',
                              fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                          >
                            🎥 {joinable ? 'Join Video Call' : 'Call Not Active'}
                          </button>

                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <button
                              onClick={() => navigate('/patient/appointments')}
                              style={{ padding: '0.75rem 1.5rem', background: 'white', color: '#ef4444', border: '2px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              Reschedule / Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="section-card" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎥</div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                {filter === 'all' ? 'No Video Consultations' : `No ${filter} video consultations`}
              </h3>
              <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '2rem' }}>
                Book a video consultation for remote medical advice from home.
              </p>
              <button
                onClick={() => navigate('/patient/book-appointment')}
                style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}
              >
                📅 Book Video Consultation
              </button>
            </div>
          )}

          {/* How It Works */}
          <div className="section-card" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#2c3544' }}>
              📖 How Video Consultations Work
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {[
                { step: '1', icon: '📅', title: 'Book Appointment', desc: 'Select "Video Consultation" when booking' },
                { step: '2', icon: '✅', title: 'Get Confirmed', desc: 'Doctor confirms your video session' },
                { step: '3', icon: '⏰', title: 'Join on Time', desc: 'Button activates 5 mins before session' },
                { step: '4', icon: '🎥', title: 'Consult Doctor', desc: 'Have your video consultation' }
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', flexShrink: 0 }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{s.icon} {s.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultations;