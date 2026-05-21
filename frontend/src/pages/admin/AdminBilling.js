import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AdminBilling = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/billing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBilling(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching billing records:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/billing/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchBilling();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredBills = billing.filter(b => {
    const matchesStatus = filterStatus === 'all' || (b.status || '').toLowerCase() === filterStatus.toLowerCase();
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = 
      (b.patientId?.name || '').toLowerCase().includes(searchLow) ||
      (b.description || '').toLowerCase().includes(searchLow);
    return matchesStatus && matchesSearch;
  });

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return { bg: '#ecfdf5', color: '#059669', border: '#10b98120' };
    if (s === 'overdue') return { bg: '#fee2e2', color: '#ef4444', border: '#ef444420' };
    return { bg: '#fffbeb', color: '#b45309', border: '#f59e0b20' };
  };

  const totalRevenue = billing.filter(b => b.status?.toLowerCase() === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0);
  const pendingRevenue = billing.filter(b => b.status?.toLowerCase() === 'pending').reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        <div className="dashboard-content" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>Financial Oversight</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Manage system-wide invoicing, revenue tracking and collections</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => {
                const token = localStorage.getItem('token');
                window.open(`http://localhost:5000/api/admin/export/billing?token=${token}`, '_blank');
              }} style={{ padding: '0.6rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#4a5568' }}>📥 Export CSV</button>
              <button onClick={fetchBilling} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#4a5568' }}>🔄 Sync Accounts</button>
            </div>
          </div>

          {/* Stats Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Collections', val: `$${totalRevenue.toLocaleString()}`, icon: '💰', color: '#10b981' },
              { label: 'Unpaid Receivables', val: `$${pendingRevenue.toLocaleString()}`, icon: '⏳', color: '#f59e0b' },
              { label: 'Total Invoices', val: billing.length, icon: '📄', color: '#6366f1' },
              { label: 'Overdue Count', val: billing.filter(b => b.status?.toLowerCase() === 'overdue').length, icon: '🚨', color: '#ef4444' }
            ].map(s => (
              <div key={s.label} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{s.icon}</div>
                 <div>
                    <div style={{ color: '#a0aec0', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>{s.label}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a202c' }}>{s.val}</div>
                 </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['all', 'pending', 'paid', 'overdue'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid', borderColor: filterStatus === s ? '#667eea' : '#e2e8f0', background: filterStatus === s ? '#667eea' : 'white', color: filterStatus === s ? 'white' : '#718096', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
               </div>
               <div style={{ position: 'relative' }}>
                  <input type="text" placeholder="Search invoices or patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', width: '300px', fontSize: '0.9rem', outline: 'none' }} />
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>🔍</span>
               </div>
            </div>

            {loading ? (
              <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>⏳ Generating financial ledgers...</div>
            ) : filteredBills.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Invoice No & Date</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Patient Name</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Category/Type</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill._id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                         <div style={{ fontWeight: '800', color: '#2d3748', fontSize: '0.9rem' }}>INV-{bill._id.slice(-6).toUpperCase()}</div>
                         <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{new Date(bill.date).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: '700', color: '#4a5568' }}>{bill.patientId?.name || 'Manual Entry'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{bill.patientId?.email}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#475569', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {bill.description}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: bill.type === 'Payment' ? '#10b981' : '#6366f1', background: bill.type === 'Payment' ? '#ecfdf5' : '#eef2ff', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>{bill.type.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '800', color: '#1a202c' }}>
                        ${bill.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                         {(() => {
                           const s = getStatusStyle(bill.status);
                           return <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '0.7rem', fontWeight: '800' }}>● {bill.status?.toUpperCase() || 'PENDING'}</span>
                         })()}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                         <button onClick={() => { setSelectedBill(bill); setShowModal(true); }} style={{ height: '32px', padding: '0 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#667eea', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>Action</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧾</div>
                 <h3>No billing records found</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill Action Modal */}
      {showModal && selectedBill && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', width: '450px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
             <div style={{ background: '#667eea', padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Invoice Reconciliation</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
             </div>
             
             <div style={{ padding: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                       <span style={{ color: '#a0aec0', fontSize: '0.75rem', fontWeight: '800' }}>CURRENT STATUS</span>
                       <span style={{ color: getStatusStyle(selectedBill.status).color, fontWeight: '800', fontSize: '0.85rem' }}>{selectedBill.status?.toUpperCase() || 'PENDING'}</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a202c' }}>${selectedBill.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' }}>Ref: INV-{selectedBill._id.toUpperCase()}</div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1.5rem' }}>Manual override for payment verification or status adjustment.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <button onClick={() => handleStatusUpdate(selectedBill._id, 'Paid')} style={{ padding: '0.9rem', borderRadius: '12px', border: 'none', background: '#ecfdf5', color: '#059669', fontWeight: '800', cursor: 'pointer' }}>Mark as Paid</button>
                   <button onClick={() => handleStatusUpdate(selectedBill._id, 'Overdue')} style={{ padding: '0.9rem', borderRadius: '12px', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: '800', cursor: 'pointer' }}>Set Overdue</button>
                   <button onClick={() => handleStatusUpdate(selectedBill._id, 'Pending')} style={{ padding: '0.9rem', borderRadius: '12px', border: 'none', background: '#fffbeb', color: '#b45309', fontWeight: '800', cursor: 'pointer' }}>Set Pending</button>
                   <button onClick={() => setShowModal(false)} style={{ padding: '0.9rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#718096', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBilling;