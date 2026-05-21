import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const VisitHistory = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchVisitHistory();
  }, []);

  const fetchVisitHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/visit-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVisits(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching visit history:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const filtered = visits.filter(v => {
    const q = search.toLowerCase();
    return (
      (v.doctor?.name || '').toLowerCase().includes(q) ||
      (v.diagnosis || '').toLowerCase().includes(q) ||
      (v.chiefComplaint || '').toLowerCase().includes(q) ||
      (v.treatment || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="main-content">
          <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="dashboard-content">
            <h1 className="page-title">Loading Visit History...</h1>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 className="page-title">🏥 Visit History</h1>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by doctor, diagnosis..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ width: '280px', paddingLeft: '2.5rem' }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
            </div>
          </div>

          <div className="section-card">
            {filtered.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filtered.map((visit) => (
                  <div
                    key={visit._id}
                    style={{
                      padding: '2rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      background: '#f9fafb'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.5rem'
                        }}>
                          {visit.doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                            Dr. {visit.doctor?.name}
                          </h3>
                          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                            {visit.doctor?.specialization || 'General Physician'}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: '0.5rem 1rem',
                        background: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        📅 {formatDate(visit.visitDate)}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '1.5rem',
                      marginBottom: '1.5rem',
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                          Chief Complaint
                        </div>
                        <div style={{ fontWeight: '600' }}>{visit.chiefComplaint}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                          Diagnosis
                        </div>
                        <div style={{ fontWeight: '600' }}>{visit.diagnosis}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                          Follow-up
                        </div>
                        <div style={{ fontWeight: '600' }}>
                          {visit.followUpDate ? formatDate(visit.followUpDate) : 'Not scheduled'}
                        </div>
                      </div>
                    </div>

                    {/* Vitals */}
                    {visit.vitals && (
                      <div style={{
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: '#2c3544' }}>
                          Vitals
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Blood Pressure</div>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{visit.vitals.bloodPressure || 'N/A'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Heart Rate</div>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{visit.vitals.heartRate || 'N/A'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Temperature</div>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{visit.vitals.temperature || 'N/A'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Weight</div>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{visit.vitals.weight || 'N/A'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Height</div>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{visit.vitals.height || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Treatment */}
                    <div style={{
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '8px',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#2c3544' }}>
                        Treatment Plan
                      </div>
                      <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                        {visit.treatment}
                      </div>
                    </div>

                    {/* Doctor Notes */}
                    {visit.doctorNotes && (
                      <div style={{
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#2c3544' }}>
                          Doctor's Notes
                        </div>
                        <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                          {visit.doctorNotes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏥</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                  {search ? `No visits matching "${search}"` : 'No Visit History'}
                </h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                  {search ? 'Try a different search term.' : "You don't have any visit records yet"}
                </p>
                {search && (
                  <button onClick={() => setSearch('')} className="form-button" style={{ marginTop: '1.5rem', maxWidth: '180px' }}>Clear Search</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitHistory;