import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorTopNav = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    setUser(userInfo);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'D';
  };

  const getProfileImage = () => {
    return null;
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

        <div className="user-menu" onClick={() => setShowDropdown(!showDropdown)}>
          {getProfileImage() ? (
            <img src={getProfileImage()} alt="Profile" className="user-avatar-img" />
          ) : (
            <div className="user-avatar">
              {getInitial(user?.name)}
            </div>
          )}
          <div className="user-info">
            <div className="user-name">{user?.name || 'Doctor'}</div>
            <div className="user-role">{user?.role || 'doctor'}</div>
          </div>
          <span className="dropdown-arrow">▼</span>

          {showDropdown && (
            <div className="user-dropdown">
              <a href="/doctor/my-profile" className="dropdown-item">
                👤 My Profile
              </a>
              <a href="/doctor/settings" className="dropdown-item">
                ⚙️ Settings
              </a>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorTopNav;