import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';
import './TreatmentPlans.css';

const TreatmentPlans = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTreatmentPlans();
  }, []);

  const fetchTreatmentPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/treatment-plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch treatment plans');

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => 
    (plan.patient?.name && plan.patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (plan.diagnosis && plan.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (plan.treatment && plan.treatment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard-layout">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <DoctorTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content treatment-plans-container">
          <div className="premium-header">
            <h1 className="premium-title">🌿 Active Treatment Plans</h1>
          </div>

          {!loading && (
            <div className="overview-grid">
              <div className="stat-card">
                <div className="stat-icon icon-green">📝</div>
                <div className="stat-details">
                  <h3>{plans.length}</h3>
                  <p>Total Treatment Plans</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon icon-blue">👥</div>
                <div className="stat-details">
                  <h3>{new Set(plans.map(p => p.patient?._id)).size}</h3>
                  <p>Unique Patients</p>
                </div>
              </div>
            </div>
          )}

          <div className="tools-bar">
            <div className="search-wrapper">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by patient name, diagnosis, or treatment..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
              <h2>Loading treatment protocols...</h2>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '20px' }}>
              <h2>No Treatment Plans Found</h2>
              <p>Adjust your search criteria or add new treatment plans via the patient visits module.</p>
            </div>
          ) : (
            <div className="plans-grid">
              {filteredPlans.map(plan => (
                <div key={plan._id} className="plan-card">
                  <div className="plan-header">
                    <div className="patient-info">
                      <div className="patient-avatar">
                        {plan.patient?.name ? plan.patient.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="patient-name">{plan.patient?.name || 'Unknown'}</div>
                        <div className="patient-meta">
                          {plan.patient?.gender || 'N/A'} • {plan.patient?.bloodType || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="plan-date">
                      {new Date(plan.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="plan-body">
                    <span className="diagnosis-tag">🧬 {plan.diagnosis || 'No Diagnosis Listed'}</span>
                    
                    <div className="plan-section">
                      <span className="plan-label">Prescribed Treatment</span>
                      <div className="plan-content">
                        {plan.treatment}
                      </div>
                    </div>

                    {plan.doctorNotes && (
                      <div className="plan-section">
                        <span className="plan-label">Clinical Notes</span>
                        <div className="plan-content" style={{ borderLeftColor: '#cbd5e1', background: 'transparent', padding: '0', fontStyle: 'italic', color: '#64748b' }}>
                          "{plan.doctorNotes}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="plan-footer">
                    {plan.followUpDate ? (
                      <span className="follow-up-badge">
                        🗓️ Follow-up: {new Date(plan.followUpDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No follow-up scheduled</span>
                    )}
                    <Link to={`/doctor/patients/${plan.patient?._id}`} className="btn-view-patient">
                      Full Record →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TreatmentPlans;
