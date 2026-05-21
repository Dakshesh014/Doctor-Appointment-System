import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const PendingDoctors = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/doctors/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingDoctors(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/doctors/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchPendingDoctors();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error approving doctor:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      alert('Decision protocol requires a valid rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/doctors/${id}/reject`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        fetchPendingDoctors();
        setShowModal(false);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        
        <div className="dashboard-content">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>Clinician Onboarding Protocol</h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>Managing incoming medical credentials and professional verification queues</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ background: '#fffbeb', padding: '0.5rem 1rem', border: '1px solid #f59e0b30', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#b45309', fontWeight: '800', fontSize: '0.9rem' }}>{pendingDoctors.length} APPLICATIONS QUEUED</span>
               </div>
               <button onClick={fetchPendingDoctors} className="action-btn" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', boxShadow: 'none' }}>🔄 RE-SCAN</button>
            </div>
          </div>

          {/* Onboarding Queue Grid */}
          {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>INITIALIZING VERIFICATION QUEUE...</div>
          ) : pendingDoctors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '2rem' }}>
              {pendingDoctors.map(doctor => (
                <div key={doctor._id} className="dashboard-card" style={{ padding: '2rem', border: '1px solid #f1f5f9' }}>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.75rem' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '22px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', boxShadow: '0 8px 16px -4px rgba(245,158,11,0.3)' }}>
                      {doctor.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                             <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#1e293b' }}>Dr. {doctor.name}</h3>
                             <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{doctor.email}</div>
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#b45309', background: '#fffbeb', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #f59e0b40' }}>⌛ VERIFICATION PENDING</span>
                       </div>
                       <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>{doctor.specialization || 'GENERAL'}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>{doctor.experience || 0} YRS EXP</span>
                       </div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '18px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', border: '1px solid #f1f5f9' }}>
                     <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase' }}>LICENSE STATUS</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginTop: '0.25rem' }}>DOC-VERIFY-ACTIVE</div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase' }}>APPLIED PROTOCOL</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginTop: '0.25rem' }}>{new Date(doctor.createdAt).toLocaleDateString()}</div>
                     </div>
                  </div>

                  <button 
                    onClick={() => { setSelectedDoctor(doctor); setShowModal(true); }} 
                    className="action-btn" 
                    style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: 'white', fontWeight: '900', fontSize: '0.95rem', padding: '1.2rem' }}
                  >
                    INITIATE CREDENTIAL REVIEW
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '8rem', textAlign: 'center', background: 'white', borderRadius: '32px', border: '2px dashed #f1f5f9' }}>
               <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🥇</div>
               <h2 style={{ color: '#1e293b' }}>Clear Horizon</h2>
               <p style={{ color: '#64748b' }}>Every medical practitioner has been processed. No pending applications found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Futuristic Verification Modal */}
      {showModal && selectedDoctor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
          <div style={{ background: 'white', width: '750px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.4)' }}>
            
            {/* Modal Header */}
            <div style={{ background: '#f59e0b', padding: '2.5rem', color: 'white', position: 'relative' }}>
               <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.1)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
               <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>Credential Verification Engine</h2>
               <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '0.4rem', fontWeight: '600' }}>Reviewing operational eligibility for Dr. {selectedDoctor.name}</p>
            </div>

            <div style={{ padding: '2.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>
                  <section>
                     <h4 style={{ margin: '0 0 1.25rem 0', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>IDENTITY SNAPSHOT</h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Full Practitioner Name</div><div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>Dr. {selectedDoctor.name}</div></div>
                        <div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Digital Communications</div><div style={{ fontWeight: '700', color: '#475569' }}>{selectedDoctor.email}</div></div>
                        <div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Direct Interlink</div><div style={{ fontWeight: '700', color: '#475569' }}>{selectedDoctor.phone || 'NOT PROVIDED'}</div></div>
                     </div>
                  </section>
                  <section>
                     <h4 style={{ margin: '0 0 1.25rem 0', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CAPABILITY MATRIX</h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Primary Specialization</div><div style={{ fontWeight: '800', color: '#b45309' }}>{selectedDoctor.specialization?.toUpperCase() || 'GENERAL'}</div></div>
                        <div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Experience Quotient</div><div style={{ fontWeight: '800', color: '#1e293b' }}>{selectedDoctor.experience} STANDARD YEARS</div></div>
                        <div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Verified Qualification</div><div style={{ fontWeight: '800', color: '#1e293b' }}>{selectedDoctor.qualification || 'MBBS / MD CERTIFIED'}</div></div>
                     </div>
                  </section>
               </div>

               {/* Document Verification Track */}
               <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '1.75rem', border: '1px solid #f1f5f9', marginBottom: '2.5rem' }}>
                  <h4 style={{ margin: '0 0 1.25rem 0', color: '#475569', fontSize: '0.85rem', fontWeight: '900' }}>SYSTEM DOCUMENT VERIFICATION SCAN</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                     {[
                        { icon: '🪪', label: 'License Verification', file: 'LICENSE-SNAPSHOT-01.PDF' },
                        { icon: '🎓', label: 'Doctorate Degree', file: 'MD-CERTIFICATE-VERIFY.JPG' }
                     ].map((doc, i) => (
                        <div key={i} style={{ padding: '1rem', borderRadius: '16px', background: 'white', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                           <span style={{ fontSize: '1.5rem' }}>{doc.icon}</span>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b' }}>{doc.label}</div>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700' }}>{doc.file}</div>
                           </div>
                           <span style={{ color: '#10b981', fontWeight: '900' }}>SCAN OK</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#475569', marginBottom: '0.6rem' }}>DECISION LOG / REJECTION RATIONALE</label>
                  <textarea 
                    placeholder="Document the decision for the clinical audit log..." 
                    value={rejectionReason} 
                    onChange={(e) => setRejectionReason(e.target.value)} 
                    style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', border: '1.5px solid #e2e8f0', outline: 'none', minHeight: '100px', fontSize: '0.95rem', background: '#f8fafc', fontWeight: '500' }} 
                  />
               </div>

               <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <button 
                    disabled={actionLoading} 
                    onClick={() => handleApprove(selectedDoctor._id)} 
                    style={{ flex: 2, padding: '1.4rem', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 12px 24px -6px rgba(16,185,129,0.3)' }}
                  >
                    {actionLoading ? 'PROCESSING PROTOCOL...' : 'CONFIRM CLINCAL APPROVAL'}
                  </button>
                  <button 
                    disabled={actionLoading} 
                    onClick={() => handleReject(selectedDoctor._id)} 
                    style={{ flex: 1, padding: '1.4rem', borderRadius: '20px', border: '2px solid #fee2e2', background: 'white', color: '#ef4444', fontWeight: '900', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    REJECT QUEUE
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingDoctors;