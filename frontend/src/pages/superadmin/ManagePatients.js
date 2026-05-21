import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';

const ManagePatients = () => {

   const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/superadmin/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/superadmin/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Patient deleted successfully');
        fetchPatients();
      }
    } catch (error) {
      alert('Error deleting patient');
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
      <SuperAdminSidebar  isOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
      
      <div className="main-content">
        <SuperAdminTopNav toggleSidebar={toggleSidebar}/>
        
        <div className="dashboard-content">
          <h1 className="page-title">Manage Patients</h1>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#2c3544' }}>
              Total Patients: {patients.length}
            </h3>
          </div>

          <div className="section-card">
            {patients.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Patient</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Email</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Phone</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Blood Type</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Joined</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#2c3544' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '700'
                            }}>
                              {patient.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>{patient.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{patient.email}</td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{patient.phone || 'N/A'}</td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{patient.bloodType || 'N/A'}</td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{formatDate(patient.createdAt)}</td>
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
                              onClick={() => handleDeletePatient(patient._id)}
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
                No patients found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePatients;