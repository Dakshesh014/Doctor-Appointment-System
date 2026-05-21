import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AdminLabResults = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/lab-results', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLabResults(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lab results:', error);
      setLoading(false);
    }
  };

  const filteredResults = labResults.filter(r => 
    r.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.testType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'critical') return { bg: '#fee2e2', color: '#ef4444', icon: '⚠️' };
    if (s === 'abnormal') return { bg: '#fff7ed', color: '#f97316', icon: '🔍' };
    return { bg: '#f0fdf4', color: '#10b981', icon: '✅' };
  };

  return (
    <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        <div className="dashboard-content" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>Laboratory Diagnostics</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Centralized oversight of pathology, radiology and clinical lab reports</p>
            </div>
            <button onClick={fetchLabResults} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#4a5568' }}>🔄 Refresh</button>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Tests', val: labResults.length, icon: '🧪', color: '#667eea' },
              { label: 'Critical Readings', val: labResults.filter(r => r.status?.toLowerCase() === 'critical').length, icon: '🚨', color: '#ef4444' },
              { label: 'Pending Tests', val: labResults.filter(r => !r.results).length, icon: '⏳', color: '#f59e0b' },
              { label: 'This Month', val: labResults.filter(r => new Date(r.testDate).getMonth() === new Date().getMonth()).length, icon: '📊', color: '#3b82f6' }
            ].map(s => (
              <div key={s.label} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{s.icon}</div>
                 <div>
                    <div style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>{s.label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1a202c' }}>{s.val}</div>
                 </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
             <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Search by test name, patient or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }} />
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>🔍</span>
              </div>
          </div>

          {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>⏳ Accessing diagnostic database...</div>
          ) : filteredResults.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
               {filteredResults.map(result => (
                 <div key={result._id} style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.5rem', transition: '0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'} onClick={() => { setSelectedResult(result); setShowModal(true); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                       <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#667eea', background: '#667eea10', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>{result.testType}</span>
                       <span style={{ fontSize: '0.75rem', color: '#a0aec0', fontWeight: '600' }}>{new Date(result.testDate).toLocaleDateString()}</span>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                       <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1a202c' }}>{result.testName}</h3>
                       <div style={{ color: '#718096', fontSize: '0.85rem', marginTop: '0.25rem' }}>Patient: {result.patient?.name}</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', marginBottom: '1.25rem' }}>
                       <div style={{ color: '#a0aec0', fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Result Status</div>
                       {(() => {
                         const s = getStatusStyle(result.status);
                         return <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: s.color, fontWeight: '800', fontSize: '0.9rem' }}>{s.icon} {result.status?.toUpperCase()}</div>
                       })()}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>By Dr. {result.doctor?.name}</div>
                       <button style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>View Details →</button>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
             <div style={{ padding: '5rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧪</div>
               <h3>No lab results match your search</h3>
            </div>
          )}
        </div>
      </div>

      {/* Lab Result Details Modal */}
      {showModal && selectedResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', width: '550px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
             <div style={{ background: getStatusStyle(selectedResult.status).color, padding: '2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Lab Report Review</h2>
                   <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>Performed on {new Date(selectedResult.testDate).toLocaleDateString()}</div>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
             </div>

             <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                   <div>
                      <div style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Subject</div>
                      <div style={{ fontWeight: '800', color: '#2d3748' }}>{selectedResult.patient?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>{selectedResult.patient?.email}</div>
                   </div>
                   <div>
                      <div style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Requested By</div>
                      <div style={{ fontWeight: '800', color: '#2d3748' }}>Dr. {selectedResult.doctor?.name}</div>
                   </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                   <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Diagnostic Values</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a202c' }}>{selectedResult.results}</div>
                   </div>
                   {selectedResult.notes && (
                     <div>
                        <div style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clinical Observations</div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568', lineHeight: '1.6' }}>{selectedResult.notes}</p>
                     </div>
                   )}
                </div>

                <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '800', cursor: 'pointer' }}>Close Report</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLabResults;