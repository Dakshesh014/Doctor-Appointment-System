import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SuperAdminSidebar = ({ isOpen, toggleSidebar }) => {
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
          <div className="sidebar-logo">🏥</div>
          <div className="sidebar-title">Doctor Management System</div>
          <button className="sidebar-close" onClick={toggleSidebar}>✕</button>
        </div>

        <div className="sidebar-nav">
          {/* Main Navigation */}
          <div className="nav-section">
            <div className="nav-section-title">MAIN NAVIGATION</div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link 
                  to="/superadmin/dashboard" 
                  className={`nav-link ${isActive('/superadmin/dashboard') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">📊</span>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Management */}
          <div className="nav-section">
            <div className="nav-section-title">MANAGEMENT</div>
            <ul className="nav-menu">

              <li className="nav-item">
                <Link 
                  to="/superadmin/manage-admins" 
                  className={`nav-link ${isActive('/superadmin/manage-admins') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">🛡️</span>
                  Manage Admins
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/superadmin/pending-admins" 
                  className={`nav-link ${isActive('/superadmin/pending-admins') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">⏳</span>
                  Pending Admins
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/superadmin/manage-doctors" 
                  className={`nav-link ${isActive('/superadmin/manage-doctors') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">⚕️</span>
                  Manage Doctors
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/superadmin/manage-patients" 
                  className={`nav-link ${isActive('/superadmin/manage-patients') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">👥</span>
                  Manage Patients
                </Link>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div className="nav-section">
            <div className="nav-section-title">SECURITY</div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link 
                  to="/superadmin/security" 
                  className={`nav-link ${isActive('/superadmin/security') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">🔒</span>
                  Security
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/superadmin/audit-logs" 
                  className={`nav-link ${isActive('/superadmin/audit-logs') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">📋</span>
                  Audit Logs
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/superadmin/activity-history" 
                  className={`nav-link ${isActive('/superadmin/activity-history') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">📜</span>
                  Activity History
                </Link>
              </li>
            </ul>
          </div>

          {/* System */}
          <div className="nav-section">
            <div className="nav-section-title">SYSTEM</div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link 
                  to="/superadmin/messages" 
                  className={`nav-link ${isActive('/superadmin/messages') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">💬</span>
                  Messages
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

export default SuperAdminSidebar;