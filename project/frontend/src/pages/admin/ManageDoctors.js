import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';
import './ManageDoctors.css'; // We'll create this CSS next

const ManageDoctors = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editData, setEditData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      // Admin route to get all doctors
      const response = await fetch('http://localhost:5000/api/admin/users/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch doctors');

      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setEditData({
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization || '',
      licenseNumber: doctor.licenseNumber || '',
      status: doctor.status
    });
    setActiveModal('edit');
  };

  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setActiveModal('delete');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedDoctor._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) throw new Error('Failed to update doctor');
      
      await fetchDoctors();
      setActiveModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedDoctor._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete doctor');
      
      await fetchDoctors();
      setActiveModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Logic
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.specialization && doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-layout">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <AdminTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content manage-doctors-container">
          <div className="premium-header">
            <h1 className="premium-title">⚕️ Manage Doctors</h1>
          </div>

          <div className="actions-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search by name, email, or specialization..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="premium-table-card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <h2>Loading doctors...</h2>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
                <h2>Error loading data</h2>
                <p>{error}</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <h2>No doctors found</h2>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Doctor Profile</th>
                    <th>Specialization</th>
                    <th>License Number</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map(doctor => (
                    <tr key={doctor._id}>
                      <td>
                        <div className="user-info-cell">
                          <div className="user-avatar">{doctor.name.charAt(0)}</div>
                          <div>
                            <div className="user-name">Dr. {doctor.name}</div>
                            <div className="user-email">{doctor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#475569' }}>{doctor.specialization || 'Not Specified'}</strong>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{doctor.licenseNumber || 'N/A'}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${doctor.status}`}>
                          {doctor.status === 'approved' ? '✓' : doctor.status === 'pending' ? '⏳' : '✕'} 
                          {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openEditModal(doctor)} className="action-btn btn-edit">✏️ Edit</button>
                        <button onClick={() => openDeleteModal(doctor)} className="action-btn btn-delete">🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal === 'edit' && (
        <div className="premium-modal-backdrop">
          <div className="premium-modal-container">
            <h2 className="premium-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Edit Doctor Profile</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="premium-form-group">
                <label className="premium-label">Full Name</label>
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="premium-input" 
                  required 
                />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Specialization</label>
                <input 
                  type="text" 
                  value={editData.specialization} 
                  onChange={(e) => setEditData({...editData, specialization: e.target.value})}
                  className="premium-input" 
                />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">License Number</label>
                <input 
                  type="text" 
                  value={editData.licenseNumber} 
                  onChange={(e) => setEditData({...editData, licenseNumber: e.target.value})}
                  className="premium-input" 
                />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Account Status</label>
                <select 
                  value={editData.status} 
                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                  className="premium-select"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="premium-modal-footer">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-cancel">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-save">
                  {submitting ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'delete' && (
        <div className="premium-modal-backdrop">
          <div className="premium-modal-container">
            <h2 className="premium-title" style={{ fontSize: '1.5rem', color: '#ef4444', marginBottom: '1rem' }}>⚠️ Confirm Deletion</h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>Dr. {selectedDoctor?.name}</strong>? This action cannot be undone and will remove all associated access.
            </p>
            <div className="premium-modal-footer">
              <button onClick={() => setActiveModal(null)} className="btn-cancel">Cancel</button>
              <button onClick={handleDelete} disabled={submitting} className="btn-confirm-delete">
                {submitting ? 'Deleting...' : '🗑️ Yes, Delete Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
