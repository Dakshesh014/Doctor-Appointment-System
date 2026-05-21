import React, { useState, useEffect, useMemo } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const Billing = () => {
  const [billingRecords, setBillingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Datatable State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  useEffect(() => {
    fetchBillingRecords();
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

  const fetchBillingRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/billing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBillingRecords(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching billing records:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Financial Summaries
  const totalBills = billingRecords
    .filter(b => b.type === 'Bill')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalPayments = billingRecords
    .filter(b => b.type === 'Payment')
    .reduce((sum, b) => sum + b.amount, 0);

  const balance = totalBills - totalPayments;

  // Search Logic
  const filteredRecords = useMemo(() => {
    return billingRecords.filter((record) => {
      const searchStr = searchTerm.toLowerCase();
      const patientName = record.patientId?.name || '';
      const patientEmail = record.patientId?.email || '';
      const desc = record.description || '';
      const type = record.type || '';
      const status = record.status || '';

      return (
        patientName.toLowerCase().includes(searchStr) ||
        patientEmail.toLowerCase().includes(searchStr) ||
        desc.toLowerCase().includes(searchStr) ||
        type.toLowerCase().includes(searchStr) ||
        status.toLowerCase().includes(searchStr)
      );
    });
  }, [billingRecords, searchTerm]);

  // Sorting Logic
  const sortedRecords = useMemo(() => {
    let sortableItems = [...filteredRecords];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal, bVal;

        switch(sortConfig.key) {
          case 'date':
            aVal = new Date(a.date).getTime();
            bVal = new Date(b.date).getTime();
            break;
          case 'patient':
            aVal = (a.patientId?.name || '').toLowerCase();
            bVal = (b.patientId?.name || '').toLowerCase();
            break;
          case 'amount':
            aVal = a.amount || 0;
            bVal = b.amount || 0;
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
            aVal = (a[sortConfig.key] || '').toString().toLowerCase();
            bVal = (b[sortConfig.key] || '').toString().toLowerCase();
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
    
    const headers = ['Date', 'Patient Name', 'Description', 'Type', 'Amount', 'Status'];
    const csvRows = [headers.join(',')];

    sortedRecords.forEach(record => {
      const row = [
        formatDate(record.date).replace(/,/g, ''),
        `"${record.patientId?.name || 'Unknown'}"`,
        `"${(record.description || '').replace(/"/g, '""')}"`,
        `"${record.type || 'Unknown'}"`,
        `${record.amount}`,
        `"${record.status || 'Unknown'}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Financial_Statement_${new Date().toISOString().split('T')[0]}.csv`);
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
              <h2 style={{ color: '#2c3544' }}>Loading Financial Data...</h2>
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
                <span style={{ fontSize: '2rem' }}>💳</span> Billing & Finances
              </h1>
              <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>Track invoices, patient payments, and your revenue stream</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="download-dropdown-container" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: '#f97316',
                    border: '1px solid #f97316',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fff7ed'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  📥 Export Statements <span style={{ fontSize: '0.7rem' }}>{showDownloadMenu ? '▲' : '▼'}</span>
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
                      📄 Export current view to CSV
                    </button>
                  </div>
                )}
              </div>

              <button 
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(249, 115, 22, 0.2)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                + Create Invoice
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '6rem', opacity: '0.1' }}>🧾</div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Invoiced</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>${totalBills.toFixed(2)}</div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '6rem', opacity: '0.1' }}>💵</div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Received</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>${totalPayments.toFixed(2)}</div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: balance > 0 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                : balance < 0 ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
              borderRadius: '16px',
              color: 'white',
              boxShadow: `0 10px 15px -3px rgba(${balance > 0 ? '245,158,11' : balance < 0 ? '239,68,68' : '100,116,139'}, 0.3)`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '6rem', opacity: '0.1' }}>{balance > 0 ? '⏳' : '✅'}</div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding Balance</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>${Math.abs(balance).toFixed(2)}</div>
            </div>
          </div>

          <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search statements, patients, or status..."
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
                  onFocus={(e) => e.target.style.borderColor = '#f97316'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
              
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                Showing {sortedRecords.length} record(s)
              </div>
            </div>

            {/* Datatable */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                    <th 
                      onClick={() => handleSort('date')} 
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('patient')} 
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Patient {sortConfig.key === 'patient' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      Description
                    </th>
                    <th 
                      onClick={() => handleSort('type')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('amount')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'right' }}
                    >
                      Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'center' }}
                    >
                      Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length > 0 ? (
                    paginatedRecords.map((billing, index) => {
                      const isBill = billing.type === 'Bill';
                      
                      return (
                      <tr 
                        key={billing._id} 
                        style={{ 
                          borderBottom: '1px solid #e2e8f0', 
                          transition: 'background 0.2s',
                          background: index % 2 === 0 ? 'white' : '#fafafa'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa'}
                      >
                        <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#1e293b' }}>
                          {formatDate(billing.date)}
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#ffedd5',
                              color: '#ea580c',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '1rem',
                              border: '1px solid #fed7aa'
                            }}>
                              {billing.patientId?.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>{billing.patientId?.name || 'Unknown'}</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{billing.patientId?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ 
                            color: '#475569',
                            maxWidth: '220px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {billing.description}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            background: isBill ? '#eff6ff' : '#ecfdf5',
                            color: isBill ? '#2563eb' : '#059669',
                            fontWeight: '600',
                            border: `1px solid ${isBill ? '#bfdbfe' : '#a7f3d0'}`
                          }}>
                            {billing.type}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700', color: isBill ? '#dc2626' : '#16a34a', fontSize: '1.05rem' }}>
                          {isBill ? '+' : '-'}${billing.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            background: billing.status === 'Paid' ? '#dcfce7' : billing.status === 'Unpaid' ? '#fee2e2' : '#fef3c7',
                            color: billing.status === 'Paid' ? '#166534' : billing.status === 'Unpaid' ? '#991b1b' : '#92400e',
                            fontWeight: '600'
                          }}>
                            {billing.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <button style={{
                            padding: '0.4rem 0.8rem',
                            background: 'white',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                             e.currentTarget.style.background = '#f8fafc';
                             e.currentTarget.style.borderColor = '#94a3b8';
                          }}
                          onMouseLeave={(e) => {
                             e.currentTarget.style.background = 'white';
                             e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                          >
                           Options...
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                    <tr>
                      <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Billing Records Found</h3>
                        <p style={{ margin: 0 }}>Try adjusting your search criteria or create a new invoice.</p>
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
    </div>
  );
};

export default Billing;