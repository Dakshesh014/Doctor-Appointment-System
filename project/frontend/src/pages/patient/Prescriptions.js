import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/prescriptions', {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isActive = (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) >= new Date();
  };

  const downloadPDF = async (prescriptionId, doctorName, date) => {
    const element = document.getElementById(`prescription-${prescriptionId}`);
    if (!element) return;

    try {
      // Hide action buttons during capture
      const actionsDiv = element.querySelector('.prescription-actions');
      if (actionsDiv) actionsDiv.style.display = 'none';

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Prescription_${doctorName.replace(/\s+/g, '_')}_${new Date(date).toISOString().split('T')[0]}.pdf`);

      // Restore action buttons
      if (actionsDiv) actionsDiv.style.display = 'flex';
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = (prescriptionId) => {
    const element = document.getElementById(`prescription-${prescriptionId}`);
    if (!element) return;
    
    // Hide action buttons during print
    const actionsDiv = element.querySelector('.prescription-actions');
    if (actionsDiv) actionsDiv.style.display = 'none';

    const printContents = element.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
      <div style="padding: 2rem;">
        <h2 style="text-align: center; margin-bottom: 2rem;">Medical Prescription</h2>
        ${printContents}
      </div>
    `;

    window.print();

    // Restore original contents and state
    document.body.innerHTML = originalContents;
    window.location.reload(); // Quick way to restore React bindings after innerHTML swap
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
          <h1 className="page-title">💊 My Prescriptions</h1>

          <div className="section-card">
            {prescriptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription._id}
                    id={`prescription-${prescription._id}`}
                    style={{
                      padding: '2rem',
                      border: `2px solid ${isActive(prescription.validUntil) ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      background: isActive(prescription.validUntil) ? '#f0fdf4' : 'white'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #00c9b7 0%, #00a896 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.5rem'
                        }}>
                          {prescription.doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                            Dr. {prescription.doctor?.name}
                          </h3>
                          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                            {prescription.doctor?.specialization || 'General Physician'}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                            📅 Prescribed on {formatDate(prescription.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: isActive(prescription.validUntil) ? '#d1fae5' : '#fee2e2',
                          color: isActive(prescription.validUntil) ? '#065f46' : '#991b1b'
                        }}>
                          {isActive(prescription.validUntil) ? '✓ Active' : '✗ Expired'}
                        </span>
                        {prescription.validUntil && (
                          <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem', textAlign: 'center' }}>
                            Valid until {formatDate(prescription.validUntil)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                        Diagnosis
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                        {prescription.diagnosis}
                      </div>
                    </div>

                    {/* Medications */}
                    <div style={{
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '8px',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: '#2c3544' }}>
                        💊 Medications ({prescription.medications?.length || 0})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {prescription.medications?.map((med, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '1rem',
                              background: '#f9fafb',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.5rem', color: '#2c3544' }}>
                              {index + 1}. {med.name}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.9rem' }}>
                              <div>
                                <span style={{ color: '#6c757d' }}>Dosage: </span>
                                <span style={{ fontWeight: '600' }}>{med.dosage}</span>
                              </div>
                              <div>
                                <span style={{ color: '#6c757d' }}>Frequency: </span>
                                <span style={{ fontWeight: '600' }}>{med.frequency}</span>
                              </div>
                              <div>
                                <span style={{ color: '#6c757d' }}>Duration: </span>
                                <span style={{ fontWeight: '600' }}>{med.duration}</span>
                              </div>
                            </div>
                            {med.instructions && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6c757d' }}>
                                <strong>Instructions:</strong> {med.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {prescription.notes && (
                      <div style={{
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#2c3544' }}>
                          Additional Notes
                        </div>
                        <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                          {prescription.notes}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="prescription-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => downloadPDF(prescription._id, prescription.doctor?.name, prescription.createdAt)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: '#4a9eff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        📄 Download PDF
                      </button>
                      <button 
                        onClick={() => handlePrint(prescription._id)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        🖨️ Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>💊</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>No Prescriptions</h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                  You don't have any prescriptions yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;