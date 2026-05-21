import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';

const ManageAdmins = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/superadmin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/superadmin/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Admin deleted successfully');
        fetchAdmins();
      } else {
        alert('❌ Error deleting admin');
      }
    } catch (error) {
      alert('Error deleting admin');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredAdmins = admins.filter(admin => {
    if (filter === 'active') return admin.status === 'approved';
    if (filter === 'pending') return admin.status === 'pending';
    if (filter === 'rejected') return admin.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="dashboard-layout">
        <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
        <div className="main-content">
          <SuperAdminTopNav toggleSidebar={toggleSidebar}/>
          <div className="dashboard-content">
            <h1 className="page-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
      
      <div className="main-content">
        <SuperAdminTopNav  toggleSidebar={toggleSidebar} />
        
        <div className="dashboard-content">
          <h1 className="page-title">Manage Admins</h1>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === 'all' ? '#667eea' : '#e5e7eb',
                color: filter === 'all' ? 'white' : '#2c3544',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              All Admins ({admins.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === 'active' ? '#10b981' : '#e5e7eb',
                color: filter === 'active' ? 'white' : '#2c3544',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('pending')}
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === 'pending' ? '#fb923c' : '#e5e7eb',
                color: filter === 'pending' ? 'white' : '#2c3544',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setFilter('rejected')}
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === 'rejected' ? '#ef4444' : '#e5e7eb',
                color: filter === 'rejected' ? 'white' : '#2c3544',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Rejected
            </button>
          </div>

          <div className="section-card">
            {filteredAdmins.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Admin</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Email</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Phone</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Status</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Approved By</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Joined</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin) => (
                      <tr key={admin._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '700'
                            }}>
                              {admin.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>{admin.name}</div>
                              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>ID: {admin._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{admin.email}</td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{admin.phone || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: 
                              admin.status === 'approved' ? '#d1fae5' :
                              admin.status === 'pending' ? '#fef3c7' :
                              '#fee2e2',
                            color:
                              admin.status === 'approved' ? '#065f46' :
                              admin.status === 'pending' ? '#92400e' :
                              '#991b1b'
                          }}>
                            {admin.status || 'approved'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {admin.approvedBy ? (
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                {admin.approvedBy.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                {admin.approvedBy.email}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                ({admin.approvedBy.role})
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{formatDate(admin.createdAt)}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{
                              padding: '0.5rem 0.75rem',
                              background: '#4a9eff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}>
                              View
                            </button>
                            <button 
                              onClick={() => handleDeleteAdmin(admin._id)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6c757d', padding: '3rem' }}>
                No admins found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;