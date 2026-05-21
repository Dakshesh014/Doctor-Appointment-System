import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Features State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/patients', {
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

  // Calculate age from DOB
  const getAge = (dobString) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  // Search Logic
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchStr = searchTerm.toLowerCase();
      return (
        patient.name?.toLowerCase().includes(searchStr) ||
        patient.email?.toLowerCase().includes(searchStr) ||
        patient.phone?.toLowerCase().includes(searchStr) ||
        patient.bloodType?.toLowerCase().includes(searchStr)
      );
    });
  }, [patients, searchTerm]);

  // Sorting Logic
  const sortedPatients = useMemo(() => {
    let sortableItems = [...filteredPatients];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        // Handle age sorting based on DOB
        if (sortConfig.key === 'age') {
          aVal = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : 0;
          bVal = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : 0;
          // Inverse logic for DOB: older person has smaller timestamp
          return sortConfig.direction === 'asc' ? bVal - aVal : aVal - bVal; 
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPatients, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedPatients.slice(start, start + itemsPerPage);
  }, [sortedPatients, currentPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToCSV = () => {
    if (sortedPatients.length === 0) return;
    
    const headers = ['Name', 'Email', 'Phone', 'Gender', 'Blood Type', 'Age', 'Allergies'];
    const csvRows = [headers.join(',')];

    sortedPatients.forEach(p => {
      const row = [
        `"${p.name || ''}"`,
        `"${p.email || ''}"`,
        `"${p.phone || ''}"`,
        `"${p.gender || ''}"`,
        `"${p.bloodType || ''}"`,
        `"${getAge(p.dateOfBirth)}"`,
        `"${p.allergies || 'None'}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `patient_history_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DoctorSidebar />
        <div className="main-content">
          <DoctorTopNav />
          <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h2 style={{ color: '#2c3544' }}>Loading Patient Database...</h2>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>📋</span> Patient History Lookup
              </h1>
              <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>Comprehensive clinical overview of all your registered patients</p>
            </div>
            
            <button 
              onClick={exportToCSV}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              📥 Export CSV
            </button>
          </div>

          <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, email, phone, blood type..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4a9eff'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
              
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                Showing {sortedPatients.length} record(s)
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                    <th 
                      onClick={() => handleSort('name')} 
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Patient {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600' }}>Contact Info</th>
                    <th 
                      onClick={() => handleSort('bloodType')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Type {sortConfig.key === 'bloodType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('age')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Age/Gender {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.length > 0 ? (
                    paginatedPatients.map((patient, index) => (
                      <tr 
                        key={patient._id} 
                        style={{ 
                          borderBottom: '1px solid #e2e8f0', 
                          transition: 'background 0.2s',
                          background: index % 2 === 0 ? 'white' : '#fafafa'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa'}
                      >
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '50%',
                              background: patient.profileImage ? `url(http://localhost:5000${patient.profileImage}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '700',
                              fontSize: '1.2rem'
                            }}>
                              {!patient.profileImage && (patient.name?.charAt(0) || 'P')}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>{patient.name}</div>
                              {patient.allergies && (
                                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.2rem', fontWeight: '500' }}>
                                  ⚠️ Has Allergies
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.2rem' }}>{patient.email}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{patient.phone || 'No phone'}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {patient.bloodType ? (
                            <span style={{ padding: '0.25rem 0.6rem', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' }}>
                              {patient.bloodType}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>N/A</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ color: '#334155', fontWeight: '500' }}>
                            {getAge(patient.dateOfBirth)} yrs
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.1rem' }}>
                            {patient.gender || 'Not specified'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => navigate(`/doctor/patients/${patient._id}`)}
                            style={{
                              padding: '0.5rem 1.2rem',
                              background: '#f8fafc',
                              color: '#4f46e5',
                              border: '1px solid #c7d2fe',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              transition: 'all 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#4f46e5';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#4f46e5';
                            }}
                          >
                            Timeline <span>→</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Patients Found</h3>
                        <p style={{ margin: 0 }}>Try adjusting your search filters or add a new patient.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedPatients.length)} of {sortedPatients.length} entries
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.5rem 1rem',
                      background: currentPage === 1 ? '#e2e8f0' : 'white',
                      color: currentPage === 1 ? '#94a3b8' : '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.5rem 1rem',
                      background: currentPage === totalPages ? '#e2e8f0' : 'white',
                      color: currentPage === totalPages ? '#94a3b8' : '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;