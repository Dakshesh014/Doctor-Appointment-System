import React, { useState, useEffect, useMemo } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: '',
    validUntil: ''
  });

  // Advanced Datatable State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // slightly fewer due to taller rows
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.download-dropdown-container')) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/prescriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMedicationChange = (index, e) => {
    const newMedications = [...formData.medications];
    newMedications[index][e.target.name] = e.target.value;
    setFormData({ ...formData, medications: newMedications });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const removeMedication = (index) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMedications });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
            patient: '',
            diagnosis: '',
            medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
            notes: '',
            validUntil: ''
        });
        fetchPrescriptions();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding prescription:', error);
    }
  };

  const formatDate = (dateString, showTime = false) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    if (showTime) {
       options.hour = '2-digit';
       options.minute = '2-digit';
    }
    return date.toLocaleDateString('en-US', options);
  };

  // Search Logic
  const filteredRecords = useMemo(() => {
    return prescriptions.filter((record) => {
      const searchStr = searchTerm.toLowerCase();
      const patientName = record.patient?.name || '';
      const patientEmail = record.patient?.email || '';
      const diagnosis = record.diagnosis || '';
      const meds = (record.medications || []).map(m => m.name).join(' ');
      
      let statusStr = '';
      if (record.validUntil) {
         statusStr = new Date(record.validUntil) >= new Date() ? 'active' : 'expired';
      }

      return (
        patientName.toLowerCase().includes(searchStr) ||
        patientEmail.toLowerCase().includes(searchStr) ||
        diagnosis.toLowerCase().includes(searchStr) ||
        meds.toLowerCase().includes(searchStr) ||
        statusStr.includes(searchStr)
      );
    });
  }, [prescriptions, searchTerm]);

  // Sorting Logic
  const sortedRecords = useMemo(() => {
    let sortableItems = [...filteredRecords];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal, bVal;

        switch(sortConfig.key) {
          case 'createdAt':
          case 'date':
            aVal = new Date(a.createdAt).getTime();
            bVal = new Date(b.createdAt).getTime();
            break;
          case 'patient':
            aVal = (a.patient?.name || '').toLowerCase();
            bVal = (b.patient?.name || '').toLowerCase();
            break;
          case 'diagnosis':
            aVal = (a.diagnosis || '').toLowerCase();
            bVal = (b.diagnosis || '').toLowerCase();
            break;
          case 'status':
            aVal = new Date(a.validUntil || 0).getTime();
            bVal = new Date(b.validUntil || 0).getTime();
            break;
          default:
            aVal = a[sortConfig.key];
            bVal = b[sortConfig.key];
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRecords, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(start, start + itemsPerPage);
  }, [sortedRecords, currentPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToCSV = () => {
    if (sortedRecords.length === 0) return;
    
    const headers = ['Prescribed Date', 'Patient Name', 'Diagnosis', 'Medications Count', 'Status (Valid Until)', 'Notes'];
    const csvRows = [headers.join(',')];

    sortedRecords.forEach(record => {
      const statusStr = new Date(record.validUntil) >= new Date() ? 'Active' : 'Expired';
      const validUntilStr = record.validUntil ? formatDate(record.validUntil).replace(/,/g, '') : 'N/A';
      
      const row = [
        formatDate(record.createdAt, true).replace(/,/g, ''),
        `"${record.patient?.name || 'Unknown'}"`,
        `"${(record.diagnosis || '').replace(/"/g, '""')}"`,
        `"${record.medications?.length || 0}"`,
        `"${statusStr} (${validUntilStr})"`,
        `"${(record.notes || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Prescriptions_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowDownloadMenu(false);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DoctorSidebar />
        <div className="main-content">
          <DoctorTopNav />
          <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</div>
              <h2 style={{ color: '#2c3544' }}>Loading Prescriptions...</h2>
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
                <span style={{ fontSize: '2rem' }}>💊</span> Digital Prescriptions
              </h1>
              <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>Write, manage, and track medication plans for your patients</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="download-dropdown-container" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: '#8b5cf6',
                    border: '1px solid #8b5cf6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f3ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  📥 Export Logs <span style={{ fontSize: '0.7rem' }}>{showDownloadMenu ? '▲' : '▼'}</span>
                </button>
                {showDownloadMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    minWidth: '200px',
                    zIndex: 50,
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={exportToCSV}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#334155',
                        fontWeight: '500',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >
                      📄 Export as CSV
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                + New Rx
              </button>
            </div>
          </div>

          <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by patient, medication, diagnosis..."
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
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
              
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                Showing {sortedRecords.length} record(s)
              </div>
            </div>

            {/* Content List as Datatable */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                    <th 
                      onClick={() => handleSort('date')} 
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Prescribed On {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('patient')} 
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Patient {sortConfig.key === 'patient' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('diagnosis')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Diagnosis & Meds {sortConfig.key === 'diagnosis' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Validity {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length > 0 ? (
                    paginatedRecords.map((prescription, index) => {
                      
                      const validUntilDate = new Date(prescription.validUntil);
                      const isExpired = validUntilDate < new Date();
                      
                      return (
                      <tr 
                        key={prescription._id} 
                        style={{ 
                          borderBottom: '1px solid #e2e8f0', 
                          transition: 'background 0.2s',
                          background: index % 2 === 0 ? 'white' : '#fafafa'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa'}
                      >
                        <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{formatDate(prescription.createdAt)}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                             {new Date(prescription.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: '#f3e8ff',
                              color: '#7e22ce',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '1rem',
                              border: '1px solid #e9d5ff'
                            }}>
                              {prescription.patient?.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>{prescription.patient?.name || 'Unknown Patient'}</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{prescription.patient?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
                            {prescription.diagnosis || 'Undiagnosed'}
                          </div>
                          
                          {prescription.medications && prescription.medications.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {prescription.medications.slice(0, 2).map((med, i) => (
                                <div key={i} style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ display: 'inline-block', width: '4px', height: '4px', background: '#94a3b8', borderRadius: '50%' }}></span>
                                  <strong>{med.name}</strong> - {med.dosage}
                                </div>
                              ))}
                              {prescription.medications.length > 2 && (
                                <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: '500', marginLeft: '0.75rem' }}>
                                  + {prescription.medications.length - 2} more...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No medications listed</div>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                           <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            background: isExpired ? '#fee2e2' : '#dcfce7',
                            color: isExpired ? '#991b1b' : '#166534',
                            fontWeight: '600',
                            border: `1px solid ${isExpired ? '#fca5a5' : '#bbf7d0'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                            Until {formatDate(prescription.validUntil)}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right', verticalAlign: 'top' }}>
                          <button 
                            onClick={() => window.open(`http://localhost:5000/api/doctor/prescriptions/${prescription._id}/download`, '_blank')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f8fafc',
                              color: '#8b5cf6',
                              border: '1px solid #ddd6fe',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              transition: 'all 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#8b5cf6';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#8b5cf6';
                            }}
                          >
                            📄 PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Prescriptions Found</h3>
                        <p style={{ margin: 0 }}>Create a new prescription to see it listed here.</p>
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedRecords.length)} of {sortedRecords.length} entries
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

      {/* Modernized Full Page Modal overlay */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ✍️ Write New Prescription
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Patient</label>
                  <select 
                    name="patient" 
                    value={formData.patient} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  >
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Valid Until</label>
                  <input 
                    type="date" 
                    name="validUntil" 
                    value={formData.validUntil} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Medical Diagnosis</label>
                <input 
                  type="text" 
                  name="diagnosis" 
                  value={formData.diagnosis} 
                  onChange={handleInputChange} 
                  placeholder="Primary diagnosis code or description..."
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                />
              </div>

              <div style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Medications</h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Add one or more drugs to this prescription</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={addMedication}
                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                  >
                    + Add Drug
                  </button>
                </div>
                
                {formData.medications.map((med, index) => (
                  <div key={index} style={{ padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', marginBottom: '1rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '15px', background: 'white', padding: '0 10px', color: '#8b5cf6', fontWeight: '700', fontSize: '0.85rem' }}>
                      DRUG #{index + 1}
                    </div>
                    {formData.medications.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeMedication(index)} 
                        style={{ position: 'absolute', top: '15px', right: '15px', color: '#ef4444', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0.3rem 0.6rem', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        Remove
                      </button>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Drug Name</label>
                        <input placeholder="e.g. Amoxicillin" name="name" value={med.name} onChange={(e) => handleMedicationChange(index, e)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Dosage</label>
                        <input placeholder="e.g. 500mg" name="dosage" value={med.dosage} onChange={(e) => handleMedicationChange(index, e)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Frequency</label>
                        <input placeholder="e.g. 2 times a day" name="frequency" value={med.frequency} onChange={(e) => handleMedicationChange(index, e)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Duration</label>
                        <input placeholder="e.g. 7 days" name="duration" value={med.duration} onChange={(e) => handleMedicationChange(index, e)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Instructions to Patient</label>
                        <input placeholder="e.g. Take with food" name="instructions" value={med.instructions} onChange={(e) => handleMedicationChange(index, e)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>General Doctor Notes / Remarks</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  rows="3" 
                  placeholder="Any additional instructions or observations..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.75rem 2rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)' }}
                >
                  Approve & Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;