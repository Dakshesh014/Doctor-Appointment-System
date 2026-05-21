import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const Appointments = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initial tab based on URL
  const getInitialTab = () => {
    if (location.pathname.includes('upcoming-schedule')) return 'upcoming';
    // today-schedule goes to dashboard but if accessed here:
    if (location.pathname.includes('today')) return 'today';
    return 'all';
  };

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Sync tab with URL changes smoothly
  useEffect(() => {
    setActiveTab(getInitialTab());
    setCurrentPage(1);
  }, [location.pathname]);

  // Advanced Datatable State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.download-dropdown-container')) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        let data = await response.json();
        // Exclude pending from here, as they have their own screen. Only Pending when we want to show it, 
        // but typically 'Appointments' shows all. Let's show all.
        setAppointments(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to mark this appointment as completed?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doctor/appointments/${id}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Refetch to get updated status
        fetchAppointments();
      } else {
        const errData = await response.json();
        alert(errData.message || 'Failed to complete appointment');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const formatDate = (dateString, includeTime = false) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleString('en-US', options);
  };

  // Tab Filtering
  const tabFilteredAppointments = useMemo(() => {
    const now = new Date();
    // Normalize "now" to midnight for "today" comparisons
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayStart.getDate() + 1);

    switch(activeTab) {
      case 'today':
        return appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= todayStart && aptDate < todayEnd;
        });
      case 'upcoming':
        return appointments.filter(apt => new Date(apt.date) >= todayEnd);
      case 'past':
        return appointments.filter(apt => new Date(apt.date) < todayStart);
      default:
        return appointments;
    }
  }, [appointments, activeTab]);

  // Search Filtering
  const searchFilteredAppointments = useMemo(() => {
    return tabFilteredAppointments.filter((apt) => {
      const searchStr = searchTerm.toLowerCase();
      const patientName = apt.patientId?.name || apt.patient?.name || '';
      const email = apt.patientId?.email || apt.patient?.email || '';
      const phone = apt.patientId?.phone || apt.patient?.phone || '';
      const notes = apt.notes || '';
      const status = apt.status || '';

      return (
        patientName.toLowerCase().includes(searchStr) ||
        email.toLowerCase().includes(searchStr) ||
        phone.includes(searchStr) ||
        notes.toLowerCase().includes(searchStr) ||
        status.toLowerCase().includes(searchStr)
      );
    });
  }, [tabFilteredAppointments, searchTerm]);

  // Sorting
  const sortedAppointments = useMemo(() => {
    let sortableItems = [...searchFilteredAppointments];
    sortableItems.sort((a, b) => {
      let aVal, bVal;

      switch(sortConfig.key) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'patient':
          aVal = (a.patientId?.name || a.patient?.name || '').toLowerCase();
          bVal = (b.patientId?.name || b.patient?.name || '').toLowerCase();
          break;
        case 'type':
          aVal = (a.type || '').toLowerCase();
          bVal = (b.type || '').toLowerCase();
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
    return sortableItems;
  }, [searchFilteredAppointments, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedAppointments.slice(start, start + itemsPerPage);
  }, [sortedAppointments, currentPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToCSV = (downloadType) => {
    // If specific request for today, ignore current tab and just map today
    let exportData = [];
    let fileName = '';
    const now = new Date();
    
    if (downloadType === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayStart.getDate() + 1);
      
      exportData = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= todayStart && aptDate < todayEnd;
      });
      fileName = `Today_Appointments_${now.toISOString().split('T')[0]}.csv`;
    } else {
      // Current View respects tabs and searches
      exportData = sortedAppointments;
      fileName = `Appointments_Report_${now.toISOString().split('T')[0]}.csv`;
    }

    if (exportData.length === 0) {
      alert(`No appointments to download for the selected view.`);
      setShowDownloadMenu(false);
      return;
    }

    const headers = ["Date & Time", "Patient Name", "Email", "Phone", "Department", "Type", "Status", "Notes"];
    const csvRows = [headers.join(',')];

    exportData.forEach(apt => {
      const dt = formatDate(apt.date, true).replace(/,/g, '');
      const patient = apt.patientId || apt.patient || {};
      const name = `"${patient.name || 'Unknown'}"`;
      const email = `"${patient.email || 'N/A'}"`;
      const phone = `"${patient.phone || 'N/A'}"`;
      const dept = `"${apt.department || 'N/A'}"`;
      const type = `"${apt.type || 'N/A'}"`;
      const status = `"${apt.status || 'N/A'}"`;
      const notes = `"${(apt.notes || '').replace(/"/g, '""')}"`;
      
      csvRows.push([dt, name, email, phone, dept, type, status, notes].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowDownloadMenu(false);
  };

  // Badges styling
  const getStatusColor = (status) => {
    switch((status || '').toLowerCase()) {
      case 'confirmed': return { bg: '#d1fae5', text: '#065f46' };
      case 'completed': return { bg: '#e0e7ff', text: '#3730a3' };
      case 'pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'rejected':
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
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
              <h2 style={{ color: '#2c3544' }}>Loading Appointments...</h2>
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>📅</span> Master Schedule
              </h1>
              <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>Manage and track all your patient appointments efficiently</p>
            </div>

            {/* Download Dropdown */}
            <div className="download-dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
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
                📥 Export Sheet <span style={{ fontSize: '0.7rem', marginLeft: '0.2rem' }}>{showDownloadMenu ? '▲' : '▼'}</span>
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
                  minWidth: '220px',
                  zIndex: 50,
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => exportToCSV('currentView')}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      color: '#334155',
                      fontWeight: '500',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                  >
                    📄 Export Current View
                  </button>
                  <button
                    onClick={() => exportToCSV('today')}
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
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                  >
                    📆 Export Today Only
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Toolbar Area (Tabs + Search) */}
            <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>

              {/* Tabs */}
              <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #e2e8f0' }}>
                {['all', 'today', 'upcoming', 'past'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                    style={{
                      padding: '1rem 2rem',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === tab ? '3px solid #4f46e5' : '3px solid transparent',
                      color: activeTab === tab ? '#4f46e5' : '#64748b',
                      fontWeight: activeTab === tab ? '600' : '500',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                       if (activeTab !== tab) e.currentTarget.style.color = '#334155';
                    }}
                    onMouseLeave={(e) => {
                       if (activeTab !== tab) e.currentTarget.style.color = '#64748b';
                    }}
                  >
                    {tab} Appointments
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by patient, email, notes..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to page 1 on search
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>
                
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                  Showing {sortedAppointments.length} record(s)
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                    <th 
                      onClick={() => handleSort('date')} 
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Date & Time {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('patient')} 
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Patient {sortConfig.key === 'patient' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('type')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.length > 0 ? (
                    paginatedAppointments.map((apt, index) => {
                      
                      const patientData = apt.patientId || apt.patient || {};
                      const isPastConfirmed = apt.status?.toLowerCase() === 'confirmed' && new Date(apt.date) <= new Date();

                      return (
                      <tr 
                        key={apt._id} 
                        style={{ 
                          borderBottom: '1px solid #e2e8f0', 
                          transition: 'background 0.2s',
                          background: index % 2 === 0 ? 'white' : '#fafafa'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa'}
                      >
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ color: '#1e293b', fontWeight: '600', marginBottom: '0.2rem' }}>
                            {formatDate(apt.date, false)}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                             ⏰ {new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '700',
                              fontSize: '1rem'
                            }}>
                              {patientData.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>{patientData.name || 'Unknown Patient'}</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.1rem' }}>{patientData.phone || patientData.email || 'No contact info'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            background: apt.type === 'Video' ? '#e0e7ff' : '#f0fdf4',
                            color: apt.type === 'Video' ? '#4f46e5' : '#166534',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            border: `1px solid ${apt.type === 'Video' ? '#c7d2fe' : '#bbf7d0'}`
                          }}>
                            {apt.type === 'Video' ? '🎥 Video' : '🏥 In-Person'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {(() => {
                            const sc = getStatusColor(apt.status);
                            return (
                              <span style={{
                                padding: '0.25rem 0.6rem',
                                background: sc.bg,
                                color: sc.text,
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                              }}>
                                • {(apt.status || 'Unknown').toUpperCase()}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {/* Complete Button - shown only if Confirmed and date <= now */}
                            {isPastConfirmed && (
                              <button 
                                onClick={() => handleCompleteAppointment(apt._id)}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '0.8rem',
                                  transition: 'background 0.2s',
                                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                                title="Mark as Completed"
                              >
                                ✓ Finish
                              </button>
                            )}

                            {/* View Detail Button */}
                            <button 
                              onClick={() => {
                                // Provide a fallback if we want to add dedicated apt page
                                // Since we haven't created a specific appointment detail page yet,
                                // we can redirect back to patient details or a modal if needed.
                                // Currently doctor has `/doctor/patients/:id` for patient history
                                if (patientData._id) {
                                  navigate(`/doctor/patients/${patientData._id}`);
                                } else {
                                  alert('Viewing standalone appointment detail coming soon.');
                                }
                              }}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: 'white',
                                color: '#4f46e5',
                                border: '1px solid #c7d2fe',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#4f46e5';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.color = '#4f46e5';
                              }}
                            >
                              Timeline
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Appointments Found</h3>
                        <p style={{ margin: 0 }}>There are no {activeTab !== 'all' ? activeTab : ''} appointments matching your criteria.</p>
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedAppointments.length)} of {sortedAppointments.length} entries
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
                       fontWeight: '500',
                       transition: 'all 0.2s'
                     }}
                  >
                    Prev
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
                       fontWeight: '500',
                       transition: 'all 0.2s'
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

export default Appointments;