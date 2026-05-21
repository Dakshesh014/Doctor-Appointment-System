import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AdminPayments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Reusing the billing endpoint but filtering for 'Payment' type or successful status
      const response = await fetch('http://localhost:5000/api/admin/billing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Focus only on actual payments for this page
        setPayments(data.filter(item => item.type === 'Payment' || item.status === 'Paid'));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        <div className="dashboard-content" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>Transaction Ledger</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Comprehensive record of all successful incoming and outgoing clinical payments</p>
            </div>
            <button onClick={fetchPayments} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#4a5568' }}>🔄 Refresh Ledger</button>
          </div>

          {/* Ledger Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
             <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '1.75rem', borderRadius: '24px', color: 'white', boxShadow: '0 10px 20px rgba(102,126,234,0.15)' }}>
                <div style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Processed</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</div>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '8px' }}>+12% from last month</div>
             </div>
             <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#a0aec0', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Success Rate</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c' }}>98.4%</div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', marginTop: '1.25rem', overflow: 'hidden' }}>
                   <div style={{ width: '98.4%', height: '100%', background: '#10b981' }}></div>
                </div>
             </div>
             <div style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#a0aec0', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Daily Volume</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c' }}>$4,210.00</div>
                <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '700', marginTop: '0.5rem' }}>↑ 4.2% daily avg</div>
             </div>
          </div>

          <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
             <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1a202c' }}>Recent Settlements</h3>
                <div style={{ position: 'relative' }}>
                  <input type="text" placeholder="Search by patient or reference..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', width: '280px', fontSize: '0.9rem', outline: 'none' }} />
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>🔍</span>
                </div>
             </div>

             {loading ? (
               <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>⏳ Auditing settlement records...</div>
             ) : filteredPayments.length > 0 ? (
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Reference</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Patient Details</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Description</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Method</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                           <div style={{ fontWeight: '800', color: '#2d3748', fontSize: '0.85rem' }}>#{p._id.slice(-8).toUpperCase()}</div>
                           <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{new Date(p.date || p.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                           <div style={{ fontWeight: '700', color: '#4a5568', fontSize: '0.9rem' }}>{p.patientId?.name || 'External User'}</div>
                           <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{p.patientId?.email}</div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                           {p.description}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                           <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6366f1' }}>💳 CARD (Stripe)</span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '900', color: '#10b981' }}>
                           +${p.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                           <span style={{ padding: '0.3rem 0.7rem', borderRadius: '8px', background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', fontWeight: '800' }}>SETTLED</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             ) : (
               <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                  <h3>No successful payments recorded yet</h3>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;