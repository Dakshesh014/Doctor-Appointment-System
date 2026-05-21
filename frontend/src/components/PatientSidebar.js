import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PatientSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/messages/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768 && toggleSidebar) {
      toggleSidebar();
    }
  };

  const NavLink = ({ to, icon, label, badge }) => (
    <li className="nav-item">
      <Link
        to={to}
        className={`nav-link ${isActive(to) ? 'active' : ''}`}
        onClick={handleLinkClick}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="nav-icon">{icon}</span>
          {label}
        </span>
        {badge > 0 && (
          <span style={{
            background: '#ef4444',
            color: 'white',
            borderRadius: '12px',
            padding: '1px 7px',
            fontSize: '0.72rem',
            fontWeight: '700',
            minWidth: '20px',
            textAlign: 'center'
          }}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </Link>
    </li>
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => toggleSidebar && toggleSidebar()}></div>}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🏥</div>
          <div className="sidebar-title">Patient Portal</div>
          <button className="sidebar-close" onClick={() => toggleSidebar && toggleSidebar()}>✕</button>
        </div>

        <div className="sidebar-nav">
          {/* Main Navigation */}
          <div className="nav-section">
            <div className="nav-section-title">MAIN NAVIGATION</div>
            <ul className="nav-menu">
              <NavLink to="/patient/dashboard" icon="📊" label="Dashboard" />
            </ul>
          </div>

          {/* Appointments */}
          <div className="nav-section">
            <div className="nav-section-title">APPOINTMENTS</div>
            <ul className="nav-menu">
              <NavLink to="/patient/book-appointment" icon="📅" label="Book Appointment" />
              <NavLink to="/patient/appointments" icon="📋" label="My Appointments" />
              <NavLink to="/patient/video-consultations" icon="🎥" label="Video Consultations" />
            </ul>
          </div>

          {/* Medical Records */}
          <div className="nav-section">
            <div className="nav-section-title">MEDICAL RECORDS</div>
            <ul className="nav-menu">
              <NavLink to="/patient/visit-history" icon="🏥" label="Visit History" />
              <NavLink to="/patient/prescriptions" icon="💊" label="Prescriptions" />
              <NavLink to="/patient/lab-records" icon="🧪" label="Lab Records" />
              <NavLink to="/patient/diagnoses" icon="🩺" label="Diagnoses" />
              <NavLink to="/patient/treatment-plans" icon="📝" label="Treatment Plans" />
            </ul>
          </div>

          {/* Financial */}
          <div className="nav-section">
            <div className="nav-section-title">FINANCIAL</div>
            <ul className="nav-menu">
              <NavLink to="/patient/billing" icon="💰" label="Billing & Payments" />
              <NavLink to="/patient/insurance" icon="🛡️" label="Insurance" />
            </ul>
          </div>

          {/* Communication */}
          <div className="nav-section">
            <div className="nav-section-title">COMMUNICATION</div>
            <ul className="nav-menu">
              <NavLink to="/patient/messages" icon="💬" label="Messages" badge={unreadCount} />
            </ul>
          </div>

          {/* Profile & Settings */}
          <div className="nav-section">
            <div className="nav-section-title">PROFILE & SETTINGS</div>
            <ul className="nav-menu">
              <NavLink to="/patient/my-profile" icon="👤" label="My Profile" />
              <NavLink to="/patient/settings" icon="⚙️" label="Settings" />
            </ul>
          </div>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default PatientSidebar;