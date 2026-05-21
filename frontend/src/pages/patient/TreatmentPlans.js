import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const TreatmentPlans = () => {
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchTreatmentPlans();
  }, []);

  const fetchTreatmentPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/treatment-plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTreatmentPlans(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handlePrint = (record) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Treatment Plan - ${formatDate(record.visitDate)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #065f46; font-size: 1.5rem; }
            .section { margin: 20px 0; padding: 15px; border-radius: 8px; }
            .diagnosis { background: #eff6ff; border-left: 4px solid #3b82f6; }
            .treatment { background: #d1fae5; border-left: 4px solid #10b981; }
            .symptoms { background: #fff7ed; border-left: 4px solid #f97316; }
            .notes { background: #fef3c7; border-left: 4px solid #eab308; }
            label { font-size: 0.8rem; color: #6c757d; display: block; margin-bottom: 5px; }
            p { margin: 0; line-height: 1.6; }
            .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 20px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💊 Treatment Plan</h1>
            <p><strong>Doctor:</strong> Dr. ${record.doctor?.name} (${record.doctor?.specialization || 'General Physician'})</p>
            <p><strong>Visit Date:</strong> ${formatDate(record.visitDate)}</p>
            ${record.followUpDate ? `<p><strong>Follow-up:</strong> ${formatDate(record.followUpDate)}</p>` : ''}
          </div>
          ${record.diagnosis ? `<div class="section diagnosis"><label>DIAGNOSIS</label><p>${record.diagnosis}</p></div>` : ''}
          ${record.treatment ? `<div class="section treatment"><label>TREATMENT PLAN</label><p>${record.treatment.replace(/\n/g, '<br>')}</p></div>` : ''}
          ${record.symptoms ? `<div class="section symptoms"><label>SYMPTOMS</label><p>${record.symptoms}</p></div>` : ''}
          ${record.doctorNotes ? `<div class="section notes"><label>DOCTOR'S NOTES</label><p>${record.doctorNotes}</p></div>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filtered = treatmentPlans.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.treatment || '').toLowerCase().includes(q) ||
      (p.doctor?.name || '').toLowerCase().includes(q) ||
      (p.diagnosis || '').toLowerCase().includes(q)
    );
  });

  const uniqueDoctors = [...new Set(treatmentPlans.map(p => p.doctor?._id))].length;
  const latestDate = treatmentPlans.length > 0 ? formatDate(treatmentPlans[0].visitDate) : 'N/A';

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="main-content">
          <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="dashboard-content"><h1 className="page-title">Loading Treatment Plans...</h1></div>
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
            <h1 className="page-title">💊 Treatment Plans</h1>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by treatment or doctor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ width: '280px', paddingLeft: '2.5rem' }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
            </div>
          </div>

          {/* Info Banner */}
          <div style={{ marginBottom: '2rem', padding: '1rem 1.5rem', background: 'linear-gradient(to right, #d1fae5, #ecfdf5)', borderRadius: '12px', border: '1px solid #6ee7b7', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.75rem' }}>💊</span>
            <div>
              <div style={{ fontWeight: '700', color: '#065f46', marginBottom: '0.25rem' }}>Your Treatment Plans</div>
              <div style={{ color: '#047857', fontSize: '0.9rem' }}>
                Follow your prescribed treatment plans and consult your doctor if you have any questions or concerns.
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Plans', value: treatmentPlans.length, icon: '📋', color: '#10b981' },
              { label: 'Doctors Consulted', value: uniqueDoctors, icon: '👨‍⚕️', color: '#4a9eff' },
              { label: 'Latest Plan', value: latestDate, icon: '📅', color: '#8b5cf6', isDate: true }
            ].map(s => (
              <div key={s.label} style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontWeight: '800', color: s.color, fontSize: s.isDate ? '0.9rem' : '1.75rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.15rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Plans List */}
          {filtered.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filtered.map((record, index) => (
                <div key={record._id} style={{
                  background: 'white', borderRadius: '16px',
                  border: `1px solid ${index === 0 ? '#6ee7b7' : '#e5e7eb'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden'
                }}>
                  {/* Card Header */}
                  <div
                    style={{
                      padding: '1.5rem', cursor: 'pointer',
                      background: index === 0 ? 'linear-gradient(to right, #ecfdf5, white)' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                    onClick={() => setExpandedId(expandedId === record._id ? null : record._id)}
                  >
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1.5rem', flexShrink: 0 }}>
                        {record.doctor?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>Dr. {record.doctor?.name}</h3>
                          {index === 0 && <span style={{ padding: '2px 10px', background: '#d1fae5', color: '#065f46', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>Latest</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          {record.doctor?.specialization} · {formatDate(record.visitDate)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button
                        onClick={e => { e.stopPropagation(); handlePrint(record); }}
                        title="Print treatment plan"
                        style={{ padding: '0.5rem 1rem', background: '#4a9eff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                      >
                        🖨️ Print
                      </button>
                      <span style={{ fontSize: '1.1rem', color: '#10b981', transform: expandedId === record._id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                  </div>

                  {/* Treatment Preview - Always Visible */}
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <div style={{ padding: '1.25rem', background: '#d1fae5', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                      <div style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💊 Prescribed Treatment</div>
                      <div style={{ color: '#047857', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                        {expandedId === record._id
                          ? record.treatment
                          : record.treatment && record.treatment.length > 200
                            ? record.treatment.substring(0, 200) + '... (click to expand)'
                            : record.treatment
                        }
                      </div>
                    </div>

                    {/* Expanded Section */}
                    {expandedId === record._id && (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                          {record.diagnosis && (
                            <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                              <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: '700', marginBottom: '0.5rem' }}>🏥 Diagnosis</div>
                              <div style={{ color: '#1e3a8a', fontSize: '0.9rem', lineHeight: '1.6' }}>{record.diagnosis}</div>
                            </div>
                          )}
                          {record.symptoms && (
                            <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                              <div style={{ fontSize: '0.8rem', color: '#c2410c', fontWeight: '700', marginBottom: '0.5rem' }}>🩺 Symptoms</div>
                              <div style={{ color: '#9a3412', fontSize: '0.9rem', lineHeight: '1.6' }}>{record.symptoms}</div>
                            </div>
                          )}
                          {record.doctorNotes && (
                            <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                              <div style={{ fontSize: '0.8rem', color: '#78350f', fontWeight: '700', marginBottom: '0.5rem' }}>📝 Doctor's Notes</div>
                              <div style={{ color: '#78350f', fontSize: '0.9rem', lineHeight: '1.6' }}>{record.doctorNotes}</div>
                            </div>
                          )}
                          {record.vitals && record.vitals.bloodPressure && (
                            <div style={{ padding: '1rem', background: '#fce7f3', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                              <div style={{ fontSize: '0.8rem', color: '#9f1239', fontWeight: '700', marginBottom: '0.5rem' }}>❤️ Vitals at Visit</div>
                              <div style={{ color: '#be123c', fontSize: '0.9rem', lineHeight: '1.7' }}>
                                {record.vitals.bloodPressure && <div>BP: {record.vitals.bloodPressure}</div>}
                                {record.vitals.heartRate && <div>HR: {record.vitals.heartRate}</div>}
                                {record.vitals.temperature && <div>Temp: {record.vitals.temperature}</div>}
                                {record.vitals.weight && <div>Weight: {record.vitals.weight}</div>}
                              </div>
                            </div>
                          )}
                        </div>

                        {record.followUpDate && (
                          <div style={{ marginTop: '1rem', padding: '0.75rem 1.25rem', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>📅</span>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Follow-up Appointment</div>
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
          ) : (
            <div className="section-card" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>💊</div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                {search ? `No plans matching "${search}"` : 'No Treatment Plans Found'}
              </h3>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                {search ? 'Try a different search term.' : "Your treatment plans will appear here after doctor visits."}
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

export default TreatmentPlans;