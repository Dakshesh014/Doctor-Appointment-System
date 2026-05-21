import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AdminPrescriptions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        <div className="dashboard-content" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>Clinical Prescriptions</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Review and verify medical prescriptions issued by portal consultants</p>
            </div>
            <button onClick={fetchPrescriptions} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#4a5568' }}>🔄 Refresh</button>
          </div>

          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
             <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Search by patient, doctor or medication..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }} />
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>🔍</span>
              </div>
          </div>

          {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>⏳ Loading prescription records...</div>
          ) : filteredPrescriptions.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
               {filteredPrescriptions.map(p => (
                 <div key={p._id} style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.5rem', transition: '0.2s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onClick={() => { setSelectedPrescription(p); setShowModal(true); }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#667eea' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                       <div style={{ background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '10px', color: '#4a5568', fontSize: '0.7rem', fontWeight: '800' }}>
                          🆔 RX-{p._id.slice(-6).toUpperCase()}
                       </div>
                       <div style={{ fontSize: '0.75rem', color: '#a0aec0', fontWeight: '600' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ fontSize: '0.65rem', color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Patient Name</div>
                       <div style={{ fontWeight: '800', color: '#1a202c', fontSize: '1.1rem' }}>{p.patient?.name}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                       <div>
                          <div style={{ fontSize: '0.6rem', color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase' }}>Prescribed By</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#4a5568' }}>Dr. {p.doctor?.name}</div>
                       </div>
                       <div>
                          <div style={{ fontSize: '0.6rem', color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase' }}>Diagnosis</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#667eea' }}>{p.diagnosis}</div>
                       </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ fontSize: '0.8rem', color: '#718096' }}>{p.medications?.length || 0} Medications listed</div>
                       <button style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>View RX →</button>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
             <div style={{ padding: '5rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</div>
               <h3>No prescriptions found</h3>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Details Modal */}
      {showModal && selectedPrescription && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
          <div style={{ background: 'white', width: '550px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
             <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '2rem', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', display: 'inline-block', marginBottom: '0.75rem' }}>E-PRESCRIPTION</div>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Dr. {selectedPrescription.doctor?.name}</h2>
                      <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>{selectedPrescription.doctor?.specialization || 'Consultant'}</div>
                   </div>
                   <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                </div>
             </div>

             <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                   <div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase' }}>Patient</div>
                      <div style={{ fontWeight: '800', color: '#1a202c', fontSize: '1.1rem' }}>{selectedPrescription.patient?.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>{selectedPrescription.patient?.email}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase' }}>Date Issued</div>
                      <div style={{ fontWeight: '700', color: '#2d3748' }}>{new Date(selectedPrescription.createdAt).toLocaleDateString()}</div>
                   </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                   <h4 style={{ color: '#1a202c', fontSize: '0.85rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>💊</span> Medication List
                   </h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedPrescription.medications && selectedPrescription.medications.length > 0 ? (
                        selectedPrescription.medications.map((m, idx) => (
                           <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                 <div style={{ fontWeight: '800', color: '#2d3748' }}>{m.name}</div>
                                 <div style={{ color: '#667eea', fontWeight: '800', fontSize: '0.85rem' }}>{m.dosage}</div>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', gap: '1rem' }}>
                                 <span>⏱ {m.frequency}</span>
                                 <span>🗓 {m.duration}</span>
                              </div>
                              {m.instructions && (
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.5rem' }}>"{m.instructions}"</div>
                              )}
                           </div>
                        ))
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#a0aec0', border: '1px dashed #e2e8f0', borderRadius: '16px' }}>No specific medications listed.</div>
                      )}
                   </div>
                </div>

                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '16px', marginBottom: '2rem' }}>
                   <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Diagnosis</div>
                   <div style={{ color: '#991b1b', fontWeight: '700', fontSize: '0.9rem' }}>{selectedPrescription.diagnosis}</div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                   <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '800', cursor: 'pointer' }}>Close</button>
                   <button style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: 'none', background: '#667eea', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>Print Preview</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptions;