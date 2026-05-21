import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Coming Soon 🚧</h1>
          <p className="dashboard-subtitle">This dashboard is under development.</p>
          <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
            Welcome, {user?.name}! (Admin)
          </p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;