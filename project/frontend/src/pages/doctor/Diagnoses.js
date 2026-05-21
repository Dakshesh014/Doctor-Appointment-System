import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';
import './Diagnoses.css';

const Diagnoses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDiagnosesData();
  }, []);

  const fetchDiagnosesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Make parallel calls to endpoints that contain diagnosis history
      const [prescriptionsRes, visitsRes] = await Promise.all([
        fetch('http://localhost:5000/api/doctor/prescriptions', { headers }),
        fetch('http://localhost:5000/api/doctor/visits', { headers })
      ]);

      const prescriptions = prescriptionsRes.ok ? await prescriptionsRes.json() : [];
      const visits = visitsRes.ok ? await visitsRes.json() : [];

      // Normalize and combine the data
      const combinedData = [];

      prescriptions.forEach(p => {
        if (p.diagnosis) {
          combinedData.push({
            id: `p_${p._id}`,
            patient: p.patient,
            diagnosis: p.diagnosis,
            date: p.createdAt,
            notes: p.notes,
            source: 'Prescription',
            medications: p.medications
          });
        }
      });

      visits.forEach(v => {
        if (v.diagnosis) {
          combinedData.push({
            id: `v_${v._id}`,
            patient: v.patient,
            diagnosis: v.diagnosis,
            date: v.visitDate,
            notes: v.doctorNotes,
            source: 'Visit Record',
            treatment: v.treatment
          });
        }
      });

      // Sort by date descending
      combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setDiagnoses(combinedData);
    } catch (error) {
      console.error('Failed to fetch diagnoses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiagnoses = diagnoses.filter(d => 
    d.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.patient?.name && d.patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate unique diagnoses frequencies
  const diagnosisCounts = {};
  diagnoses.forEach(d => {
    const key = d.diagnosis.trim().toLowerCase();
    diagnosisCounts[key] = (diagnosisCounts[key] || 0) + 1;
  });
  const uniqueCount = Object.keys(diagnosisCounts).length;

  return (
    <div className="dashboard-layout">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <DoctorTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content diagnoses-container">
          <div className="premium-header">
            <h1 className="premium-title">🧬 Clinical Diagnoses Master Log</h1>
          </div>

          {!loading && (
            <div className="overview-grid">
              <div className="stat-card">
                <div className="stat-icon icon-blue">📋</div>
                <div className="stat-details">
                  <h3>{diagnoses.length}</h3>
                  <p>Total Recorded Diagnoses</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon icon-purple">🧬</div>
                <div className="stat-details">
                  <h3>{uniqueCount}</h3>
                  <p>Unique Conditions Identified</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon icon-green">📅</div>
                <div className="stat-details">
                  <h3>{new Set(diagnoses.map(d => d.patient?._id)).size}</h3>
                  <p>Patients Diagnosed</p>
                </div>
              </div>
            </div>
          )}

          <div className="filters-bar">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by diagnosis condition or patient name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="data-card">
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading diagnosis records...</div>
            ) : filteredDiagnoses.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>No diagnoses found.</div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Diagnosis Condition</th>
                    <th>Date Recorded</th>
                    <th>Source Document</th>
                    <th>Associated Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiagnoses.map(record => (
                    <tr key={record.id}>
                      <td>
                        <div className="patient-info">
                          <div className="patient-avatar">
                            {record.patient?.name ? record.patient.name.charAt(0) : '?'}
                          </div>
                          <div>
                            <div className="patient-name">{record.patient?.name || 'Unknown Patient'}</div>
                            <div className="patient-email">{record.patient?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="diagnosis-badge">{record.diagnosis}</span>
                      </td>
                      <td>
                        <div style={{ color: '#475569', fontWeight: '600' }}>
                          {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td>
                        <span className={`source-tag source-${record.source === 'Prescription' ? 'prescription' : 'visit'}`}>
                          {record.source}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {record.source === 'Prescription' 
                            ? `Rx: ${record.medications?.map(m => m.name).join(', ') || 'N/A'}`
                            : `Tx: ${record.treatment || 'N/A'}`
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnoses;
