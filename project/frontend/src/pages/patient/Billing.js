import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const Billing = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/billing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBillings(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching billing:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalOutstanding = billings
    .filter(b => b.status === 'pending')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalPaid = billings
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const handlePayNow = (bill) => {
    setSelectedBill(bill);
    setPaymentMethod('credit_card');
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!selectedBill) return;
    setProcessingPayment(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/patient/billing/${selectedBill._id}/pay`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentMethod })
      });

      if (response.ok) {
        alert('🎉 Payment successful!');
        setShowPaymentModal(false);
        setSelectedBill(null);
        fetchBilling(); // Refresh bills
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Error processing payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar />
        <div className="main-content">
          <PatientTopNav />
          <div className="dashboard-content">
            <h1 className="page-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <PatientSidebar />

      <div className="main-content">
        <PatientTopNav />

        <div className="dashboard-content">
          <h1 className="page-title">💰 Billing & Payments</h1>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                Outstanding Balance
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                ${totalOutstanding.toFixed(2)}
              </div>
            </div>

            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                Total Paid
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                ${totalPaid.toFixed(2)}
              </div>
            </div>

            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                Total Bills
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                {billings.length}
              </div>
            </div>
          </div>

          {/* Billing Table */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Billing History</h2>
            </div>

            {billings.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', fontWeight: '600' }}>Bill ID</th>
                      <th style={{ padding: '1rem', fontWeight: '600' }}>Description</th>
                      <th style={{ padding: '1rem', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '1rem', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '1rem', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billings.map((bill) => (
                      <tr key={bill._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: '600' }}>
                          #{bill._id.slice(-6).toUpperCase()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {bill.description || 'Medical Services'}
                        </td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>
                          {formatDate(bill.createdAt)}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '700', fontSize: '1.1rem' }}>
                          ${bill.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: bill.status === 'paid' ? '#d1fae5' : '#fee2e2',
                            color: bill.status === 'paid' ? '#065f46' : '#991b1b'
                          }}>
                            {bill.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{
                              padding: '0.5rem 0.75rem',
                              background: '#4a9eff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}>
                              View
                            </button>
                            {bill.status === 'pending' && (
                              <button 
                                onClick={() => handlePayNow(bill)}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}>
                                Pay Now
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>💳</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>No Billing Records</h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                  You don't have any billing records yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedBill && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title" style={{ textAlign: 'center' }}>Complete Payment</h2>
              <p className="modal-subtitle" style={{ textAlign: 'center' }}>
                You are paying for Bill #{selectedBill._id.slice(-6).toUpperCase()}
              </p>
            </div>
            
            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>Amount Due</div>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a' }}>
                  ${selectedBill.amount.toFixed(2)}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#334155' }}>
                  Select Payment Method
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {['credit_card', 'debit_card', 'upi', 'net_banking'].map(method => (
                    <label key={method} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                      padding: '1rem', borderRadius: '8px', border: paymentMethod === method ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      background: paymentMethod === method ? '#eff6ff' : 'white',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                      />
                      <span style={{ fontWeight: '500', color: '#1e293b', textTransform: 'capitalize' }}>
                        {method.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button 
                onClick={() => setShowPaymentModal(false)}
                disabled={processingPayment}
                className="btn-modal-cancel"
                style={{ flex: 1, padding: '1rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={submitPayment}
                disabled={processingPayment}
                className="btn-modal-confirm"
                style={{ flex: 2, padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                {processingPayment ? 'Processing...' : `Pay $${selectedBill.amount.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;