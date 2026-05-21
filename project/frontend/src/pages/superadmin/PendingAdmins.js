import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';

const PendingAdmins = () => {

   const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/superadmin/admins/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingAdmins(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (adminId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/superadmin/admins/${adminId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Admin approved successfully!\n\nApproved by: ${data.approvedBy.name} (${data.approvedBy.role})\nEmail: ${data.approvedBy.email}`);
        fetchPendingAdmins();
      } else {
        alert('❌ Error approving admin');
      }
    } catch (error) {
      alert('Error approving admin');
    }
  };

  const handleReject = async (adminId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/superadmin/admins/${adminId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('❌ Admin rejected');
        fetchPendingAdmins();
      } else {
        alert('Error rejecting admin');
      }
    } catch (error) {
      alert('Error rejecting admin');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <SuperAdminSidebar  isOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
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
        <SuperAdminTopNav toggleSidebar={toggleSidebar}/>
        
        <div className="dashboard-content">
          <h1 className="page-title">Pending Admin Approvals</h1>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              padding: '1rem',
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#991b1b'
            }}>
              <strong>🔒 SUPERADMIN ONLY:</strong> These admin requests require your approval to access the system.
            </div>
          </div>

          <div className="section-card">
            {pendingAdmins.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Admin</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Email</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Phone</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Requested On</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAdmins.map((admin) => (
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
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{formatDate(admin.createdAt)}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => handleApprove(admin._id)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                              }}
                            >
                              ✅ Approve
                            </button>
                            <button 
                              onClick={() => handleReject(admin._id)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                              }}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '1.5rem', color: '#2c3544', marginBottom: '0.5rem' }}>
                  All Clear!
                </h3>
                <p style={{ color: '#6c757d' }}>
                  No pending admin approvals at this time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingAdmins;