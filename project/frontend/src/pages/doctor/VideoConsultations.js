import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';
import './VideoConsultations.css';

const VideoConsultations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming, completed, all

  useEffect(() => {
    fetchVideoAppointments();
  }, []);

  const fetchVideoAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      
      // Filter ONLY video appointments
      const videoApts = data.filter(apt => apt.type === 'Video');
      
      // Sort by date/time ascending
      videoApts.sort((a, b) => {
        const dateA = new Date(`${a.date.split('T')[0]}T${a.time}:00`);
        const dateB = new Date(`${b.date.split('T')[0]}T${b.time}:00`);
        return dateA - dateB;
      });

      setAppointments(videoApts);
    } catch (error) {
      console.error('Error fetching video appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0,0,0,0);

    switch(filter) {
      case 'upcoming':
        return appointments.filter(apt => new Date(apt.date) >= today && (apt.status === 'confirmed' || apt.status === 'pending'));
      case 'completed':
        return appointments.filter(apt => apt.status === 'completed');
      default:
        return appointments;
    }
  };

  const filteredApts = getFilteredAppointments();

  const isJoinable = (aptDate, aptTime) => {
    const aptDateTime = new Date(`${aptDate.split('T')[0]}T${aptTime}:00`);
    const now = new Date();
    // Allow joining 15 mins before to 1 hour after start
    const fifteenMinsBefore = new Date(aptDateTime.getTime() - 15 * 60000);
    const oneHourAfter = new Date(aptDateTime.getTime() + 60 * 60000);
    return now >= fifteenMinsBefore && now <= oneHourAfter;
  };

  return (
    <div className="dashboard-layout">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <DoctorTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content video-consults-container">
          <div className="premium-header">
            <h1 className="premium-title">📹 Video Consultations</h1>
          </div>

          {!loading && (
            <div className="stats-row">
              <div className="video-stat-card">
                <div className="video-stat-icon icon-purple">📅</div>
                <div className="video-stat-details">
                  <h3>{appointments.filter(a => new Date(a.date) >= new Date().setHours(0,0,0,0) && a.status === 'confirmed').length}</h3>
                  <p>Upcoming Sessions</p>
                </div>
              </div>
              <div className="video-stat-card">
                <div className="video-stat-icon icon-blue">🌐</div>
                <div className="video-stat-details">
                  <h3>{appointments.filter(a => a.status === 'completed').length}</h3>
                  <p>Completed Virtual Visits</p>
                </div>
              </div>
              <div className="video-stat-card">
                <div className="video-stat-icon icon-green">⏳</div>
                <div className="video-stat-details">
                  <h3>{appointments.filter(a => a.status === 'pending').length}</h3>
                  <p>Pending Requests</p>
                </div>
              </div>
            </div>
          )}

          <div className="filter-tabs">
            <button className={`tab-btn ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>Upcoming</button>
            <button className={`tab-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
            <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Appointments</button>
          </div>

          {loading ? (
            <div className="empty-state">
              <h2>Loading video schedule...</h2>
            </div>
          ) : filteredApts.length === 0 ? (
            <div className="empty-state">
              <h2>No {filter} virtual appointments</h2>
              <p>You have no video consultations matching this filter criteria.</p>
            </div>
          ) : (
            <div className="video-grid">
              {filteredApts.map(apt => {
                const joinable = isJoinable(apt.date, apt.time) && apt.status === 'confirmed';
                const dateObj = new Date(apt.date);

                return (
                  <div key={apt._id} className="video-card">
                    <div className="vc-header">
                      <div className="vc-patient">
                        <div className="vc-avatar">
                          {apt.patient?.name ? apt.patient.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <div className="vc-name">{apt.patient?.name || 'Unknown Patient'}</div>
                          <div className="vc-reason">{apt.reason || 'General Consultation'}</div>
                        </div>
                      </div>
                      <span className={`vc-status status-${apt.status}`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="vc-datetime">
                      <div className="vc-time-icon">🕒</div>
                      <div className="vc-time-details">
                        <h4>{dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})} at {apt.time}</h4>
                        <p>{apt.duration || 30} min session</p>
                      </div>
                    </div>

                    <div className="vc-actions">
                      {apt.status === 'completed' ? (
                        <button disabled className="btn-join" style={{ background: '#f1f5f9', color: '#64748b'}}>
                          Session Ended
                        </button>
                      ) : (
                        <a 
                          href={joinable && apt.videoLink ? apt.videoLink : '#'} 
                          target={joinable && apt.videoLink ? "_blank" : "_self"}
                          rel="noreferrer"
                          className="btn-join"
                          onClick={e => (!joinable || !apt.videoLink) && e.preventDefault()}
                          style={{
                            opacity: (!joinable || !apt.videoLink) ? 0.7 : 1,
                            cursor: (!joinable || !apt.videoLink) ? 'not-allowed' : 'pointer',
                            background: (!joinable || !apt.videoLink) ? '#94a3b8' : ''
                          }}
                        >
                          {apt.status === 'pending' ? 'Needs Confirmation' : 
                           !apt.videoLink ? 'No Link Provided' :
                           joinable ? '📹 Join Call Now' : 'Not Time Yet'}
                        </a>
                      )}
                      <Link to={`/doctor/appointments`} className="btn-details">
                        Manage
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VideoConsultations;
