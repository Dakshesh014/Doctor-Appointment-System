import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';

const ManageDoctors = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDoctors();
    fetchPendingDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/superadmin/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const fetchPendingDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/superadmin/doctors/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/superadmin/doctors/${doctorId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Doctor approved successfully!\n\nApproved by: ${data.approvedBy.name} (${data.approvedBy.role})\nEmail: ${data.approvedBy.email}`);
        fetchDoctors();
        fetchPendingDoctors();
      }
    } catch (error) {
      alert('Error approving doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/superadmin/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Doctor deleted successfully');
        fetchDoctors();
      }
    } catch (error) {
      alert('Error deleting doctor');
    }
  };

 

  const filteredDoctors = doctors.filter(doctor => {
    if (filter === 'active') return doctor.status === 'approved';
    if (filter === 'pending') return doctor.status === 'pending';
    if (filter === 'rejected') return doctor.status === 'rejected';
    return true;
  });

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
      <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="main-content">
        <SuperAdminTopNav toggleSidebar={toggleSidebar}/>
        
        <div className="dashboard-content">
          <h1 className="page-title">Manage Doctors</h1>

          {/* Pending Doctors Alert */}
          {pendingDoctors.length > 0 && (
            <div style={{
              marginBottom: '2rem',
              padding: '1rem',
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>⚠️ {pendingDoctors.length} Doctor(s) Pending Approval</strong>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#856404' }}>
                  Review and approve pending doctor registrations
                </p>
              </div>
              <button
                onClick={() => setFilter('pending')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#fb923c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Review Now
              </button>
            </div>
          )}

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === 'all' ? '#00c9b7' : '#e5e7eb',
                color: filter === 'all' ? 'white' : '#2c3544',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              All Doctors ({doctors.length})
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
              Pending ({pendingDoctors.length})
            </button>
          </div>

          <div className="section-card">
            {filteredDoctors.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Doctor</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Email</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Specialization</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>License</th>
                      {/* ✅ ONLINE STATUS COLUMN */}
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Online Status</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Status</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Approved By</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Joined Date</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor) => (
                      <tr key={doctor._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '700'
                            }}>
                              {doctor.name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>Dr. {doctor.name}</div>
                              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{doctor.qualification || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{doctor.email}</td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{doctor.specialization || 'General'}</td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{doctor.licenseNumber || 'N/A'}</td>
                        {/* ✅ ONLINE STATUS INDICATOR */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: doctor.isOnline ? '#10b981' : '#ef4444',
                              boxShadow: doctor.isOnline ? '0 0 0 3px rgba(16, 185, 129, 0.3)' : 'none'
                            }}></div>
                            <span style={{ 
                              fontSize: '0.85rem', 
                              color: doctor.isOnline ? '#10b981' : '#6c757d',
                              fontWeight: '600'
                            }}>
                              {doctor.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: 
                              doctor.status === 'approved' ? '#d1fae5' :
                              doctor.status === 'pending' ? '#fef3c7' :
                              '#fee2e2',
                            color:
                              doctor.status === 'approved' ? '#065f46' :
                              doctor.status === 'pending' ? '#92400e' :
                              '#991b1b'
                          }}>
                            {doctor.status || 'approved'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {doctor.approvedBy ? (
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                {doctor.approvedBy.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                ({doctor.approvedBy.role})
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>-</span>
                          )}
                        </td>
                        
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {doctor.status === 'pending' && (
                              <button 
                                onClick={() => handleApproveDoctor(doctor._id)}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                ✅ Approve
                              </button>
                            )}
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
                              onClick={() => handleDeleteDoctor(doctor._id)}
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
                No doctors found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageDoctors;