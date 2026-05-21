import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AdminMedicalRecords = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/medical-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        <div className="dashboard-content" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>Diagnostic Archives</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Comprehensive database of patient medical history and clinical findings</p>
            </div>
            <button onClick={fetchRecords} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#4a5568' }}>🔄 Refresh</button>
          </div>

          {/* Quick Filter & Search */}
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input type="text" placeholder="Search by patient, doctor, or diagnosis..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }} />
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>🔍</span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>⏳ Retrieving clinical records...</div>
          ) : filteredRecords.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {filteredRecords.map(record => (
                <div key={record._id} style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.5rem', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.03)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: '800' }}>
                      📅 {new Date(record.visitDate).toLocaleDateString()}
                    </div>
                    <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '800' }}>VERIFIED</div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Patient</div>
                    <div style={{ fontWeight: '800', color: '#1a202c', fontSize: '1.1rem' }}>{record.patientId?.name || 'Unknown Patient'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#718096' }}>{record.patientId?.email}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px' }}>
                    <div>
                      <div style={{ color: '#a0aec0', fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase' }}>Attending Doctor</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4a5568' }}>Dr. {record.doctorName}</div>
                    </div>
                    <div>
                      <div style={{ color: '#a0aec0', fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase' }}>Diagnosis</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#6366f1' }}>{record.diagnosis}</div>
                    </div>
                  </div>

                  <button onClick={() => { setSelectedRecord(record); setShowModal(true); }} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#667eea', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#667eea'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#667eea'; }}>
                    View Clinical Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '5rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
               <h3>No medical records matched your search</h3>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', width: '650px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Clinical Summary</h2>
                <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>Detailed findings from visit on {new Date(selectedRecord.visitDate).toLocaleDateString()}</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '2rem', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                 <section>
                    <h4 style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem' }}>Patient & Provider</h4>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px' }}>
                       <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.75rem', color: '#718096' }}>Patient Name</div>
                          <div style={{ fontWeight: '800', color: '#2d3748' }}>{selectedRecord.patientId?.name}</div>
                       </div>
                       <div>
                          <div style={{ fontSize: '0.75rem', color: '#718096' }}>Diagnosing Clinician</div>
                          <div style={{ fontWeight: '800', color: '#6366f1' }}>Dr. {selectedRecord.doctorName}</div>
                       </div>
                    </div>
                 </section>
                 <section>
                    <h4 style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem' }}>Patient Vitals</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                       {[
                         { l: 'BP', v: selectedRecord.vitals?.bloodPressure || '—' },
                         { l: 'Heart Rate', v: selectedRecord.vitals?.heartRate || '—' },
                         { l: 'Temp', v: selectedRecord.vitals?.temperature || '—' },
                         { l: 'Weight', v: selectedRecord.vitals?.weight || '—' }
                       ].map(v => (
                         <div key={v.l} style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '800' }}>{v.l}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#334155' }}>{v.v}</div>
                         </div>
                       ))}
                    </div>
                 </section>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <section>
                  <h4 style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Primary Diagnosis</h4>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#6366f1', background: '#eef2ff', padding: '1rem', borderRadius: '14px', border: '1px solid #6366f120' }}>
                    {selectedRecord.diagnosis}
                  </div>
                </section>

                <section>
                  <h4 style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Symptoms Observed</h4>
                  <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>{selectedRecord.symptoms || 'No symptoms documented.'}</p>
                </section>

                <section>
                  <h4 style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Treatment & Recommendations</h4>
                  <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '16px', border: '1px solid #10b98120' }}>
                     <p style={{ fontSize: '0.95rem', color: '#065f46', lineHeight: '1.6', margin: 0 }}>{selectedRecord.treatment || 'Treatment plan pending.'}</p>
                  </div>
                </section>

                {selectedRecord.notes && (
                  <section>
                    <h4 style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Internal Clinical Notes</h4>
                    <p style={{ fontSize: '0.9rem', color: '#718096', fontStyle: 'italic', margin: 0 }}>{selectedRecord.notes}</p>
                  </section>
                )}
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: '800', cursor: 'pointer' }}>Close Archive Room</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedicalRecords;