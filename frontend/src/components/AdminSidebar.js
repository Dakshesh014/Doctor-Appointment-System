import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

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
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🛡️</div>
          <div className="sidebar-title">Admin Portal</div>
          <button className="sidebar-close" onClick={toggleSidebar}>✕</button>
        </div>

        <div className="sidebar-nav">
          {/* Dashboard */}
          <div className="nav-section">
            <div className="nav-section-title">DASHBOARD</div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">📊</span>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* User Management */}
          <div className="nav-section">
            <div className="nav-section-title">USER MANAGEMENT</div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/admin/all-users" className={`nav-link ${isActive('/admin/all-users') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">👥</span>
                  All Users
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/patients" className={`nav-link ${isActive('/admin/patients') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">👤</span>
                  Patients
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/doctors" className={`nav-link ${isActive('/admin/doctors') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">⚕️</span>
                  Doctors
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/pending-doctors" className={`nav-link ${isActive('/admin/pending-doctors') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">⏳</span>
                  Pending Doctors
                </Link>
              </li>
            </ul>
          </div>

          {/* Appointments */}
          <div className="nav-section">
            <div className="nav-section-title">APPOINTMENTS</div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/admin/appointments" className={`nav-link ${isActive('/admin/appointments') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">📅</span>
                  Appointments
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/schedule" className={`nav-link ${isActive('/admin/schedule') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">🗓️</span>
                  Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Records */}
          <div className="nav-section">
            <div className="nav-section-title">MEDICAL RECORDS</div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/admin/medical-records" className={`nav-link ${isActive('/admin/medical-records') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">📋</span>
                  Medical Records
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/lab-results" className={`nav-link ${isActive('/admin/lab-results') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">🧪</span>
                  Lab Results
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/prescriptions" className={`nav-link ${isActive('/admin/prescriptions') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">💊</span>
                  Prescriptions
                </Link>
              </li>
            </ul>
          </div>

          {/* Financial */}
          <div className="nav-section">
            <div className="nav-section-title">FINANCIAL</div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/admin/billing" className={`nav-link ${isActive('/admin/billing') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">💰</span>
                  Billing
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/payments" className={`nav-link ${isActive('/admin/payments') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">💳</span>
                  Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* Reports & System */}
          <div className="nav-section">
            <div className="nav-section-title">REPORTS & SYSTEM</div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/admin/reports" className={`nav-link ${isActive('/admin/reports') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">📊</span>
                  Reports
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/messages" className={`nav-link ${isActive('/admin/messages') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">💬</span>
                  Messages
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/notifications" className={`nav-link ${isActive('/admin/notifications') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">🔔</span>
                  Notifications
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/settings" className={`nav-link ${isActive('/admin/settings') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">⚙️</span>
                  Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/my-profile" className={`nav-link ${isActive('/admin/my-profile') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="nav-icon">👤</span>
                  My Profile
                </Link>
              </li>
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

export default AdminSidebar;