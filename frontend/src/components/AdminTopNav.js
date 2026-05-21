import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminTopNav = ({ toggleSidebar }) => {
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
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const getProfileImage = () => {
    return null;
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const res = await fetch('http://localhost:5000/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        const unread = data.filter(n => !n.isRead.includes(userInfo._id)).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearching(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/search?query=${val}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="top-nav">
      <div className="top-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        
        <div className="global-search-container" style={{ position: 'relative', width: '400px' }}>
          <input 
            type="text" 
            placeholder="Search everything..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: '#f8fafc' }} 
          />
          <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          
          {searchQuery.length >= 2 && (
            <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden' }}>
              {searching ? (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#a0aec0' }}>Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((r, i) => (
                  <div key={i} onClick={() => { navigate(r.link); setSearchQuery(''); }} style={{ padding: '0.8rem 1.25rem', borderBottom: i === searchResults.length - 1 ? 'none' : '1px solid #f1f5f9', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '700', color: '#1a202c', fontSize: '0.9rem' }}>{r.title}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#6366f1', background: '#eef2ff', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{r.type.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{r.subtitle}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#a0aec0' }}>No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="top-nav-right">
        <div className="notification-icon-container" style={{ position: 'relative' }}>
          <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)} style={{ cursor: 'pointer' }}>
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>

          {showNotifications && (
            <div className="notifications-dropdown" style={{ position: 'absolute', top: '140%', right: 0, width: '320px', background: 'white', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 1001, overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '800', color: '#1a202c' }}>Notifications</span>
                <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div key={i} onClick={() => markAsRead(n._id)} style={{ padding: '1rem', borderBottom: '1px solid #f8fafc', background: n.isRead.includes(user?._id) ? 'transparent' : '#f0f4ff', cursor: 'pointer', transition: '0.2s' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#2d3748', marginBottom: '0.25rem' }}>{n.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#718096', lineHeight: '1.4' }}>{n.message}</div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', marginTop: '0.5rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0', fontSize: '0.85rem' }}>No notifications yet</div>
                )}
              </div>
              <div style={{ padding: '0.8rem', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                <a href="/admin/notifications" style={{ fontSize: '0.75rem', fontWeight: '800', color: '#667eea', textDecoration: 'none' }}>View All Hub</a>
              </div>
            </div>
          )}
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
            <div className="user-name">{user?.name || 'Admin'}</div>
            <div className="user-role">{user?.role || 'admin'}</div>
          </div>
          <span className="dropdown-arrow">▼</span>

          {showDropdown && (
            <div className="user-dropdown">
              <a href="/admin/my-profile" className="dropdown-item">
                👤 My Profile
              </a>
              <a href="/admin/settings" className="dropdown-item">
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

export default AdminTopNav;
