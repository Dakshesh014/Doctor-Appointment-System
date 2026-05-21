import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchTerm))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
        setFilteredPatients(data);
      } else {
        console.error('Failed to fetch patients');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setLoading(false);
    }
  };

  const handleViewPatient = (patientId) => {
    // Navigate to patient details page
    window.location.href = `/doctor/patients/${patientId}`;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DoctorSidebar />
        <div className="main-content">
          <DoctorTopNav />
          <div className="dashboard-content">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '80vh',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '3rem' }}>⏳</div>
              <h1 className="page-title">Loading Patients...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DoctorSidebar />
      
      <div className="main-content">
        <DoctorTopNav />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="page-title">👥 My Patients</h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                padding: '0.75rem 1.5rem',
                background: '#e0e7ff',
                color: '#4c51bf',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '1rem'
              }}>
                Total: {patients.length} Patient{patients.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={fetchPatients}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#4a9eff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {patients.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <input
                type="text"
                placeholder="🔍 Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4a9eff'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              {searchTerm && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6c757d' }}>
                  Found {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          <div className="section-card">
            {filteredPatients.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    style={{
                      padding: '2rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      background: 'white',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4a9eff';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 158, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onClick={() => handleViewPatient(patient._id)}
                  >
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '2rem',
                      margin: '0 auto 1rem'
                    }}>
                      {patient.name?.charAt(0) || 'P'}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#2c3544' }}>
                      {patient.name}
                    </h3>
                    
                    <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                      📧 {patient.email}
                    </div>

                    {patient.phone && (
                      <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '1rem' }}>
                        📱 {patient.phone}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      {patient.bloodType && (
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          background: '#fee2e2',
                          color: '#991b1b',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          🩸 {patient.bloodType}
                        </span>
                      )}
                      {patient.gender && (
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          background: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {patient.gender === 'Male' ? '👨' : patient.gender === 'Female' ? '👩' : '👤'} {patient.gender}
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPatient(patient._id);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#4a9eff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#3b8eef'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#4a9eff'}
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            ) : patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#2c3544' }}>No Patients Yet</h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                  You haven't seen any patients yet. Patients will appear here once they book appointments with you.
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#2c3544' }}>No Patients Found</h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '2rem' }}>
                  No patients match your search "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    padding: '0.75rem 2rem',
                    background: '#4a9eff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Statistics Section */}
          {patients.length > 0 && (
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {patients.length}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Patients</div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {patients.filter(p => p.gender === 'Male').length}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Male Patients</div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {patients.filter(p => p.gender === 'Female').length}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Female Patients</div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {patients.filter(p => p.bloodType).length}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>With Blood Type</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPatients;