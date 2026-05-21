import React, { useState, useEffect, useMemo } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const LabRecords = () => {
  const [labRecords, setLabRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    testName: '',
    testType: '',
    testDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    results: '',
    notes: ''
  });

  // Advanced Datatable State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'testDate', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  useEffect(() => {
    fetchLabRecords();
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

  const fetchLabRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/lab-records', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLabRecords(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lab records:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/lab-records', {
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
          testName: '',
          testType: '',
          testDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
          results: '',
          notes: ''
        });
        fetchLabRecords();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding lab record:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Status Colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'Normal': return { bg: '#dcfce7', text: '#166534', dot: '#22c55e' };
      case 'Abnormal': return { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' };
      case 'Critical': return { bg: '#fef2f2', text: '#7f1d1d', dot: '#b91c1c', border: '#fca5a5' };
      case 'Pending': 
      default: return { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' };
    }
  };

  // Search Logic
  const filteredRecords = useMemo(() => {
    return labRecords.filter((record) => {
      const searchStr = searchTerm.toLowerCase();
      const patientName = record.patient?.name || '';
      const testName = record.testName || '';
      const testType = record.testType || '';
      const results = record.results || '';
      const status = record.status || '';

      return (
        patientName.toLowerCase().includes(searchStr) ||
        testName.toLowerCase().includes(searchStr) ||
        testType.toLowerCase().includes(searchStr) ||
        results.toLowerCase().includes(searchStr) ||
        status.toLowerCase().includes(searchStr)
      );
    });
  }, [labRecords, searchTerm]);

  // Sorting Logic
  const sortedRecords = useMemo(() => {
    let sortableItems = [...filteredRecords];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal, bVal;

        switch(sortConfig.key) {
          case 'testDate':
            aVal = new Date(a.testDate).getTime();
            bVal = new Date(b.testDate).getTime();
            break;
          case 'patient':
            aVal = (a.patient?.name || '').toLowerCase();
            bVal = (b.patient?.name || '').toLowerCase();
            break;
          case 'testName':
            aVal = (a.testName || '').toLowerCase();
            bVal = (b.testName || '').toLowerCase();
            break;
          case 'status':
            aVal = (a.status || '').toLowerCase();
            bVal = (b.status || '').toLowerCase();
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
    
    const headers = ['Test Date', 'Patient Name', 'Test Name', 'Type', 'Status', 'Results', 'Notes'];
    const csvRows = [headers.join(',')];

    sortedRecords.forEach(record => {
      const row = [
        formatDate(record.testDate).replace(/,/g, ''),
        `"${record.patient?.name || 'Unknown'}"`,
        `"${(record.testName || '').replace(/"/g, '""')}"`,
        `"${(record.testType || '').replace(/"/g, '""')}"`,
        `"${record.status}"`,
        `"${(record.results || '').replace(/"/g, '""')}"`,
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
    a.setAttribute('download', `Lab_Records_${new Date().toISOString().split('T')[0]}.csv`);
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
              <h2 style={{ color: '#2c3544' }}>Loading Lab Results...</h2>
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
                <span style={{ fontSize: '2rem' }}>🧪</span> Laboratory Records
              </h1>
              <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>Manage diagnostics, blood work, and imaging test results</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="download-dropdown-container" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: '#6366f1',
                    border: '1px solid #6366f1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e0e7ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  📥 Export Results <span style={{ fontSize: '0.7rem' }}>{showDownloadMenu ? '▲' : '▼'}</span>
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
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                + New Lab Record
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
                  placeholder="Search by test, patient, status..."
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
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
              
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                Showing {sortedRecords.length} record(s)
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                    <th 
                      onClick={() => handleSort('testDate')} 
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Test Date {sortConfig.key === 'testDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('patient')} 
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Patient {sortConfig.key === 'patient' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('testName')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Test Name {sortConfig.key === 'testName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600' }}>Preview Note</th>
                    <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length > 0 ? (
                    paginatedRecords.map((lab, index) => {
                      const sc = getStatusColor(lab.status);
                      
                      return (
                      <tr 
                        key={lab._id} 
                        style={{ 
                          borderBottom: '1px solid #e2e8f0', 
                          transition: 'background 0.2s',
                          background: index % 2 === 0 ? 'white' : '#fafafa'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa'}
                      >
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{formatDate(lab.testDate)}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#f1f5f9',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '1rem',
                              border: '1px solid #e2e8f0'
                            }}>
                              {lab.patient?.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>{lab.patient?.name || 'Unknown Patient'}</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{lab.patient?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: '600', color: '#334155' }}>
                            {lab.testName}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {lab.testType}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                           <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            background: sc.bg,
                            color: sc.text,
                            fontWeight: '600',
                            border: sc.border ? `1px solid ${sc.border}` : 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.dot }}></span>
                            {lab.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ 
                            color: '#64748b', 
                            fontSize: '0.85rem',
                            maxWidth: '150px', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {lab.results || lab.notes || 'No results/notes available'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => alert(`Results for ${lab.testName}:\n\n${lab.results || 'Pending'}`)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f8fafc',
                              color: '#10b981',
                              border: '1px solid #a7f3d0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#10b981';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#10b981';
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Test Records Found</h3>
                        <p style={{ margin: 0 }}>Try adjusting your search criteria or add a new diagnostic report.</p>
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

      {/* Modernized Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>🔬 Log New Lab Result</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Test Name</label>
                  <input 
                    type="text" 
                    name="testName" 
                    value={formData.testName} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g., Complete Blood Count"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Test Group/Type</label>
                  <input 
                    type="text" 
                    name="testType" 
                    value={formData.testType} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g., Hematology"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Test Date</label>
                  <input 
                    type="date" 
                    name="testDate" 
                    value={formData.testDate} 
                    onChange={handleInputChange} 
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Status Result</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Normal">Normal</option>
                    <option value="Abnormal">Abnormal</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Diagnostic Findings / Interpretation</label>
                <textarea 
                  name="results" 
                  value={formData.results} 
                  onChange={handleInputChange} 
                  rows="3" 
                  placeholder="Enter detailed laboratory findings or values..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Physician Notes</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  rows="2" 
                  placeholder="Additional context or required action..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabRecords;