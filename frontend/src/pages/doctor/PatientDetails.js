import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';
import './PatientDetails.css';

const PatientDetails = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doctor/patients/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient data. Make sure you have treated this patient before.');
      }

      const data = await response.json();
      setPatientData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}><h2>Loading Patient File...</h2></div>;
  if (error) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}><h2>Access Denied</h2><p>{error}</p></div>;

  const { patient, recentVisits, recentPrescriptions } = patientData;

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const num = Math.floor((new Date() - new Date(dob)) / 31557600000);
    return isNaN(num) ? 'N/A' : num;
  };

  return (
    <div className="dashboard-layout">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <DoctorTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content patient-details-container">
          
          <div className="header-actions">
            <Link to="/doctor/patients" className="back-btn">←</Link>
            <h1 className="premium-title">Patient Overview</h1>
          </div>

          <div className="details-grid">
            
            {/* SIDEBAR TILE */}
            <div className="profile-card">
              <div className="profile-avatar">
                {patient.name.charAt(0)}
              </div>
              <h2 className="profile-name">{patient.name}</h2>
              <p className="profile-email">{patient.email}</p>

              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">📞 Phone</span>
                  <span className="info-value">{patient.phone || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🩸 Blood Type</span>
                  <span className="info-value" style={{ color: '#ef4444' }}>{patient.bloodType || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🎂 Age / Gender</span>
                  <span className="info-value">{calculateAge(patient.dateOfBirth)} / {patient.gender || 'N/A'}</span>
                </div>
              </div>

              {patient.allergies && (
                <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                  <span className="info-label" style={{ marginBottom: '0.5rem' }}>⚠️ Known Allergies</span>
                  <div className="tag-list">
                    {patient.allergies.split(',').map((allergy, i) => (
                      <span key={i} className="med-tag" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
                        {allergy.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="content-area">
              
              {/* VISIT HISTORY SECTION */}
              <div className="section-card">
                <div className="section-header">
                  <div className="section-icon icon-blue">🏥</div>
                  <h3 className="section-title">Clinical Visit History</h3>
                </div>
                
                {recentVisits.length === 0 ? (
                  <div className="empty-state">No past visits recorded for this patient.</div>
                ) : (
                  <div className="timeline">
                    {recentVisits.map(visit => {
                      const date = new Date(visit.visitDate);
                      return (
                        <div key={visit._id} className="timeline-item">
                          <div className="timeline-date">
                            <div className="timeline-date-day">{date.getDate()}</div>
                            <div className="timeline-date-month">{date.toLocaleString('en-US', { month: 'short', year: 'numeric'})}</div>
                          </div>
                          <div className="timeline-content">
                            <h4>{visit.diagnosis}</h4>
                            <p><strong>Chief Complaint:</strong> {visit.chiefComplaint}</p>
                            <p><strong>Treatment:</strong> {visit.treatment}</p>
                            {visit.doctorNotes && <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"{visit.doctorNotes}"</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PRESCRIPTIONS SECTION */}
              <div className="section-card">
                <div className="section-header">
                  <div className="section-icon icon-purple">💊</div>
                  <h3 className="section-title">Recent Prescriptions</h3>
                </div>

                {recentPrescriptions.length === 0 ? (
                  <div className="empty-state">No prescribed medications on record.</div>
                ) : (
                  <div className="timeline">
                    {recentPrescriptions.map(rx => {
                      const date = new Date(rx.createdAt);
                      return (
                        <div key={rx._id} className="timeline-item">
                          <div className="timeline-date">
                            <div className="timeline-date-day">{date.getDate()}</div>
                            <div className="timeline-date-month">{date.toLocaleString('en-US', { month: 'short', year: 'numeric'})}</div>
                          </div>
                          <div className="timeline-content" style={{ borderLeftColor: '#a855f7' }}>
                            <div style={{ position: 'absolute', left: '-19px', top: '15px', width: '12px', height: '12px', borderRadius: '50%', background: '#a855f7', border: '4px solid white'}} />
                            <h4>Rx for: {rx.diagnosis}</h4>
                            <div className="tag-list">
                              {rx.medications.map((med, i) => (
                                <span key={i} className="med-tag">
                                  {med.name} ({med.dosage} - {med.frequency})
                                </span>
                              ))}
                            </div>
                            {rx.notes && <p style={{ fontStyle: 'italic', marginTop: '0.75rem' }}>"{rx.notes}"</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
