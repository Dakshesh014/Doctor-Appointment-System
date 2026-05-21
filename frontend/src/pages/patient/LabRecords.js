import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const LabRecords = () => {
  const [labRecords, setLabRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchLabRecords();
  }, []);

  const fetchLabRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/lab-records', {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Normal: { bg: '#d1fae5', text: '#065f46', icon: '✓' },
      Abnormal: { bg: '#fee2e2', text: '#991b1b', icon: '⚠' },
      Critical: { bg: '#fef3c7', text: '#92400e', icon: '⚡' }
    };
    return colors[status] || colors.Normal;
  };

  const filtered = labRecords.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = (r.testName || '').toLowerCase().includes(q) || (r.doctor?.name || '').toLowerCase().includes(q);
    const matchFilter = filter === 'all' || (r.result?.status || '').toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="main-content">
          <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="dashboard-content">
            <h1 className="page-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 className="page-title">🧪 Lab Records</h1>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search tests or doctors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ width: '260px', paddingLeft: '2.5rem' }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
            </div>
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['all', 'Normal', 'Abnormal', 'Critical'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ padding: '0.4rem 1.1rem', borderRadius: '20px', border: '2px solid', borderColor: filter === f ? '#00c9b7' : '#e5e7eb', background: filter === f ? '#00c9b7' : 'white', color: filter === f ? 'white' : '#6c757d', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', transition: 'all 0.2s' }}
              >
                {f === 'all' ? `All (${labRecords.length})` : `${f} (${labRecords.filter(r => (r.result?.status || '') === f).length})`}
              </button>
            ))}
          </div>

          <div className="section-card">
            {filtered.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filtered.map((record) => (
                  <div
                    key={record._id}
                    style={{
                      padding: '2rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      background: 'white'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                          {record.testName}
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          <strong>Test Type:</strong> {record.testType}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                          📅 Test Date: {formatDate(record.testDate)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '0.75rem 1.25rem',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: '700',
                          background: getStatusColor(record.status).bg,
                          color: getStatusColor(record.status).text,
                          display: 'inline-block'
                        }}>
                          {getStatusColor(record.status).icon} {record.status}
                        </span>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.25rem'
                      }}>
                        {record.doctor?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>Dr. {record.doctor?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          {record.doctor?.specialization || 'General Physician'}
                        </div>
                      </div>
                    </div>

                    {/* Results */}
                    <div style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#2c3544' }}>
                        Test Results
                      </div>
                      <div style={{ fontSize: '1rem', lineHeight: '1.8', color: '#4b5563', whiteSpace: 'pre-wrap' }}>
                        {record.results}
                      </div>
                    </div>

                    {/* Notes */}
                    {record.notes && (
                      <div style={{
                        padding: '1.5rem',
                        background: '#fffbeb',
                        borderRadius: '8px',
                        border: '1px solid #fef3c7'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#2c3544' }}>
                          📝 Doctor's Notes
                        </div>
                        <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                          {record.notes}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                      <button style={{
                        padding: '0.75rem 1.5rem',
                        background: '#4a9eff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}>
                        📄 View Full Report
                      </button>
                      <button style={{
                        padding: '0.75rem 1.5rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}>
                        📥 Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🧪</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>No Lab Records</h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                  You don't have any lab records yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabRecords;