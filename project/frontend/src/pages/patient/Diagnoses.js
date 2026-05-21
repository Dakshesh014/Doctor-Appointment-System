import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const Diagnoses = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const fetchDiagnoses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/diagnoses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDiagnoses(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const filtered = diagnoses.filter(d => {
    const q = search.toLowerCase();
    return (
      (d.diagnosis || '').toLowerCase().includes(q) ||
      (d.doctor?.name || '').toLowerCase().includes(q) ||
      (d.symptoms || '').toLowerCase().includes(q)
    );
  });

  const uniqueDoctors = [...new Set(diagnoses.map(d => d.doctor?._id))].length;
  const latestDate = diagnoses.length > 0 ? formatDate(diagnoses[0].visitDate) : 'N/A';

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="main-content">
          <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="dashboard-content"><h1 className="page-title">Loading Diagnoses...</h1></div>
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
            <h1 className="page-title">🩺 Medical Diagnoses</h1>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search diagnoses, doctors, symptoms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ width: '320px', paddingLeft: '2.5rem' }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Diagnoses', value: diagnoses.length, icon: '📋', color: '#8b5cf6' },
              { label: 'Treating Doctors', value: uniqueDoctors, icon: '👨‍⚕️', color: '#00c9b7' },
              { label: 'Latest Diagnosis', value: latestDate, icon: '📅', color: '#4a9eff', isDate: true }
            ].map(s => (
              <div key={s.label} style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontWeight: '800', color: s.color, fontSize: s.isDate ? '0.9rem' : '1.75rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.15rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Timeline View */}
          {filtered.length > 0 ? (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '31px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, #8b5cf6, #d946ef)', borderRadius: '2px' }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filtered.map((record, index) => (
                  <div key={record._id} style={{ display: 'flex', gap: '1.5rem' }}>
                    {/* Timeline Dot */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: index === 0 ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' : 'linear-gradient(135deg, #c4b5fd, #f0abfc)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '800', fontSize: '1.5rem',
                        border: '3px solid white', boxShadow: '0 2px 8px rgba(139,92,246,0.3)', zIndex: 1
                      }}>
                        {index === 0 ? '🩺' : (record.doctor?.name?.charAt(0) || 'D')}
                      </div>
                    </div>

                    {/* Content Card */}
                    <div style={{
                      flex: 1, background: 'white', borderRadius: '12px',
                      border: `1px solid ${index === 0 ? '#c4b5fd' : '#e5e7eb'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden'
                    }}>
                      {/* Card Header */}
                      <div
                        style={{
                          padding: '1.25rem', cursor: 'pointer',
                          background: index === 0 ? 'linear-gradient(to right, #faf5ff, white)' : 'white',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                        }}
                        onClick={() => setExpandedId(expandedId === record._id ? null : record._id)}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Dr. {record.doctor?.name}</h3>
                            {index === 0 && (
                              <span style={{ padding: '2px 10px', background: '#ede9fe', color: '#6d28d9', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>Most Recent</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                            {record.doctor?.specialization} · 📅 {formatDate(record.visitDate)}
                          </div>
                        </div>
                        <span style={{ fontSize: '1.1rem', color: '#8b5cf6', transition: 'transform 0.2s', transform: expandedId === record._id ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                      </div>

                      {/* Primary Diagnosis */}
                      <div style={{ padding: '0 1.25rem 1.25rem' }}>
                        <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                          <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            🏥 Primary Diagnosis
                          </div>
                          <div style={{ color: '#1e3a8a', fontWeight: '600', fontSize: '1rem', lineHeight: '1.6' }}>
                            {record.diagnosis}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedId === record._id && (
                        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', paddingTop: '1rem' }}>
                            {record.symptoms && (
                              <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                                <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: '700', marginBottom: '0.5rem' }}>🩺 Symptoms Presented</div>
                                <div style={{ color: '#78350f', fontSize: '0.9rem', lineHeight: '1.6' }}>{record.symptoms}</div>
                              </div>
                            )}
                            {record.treatment && (
                              <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '8px', border: '1px solid #6ee7b7' }}>
                                <div style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: '700', marginBottom: '0.5rem' }}>💊 Treatment Given</div>
                                <div style={{ color: '#047857', fontSize: '0.9rem', lineHeight: '1.6' }}>{record.treatment}</div>
                              </div>
                            )}
                            {record.notes && (
                              <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: '700', marginBottom: '0.5rem' }}>📝 Doctor's Notes</div>
                                <div style={{ color: '#78350f', fontSize: '0.9rem', lineHeight: '1.6' }}>{record.notes}</div>
                              </div>
                            )}
                            {record.vitals && record.vitals.bloodPressure && (
                              <div style={{ padding: '1rem', background: '#fce7f3', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                                <div style={{ fontSize: '0.8rem', color: '#9f1239', fontWeight: '700', marginBottom: '0.5rem' }}>❤️ Vitals</div>
                                <div style={{ color: '#be123c', fontSize: '0.85rem', lineHeight: '1.8' }}>
                                  {record.vitals.bloodPressure && <div>BP: {record.vitals.bloodPressure}</div>}
                                  {record.vitals.heartRate && <div>HR: {record.vitals.heartRate}</div>}
                                  {record.vitals.temperature && <div>Temp: {record.vitals.temperature}</div>}
                                </div>
                              </div>
                            )}
                          </div>
                          {record.followUpDate && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📅</span>
                              <div>
                                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Follow-up Date</div>
                                <div style={{ fontWeight: '700', color: '#1e40af' }}>{formatDate(record.followUpDate)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="section-card" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🩺</div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                {search ? `No diagnoses matching "${search}"` : 'No Diagnoses Found'}
              </h3>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                {search ? 'Try a different search term.' : "Your medical diagnoses will appear here after your visits."}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="form-button" style={{ marginTop: '1.5rem', maxWidth: '200px' }}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnoses;