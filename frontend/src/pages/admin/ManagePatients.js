import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const ManagePatients = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        fetchPatients();
        if (selectedPatient && selectedPatient._id === id) {
           setSelectedPatient({...selectedPatient, status: nextStatus});
        }
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  return (
    <div className="dashboard-layout">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>Patient Intelligence Directory</h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>Managing medical consumers with real-time health snapshots</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>📋</span>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{patients.length} REGISTERED</span>
               </div>
               <button onClick={fetchPatients} className="action-btn" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', boxShadow: 'none' }}>🔄 SYNC</button>
            </div>
          </div>

          {/* Premium Search Hub */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Scan directory by name, biometric email, or contact..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc' }} 
              />
              <span style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', opacity: 0.5 }}>🔎</span>
            </div>
          </div>

          {/* Patient Data Grid */}
          {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>INJECTING PATIENT DATA...</div>
          ) : filteredPatients.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.75rem' }}>
              {filteredPatients.map(p => (
                <div key={p._id} className="dashboard-card" style={{ padding: '1.75rem', cursor: 'pointer', border: '1px solid #f1f5f9' }} onClick={() => { setSelectedPatient(p); setShowDetails(true); }}>
                  <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
                     <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: '900' }}>
                        {p.name.charAt(0)}
                     </div>
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                           <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b', fontWeight: '800' }}>{p.name}</h3>
                           <span style={{ padding: '0.25rem 0.6rem', borderRadius: '8px', background: p.status === 'approved' ? '#f0fdf4' : '#fef2f2', color: p.status === 'approved' ? '#10b981' : '#ef4444', fontSize: '0.65rem', fontWeight: '900' }}>
                              {p.status.toUpperCase()}
                           </span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>{p.email}</div>
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                           {p.bloodType && <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: '#fee2e2', color: '#ef4444', fontSize: '0.65rem', fontWeight: '800' }}>🩸 {p.bloodType}</span>}
                           <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.65rem', fontWeight: '800' }}>PATIENT ID: {p._id.slice(-6)}</span>
                        </div>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', marginBottom: '1.5rem' }}>
                     <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>CONTACT NODE</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '700', marginTop: '0.2rem' }}>{p.phone || 'UNCONNECTED'}</div>
                     </div>
                     <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>ONBOARDING</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '700', marginTop: '0.2rem' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                     </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                     <button className="action-btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569', fontSize: '0.85rem', fontWeight: '800', boxShadow: 'none' }}>VIEW PROFILE</button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleStatusToggle(p._id, p.status); }} 
                        className="action-btn" 
                        style={{ flex: 1, background: p.status === 'approved' ? '#fef2f2' : '#f0fdf4', color: p.status === 'approved' ? '#ef4444' : '#10b981', fontSize: '0.85rem', fontWeight: '800', boxShadow: 'none' }}
                     >
                        {p.status === 'approved' ? 'SUSPEND' : 'ACTIVATE'}
                     </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '8rem', textAlign: 'center', background: 'white', borderRadius: '32px', border: '2px dashed #f1f5f9' }}>
               <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛸</div>
               <h2 style={{ color: '#1e293b' }}>Zero Subjects Found</h2>
               <p style={{ color: '#64748b' }}>The directory is silent. Refine your scan parameters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Deep-Dive Patient Modal */}
      {showDetails && selectedPatient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: 'white', width: '680px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.4)' }}>
            
            {/* Header / Hero Section */}
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '3rem 2.5rem', position: 'relative', color: 'white' }}>
               <button onClick={() => setShowDetails(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
               
               <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '28px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: '900', color: '#6366f1', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)' }}>
                     {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                     <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '900' }}>{selectedPatient.name}</h2>
                     <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', opacity: 0.9, fontSize: '0.95rem', fontWeight: '600' }}>
                        <span>🆔 {selectedPatient._id}</span>
                        <span>🗓️ Joined {new Date(selectedPatient.createdAt).getFullYear()}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', padding: '0 2.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
               {['overview', 'medical', 'financial', 'activity'].map(tab => (
                  <button 
                     key={tab} 
                     onClick={() => setActiveTab(tab)}
                     style={{ 
                        padding: '1.25rem 1.5rem', 
                        border: 'none', 
                        background: 'none', 
                        fontSize: '0.85rem', 
                        fontWeight: '800', 
                        color: activeTab === tab ? '#6366f1' : '#94a3b8', 
                        cursor: 'pointer', 
                        borderBottom: '3px solid', 
                        borderColor: activeTab === tab ? '#6366f1' : 'transparent',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                     }}
                  >
                     {tab}
                  </button>
               ))}
            </div>

            {/* Modal Content Area */}
            <div style={{ padding: '2.5rem', maxHeight: '55vh', overflowY: 'auto' }}>
               {activeTab === 'overview' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                     <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>CORE METADATA</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                           <div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Communication Node</div><div style={{ fontWeight: '700', color: '#1e293b' }}>{selectedPatient.email}</div></div>
                           <div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Direct Phone</div><div style={{ fontWeight: '700', color: '#1e293b' }}>{selectedPatient.phone || 'NO RECORD'}</div></div>
                           <div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Biometric Sex</div><div style={{ fontWeight: '700', color: '#1e293b' }}>{selectedPatient.gender || 'UNDEFINED'}</div></div>
                        </div>
                     </div>
                     <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>SYSTEM STATE</h4>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Access Status</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: '900', color: selectedPatient.status === 'approved' ? '#10b981' : '#ef4444' }}>{selectedPatient.status.toUpperCase()}</span>
                           </div>
                           <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.5' }}>
                              User has full access to tele-health protocols and prescription management services.
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'medical' && (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                     <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
                     <h3 style={{ color: '#1e293b' }}>Clinical Intelligence Ready</h3>
                     <p style={{ color: '#64748b' }}>Blood Group: <span style={{ fontWeight: '900', color: '#ef4444' }}>{selectedPatient.bloodType || 'N/A'}</span></p>
                     <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '300px', margin: '0 auto' }}>Health records are encrypted and stored in the secure node.</p>
                  </div>
               )}

               {activeTab === 'financial' && (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                     <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                     <h3 style={{ color: '#1e293b' }}>Financial Ledger Sync</h3>
                     <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                        <div><div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>LIFETIME SPEND</div><div style={{ fontWeight: '900', fontSize: '1.5rem', color: '#1e293b' }}>$1,240</div></div>
                        <div><div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>PENDING</div><div style={{ fontWeight: '900', fontSize: '1.5rem', color: '#6366f1' }}>$0</div></div>
                     </div>
                  </div>
               )}

               {activeTab === 'activity' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {[1,2,3].map(i => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '14px' }}>
                           <div style={{ fontSize: '1.2rem' }}>🗓️</div>
                           <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>Appointment Sequence #{329 + i}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Consultation with Dr. Specialist • Successful</div>
                           </div>
                           <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>3 DAYS AGO</div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '2rem 2.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem' }}>
               <button onClick={() => setShowDetails(false)} style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '800', cursor: 'pointer' }}>CLOSE DATABASE VIEW</button>
               <button 
                  onClick={() => { handleStatusToggle(selectedPatient._id, selectedPatient.status); }} 
                  style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', border: 'none', background: selectedPatient.status === 'approved' ? '#fef2f2' : '#f0fdf4', color: selectedPatient.status === 'approved' ? '#ef4444' : '#10b981', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)' }}
               >
                  {selectedPatient.status === 'approved' ? 'TERMINATE ACCESS' : 'RESTORE ACCESS'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePatients;