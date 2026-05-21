import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const ViewAppointments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filterStatus === 'all'
        ? 'http://localhost:5000/api/admin/appointments'
        : `http://localhost:5000/api/admin/appointments?status=${filterStatus}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchAppointments();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredAppts = appointments.filter(a => 
    a.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: '#fffbeb', color: '#b45309', border: '#f59e0b20' },
      confirmed: { bg: '#ecfdf5', color: '#059669', border: '#10b98120' },
      completed: { bg: '#eef2ff', color: '#4f46e5', border: '#6366f120' },
      rejected: { bg: '#fee2e2', color: '#ef4444', border: '#ef444420' },
      cancelled: { bg: '#f1f5f9', color: '#475569', border: '#94a3b820' }
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        <div className="dashboard-content" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>Appointment Scheduling</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Monitor portal-wide clinical sessions and status tracking</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => {
                  const token = localStorage.getItem('token');
                  window.open(`http://localhost:5000/api/admin/export/appointments?token=${token}`, '_blank');
                }}
                style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>📥</span> Export CSV
              </button>
              <button onClick={fetchAppointments} style={{ padding: '0.6rem 1.25rem', background: '#667eea', border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>🔄 Refresh</button>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Total Requests', val: appointments.length, icon: '📅', color: '#667eea' },
              { label: 'Pending Action', val: appointments.filter(a => a.status === 'pending').length, icon: '⌛', color: '#f59e0b' },
              { label: 'Scheduled Today', val: appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length, icon: '🏥', color: '#10b981' },
              { label: 'Completed', val: appointments.filter(a => a.status === 'completed').length, icon: '✅', color: '#6366f1' }
            ].map(s => (
              <div key={s.label} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem', width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a202c' }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Card */}
          <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid', borderColor: filterStatus === s ? '#667eea' : '#e2e8f0', background: filterStatus === s ? '#667eea' : 'white', color: filterStatus === s ? 'white' : '#718096', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Search patient or doctor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', width: '280px', fontSize: '0.9rem', outline: 'none' }} />
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>🔍</span>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>⏳ Synchronizing with clinical servers...</div>
            ) : filteredAppts.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Patient & Info</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Consultant</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Schedule</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppts.map((appt) => (
                    <tr key={appt._id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: '700', color: '#2d3748' }}>{appt.patient?.name || 'Unknown Patient'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#718096' }}>{appt.patient?.email}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ color: '#2d3748', fontWeight: '600', fontSize: '0.9rem' }}>Dr. {appt.doctor?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '700' }}>{appt.doctor?.specialization}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#2d3748', fontWeight: '700' }}>{new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>{appt.time}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                         <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: '700', color: '#475569' }}>
                           {appt.type === 'Video' ? '🎥 VIDEO' : '🏥 IN-PERSON'}
                         </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        {(() => {
                           const s = getStatusStyle(appt.status);
                           return <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '0.7rem', fontWeight: '800' }}>● {appt.status.toUpperCase()}</span>
                        })()}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <button onClick={() => { setSelectedAppt(appt); setShowModal(true); }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#667eea', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                 <h3>No appointments found</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Management Modal */}
      {showModal && selectedAppt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', width: '480px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
             <div style={{ background: '#667eea', padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Manage Appointment</h3>
               <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
             </div>
             
             <div style={{ padding: '2rem' }}>
               <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>👤</div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase' }}>Patient</div>
                      <div style={{ fontWeight: '700', color: '#2d3748' }}>{selectedAppt.patient?.name}</div>
                    </div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>⚕️</div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase' }}>Doctor</div>
                      <div style={{ fontWeight: '700', color: '#2d3748' }}>Dr. {selectedAppt.doctor?.name}</div>
                    </div>
                 </div>
               </div>

               <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1.5rem' }}>Adjust the status of this clinical session. Please note that confirmed appointments notify both parties.</p>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <button onClick={() => handleAction(selectedAppt._id, 'confirmed')} style={{ padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#ecfdf5', color: '#059669', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Set Confirmed</button>
                 <button onClick={() => handleAction(selectedAppt._id, 'completed')} style={{ padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#eef2ff', color: '#4f46e5', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Set Completed</button>
                 <button onClick={() => handleAction(selectedAppt._id, 'cancelled')} style={{ padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel Appt</button>
                 <button onClick={() => handleAction(selectedAppt._id, 'rejected')} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#718096', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Reject Req.</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAppointments;