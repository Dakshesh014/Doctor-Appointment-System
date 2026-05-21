import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdminTopNav = ({ toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    setUser(userInfo);
  }, []);

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

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'S';
  };

  return (
    <div className="top-nav">
      <div className="top-nav-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      </div>
      
      <div className="top-nav-right">
        <div className="notification-icon">
          🔔
          <span className="notification-badge">3</span>
        </div>

        <div 
          className="user-menu" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="user-avatar">
            {getInitial(user?.name)}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'SuperAdmin'}</div>
            <div className="user-role">{user?.role || 'superadmin'}</div>
          </div>
          <span className="dropdown-arrow">▼</span>

          {showDropdown && (
            <div className="user-dropdown">
              <button 
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/superadmin/my-profile');
                  setShowDropdown(false);
                }}
              >
                👤 My Profile
              </button>
              <button 
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/superadmin/settings');
                  setShowDropdown(false);
                }}
              >
                ⚙️ Settings
              </button>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminTopNav;