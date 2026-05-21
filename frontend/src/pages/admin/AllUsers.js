import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AllUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'patient', status: 'approved' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const handleAction = async (id, action, data = null) => {
    if (action === 'delete' && !window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const method = action === 'delete' ? 'DELETE' : (action === 'create' ? 'POST' : 'PUT');
      const url = action === 'create' 
        ? `http://localhost:5000/api/admin/users` 
        : `http://localhost:5000/api/admin/users/${id}`;
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : null
      });

      if (response.ok) {
        fetchUsers();
        if (showModal) setShowModal(false);
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Apply ${action} to ${selectedUsers.length} selected users?`)) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/bulk`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds: selectedUsers, action })
      });

      if (response.ok) {
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const exportToCSV = () => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5000/api/admin/export/users?token=${token}`, '_blank');
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const getRoleBadge = (role) => {
    const badges = {
      patient: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', icon: '👤' },
      doctor: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: '⚕️' },
      admin: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: '🛡️' },
      superadmin: { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', icon: '👑' }
    };
    const b = badges[role] || badges.patient;
    return (
      <span style={{ padding: '0.3rem 0.8rem', borderRadius: '12px', background: b.bg, color: b.color, fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        {b.icon} {role.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const isApproved = status === 'approved';
    return (
      <span style={{ padding: '0.3rem 0.8rem', borderRadius: '12px', background: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isApproved ? '#10b981' : '#ef4444', fontSize: '0.75rem', fontWeight: '700' }}>
        {isApproved ? 'ACTIVE' : 'SUSPENDED'}
      </span>
    );
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>User Intelligence Database</h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>Advanced administrative control over specialized user segments</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={exportToCSV} className="action-btn" style={{ background: '#f8fafc', color: '#475569', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                📥 Export CSV
              </button>
              <button onClick={() => { setCurrentUser(null); setFormData({name:'', email:'', role:'patient', status:'approved'}); setShowModal(true); }} className="action-btn" style={{ background: '#6366f1' }}>
                + Register User
              </button>
            </div>
          </div>

          {/* Advanced Controls Bar */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
              
              {/* Intelligent Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                <input 
                  type="text" 
                  placeholder="Scan users by name, email, or digital ID..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '0.95rem', background: '#f8fafc' }} 
                />
                <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
              </div>

              {/* Multi-Factor Filter */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select 
                  value={filterRole} 
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={{ padding: '0.9rem 1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.875rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                >
                  <option value="all">ANY ROLE</option>
                  <option value="patient">PATIENTS</option>
                  <option value="doctor">DOCTORS</option>
                  <option value="admin">ADMINS</option>
                </select>

                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '0.9rem 1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.875rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                >
                  <option value="all">ANY STATUS</option>
                  <option value="approved">ACTIVE ONLY</option>
                  <option value="suspended">SUSPENDED ONLY</option>
                </select>
              </div>

              {/* Bulk Actions Menu */}
              {selectedUsers.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', animation: 'fadeIn 0.2s' }}>
                   <button onClick={() => handleBulkAction('activate')} style={{ padding: '0.9rem 1.25rem', borderRadius: '16px', border: 'none', background: '#ecfdf5', color: '#059669', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}>
                     Activate ({selectedUsers.length})
                   </button>
                   <button onClick={() => handleBulkAction('suspend')} style={{ padding: '0.9rem 1.25rem', borderRadius: '16px', border: 'none', background: '#fef2f2', color: '#ef4444', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}>
                     Suspend ({selectedUsers.length})
                   </button>
                </div>
              )}
            </div>
          </div>

          {/* User Database Table */}
          <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b' }}>
                  SHOWING {filteredUsers.length} DATA POINTS
               </div>
               <button onClick={fetchUsers} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                 FORCE RE-SYNC 🔄
               </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '1.25rem', textAlign: 'center' }}>
                      <input type="checkbox" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onChange={toggleSelectAll} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    </th>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>User Identity</th>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Classification</th>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Operational Status</th>
                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>System Entry</th>
                    <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Protocols</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>INITIATING DATABASE SCAN...</td></tr>
                  ) : filteredUsers.map((user) => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s ease' }} className="table-row-hover">
                      <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedUsers.includes(user._id)} onChange={() => toggleSelectUser(user._id)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{user.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem' }}>{getRoleBadge(user.role)}</td>
                      <td style={{ padding: '1.25rem' }}>{getStatusBadge(user.status)}</td>
                      <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEditModal(user)} className="command-btn" style={{ position: 'relative', transform: 'none', left: 'auto', bottom: 'auto', width: '38px', height: '38px', fontSize: '0.9rem' }}>✏️</button>
                          <button onClick={() => handleAction(user._id, 'delete')} className="command-btn" style={{ position: 'relative', transform: 'none', left: 'auto', bottom: 'auto', width: '38px', height: '38px', fontSize: '0.9rem', color: '#ef4444' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {!loading && filteredUsers.length === 0 && (
              <div style={{ padding: '5rem', textAlign: 'center' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                 <h3 style={{ color: '#1e293b' }}>No Intelligence Found</h3>
                 <p style={{ color: '#64748b' }}>Zero matches detected for the current parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', width: '480px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Identity Override</h2>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>Modify system classification and access status</p>
               </div>
               <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '0.6rem' }}>Display Identity</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '0.6rem' }}>System Classification</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '700', cursor: 'pointer' }}>
                <option value="patient">PATIENT RECORD</option>
                <option value="doctor">VERIFIED DOCTOR</option>
                <option value="admin">ADMINISTRATOR</option>
              </select>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '0.6rem' }}>Operational Protocol</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setFormData({...formData, status: 'approved'})} style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: '2px solid', borderColor: formData.status === 'approved' ? '#6366f1' : '#f1f5f9', background: formData.status === 'approved' ? '#eef2ff' : 'white', color: formData.status === 'approved' ? '#6366f1' : '#64748b', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>
                  ACTIVE
                </button>
                <button onClick={() => setFormData({...formData, status: 'suspended'})} style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: '2px solid', borderColor: formData.status === 'suspended' ? '#ef4444' : '#f1f5f9', background: formData.status === 'suspended' ? '#fef2f2' : 'white', color: formData.status === 'suspended' ? '#ef4444' : '#64748b', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>
                  SUSPENDED
                </button>
              </div>
            </div>

            <button 
              onClick={() => handleAction(currentUser?._id, currentUser ? 'update' : 'create', formData)} 
              disabled={actionLoading} 
              style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' }}
            >
              {actionLoading ? 'PROCESSING...' : (currentUser ? 'COMMIT CHANGES' : 'CREATE USER')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;