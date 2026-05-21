import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const DoctorNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctorNotes();
  }, []);

  const fetchDoctorNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/medical-records', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Filter records that have notes
      const withNotes = data.filter(record => record.notes);
      setNotes(withNotes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctor notes:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const filteredNotes = searchTerm 
    ? notes.filter(note => 
        note.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.diagnosis && note.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : notes;

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Doctor's Notes</h1>
            <input
              type="text"
              placeholder="Search notes..."
              className="form-input"
              style={{ width: 'auto', maxWidth: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((record) => (
                <div key={record._id} className="section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
                    <div>
                      <h3 style={{ color: '#2c3544', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                        {formatDate(record.visitDate)}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ color: '#6c757d', fontSize: '0.95rem', margin: 0 }}>
                          <strong>Doctor:</strong> {record.doctorName}
                        </p>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '16px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: '#4a9eff20',
                          color: '#4a9eff'
                        }}>
                          Clinical Notes
                        </span>
                      </div>
                    </div>
                  </div>

                  {record.diagnosis && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
                      <strong style={{ color: '#2c3544', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🏥</span> Related Diagnosis
                      </strong>
                      <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {record.diagnosis}
                      </p>
                    </div>
                  )}

                  <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>📝</span>
                      <strong style={{ color: '#1e40af', fontSize: '1rem' }}>Doctor's Clinical Notes</strong>
                    </div>
                    <div style={{ 
                      color: '#1e3a8a', 
                      lineHeight: '1.8', 
                      fontSize: '0.95rem',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                      {record.notes}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {record.symptoms && (
                      <div style={{ padding: '0.75rem', background: '#fff7ed', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                        <strong style={{ color: '#92400e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                          Symptoms
                        </strong>
                        <p style={{ color: '#9a3412', fontSize: '0.8rem', margin: 0 }}>
                          {record.symptoms}
                        </p>
                      </div>
                    )}

                    {record.treatment && (
                      <div style={{ padding: '0.75rem', background: '#d1fae5', borderRadius: '6px', border: '1px solid #6ee7b7' }}>
                        <strong style={{ color: '#065f46', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                          Treatment
                        </strong>
                        <p style={{ color: '#047857', fontSize: '0.8rem', margin: 0 }}>
                          {record.treatment}
                        </p>
                      </div>
                    )}

                    {record.vitals && record.vitals.bloodPressure && (
                      <div style={{ padding: '0.75rem', background: '#fce7f3', borderRadius: '6px', border: '1px solid #fbcfe8' }}>
                        <strong style={{ color: '#9f1239', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                          Vitals
                        </strong>
                        <p style={{ color: '#be123c', fontSize: '0.8rem', margin: 0 }}>
                          BP: {record.vitals.bloodPressure}
                          {record.vitals.heartRate && `, HR: ${record.vitals.heartRate}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center',
                padding: '3rem',
                color: '#6c757d'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                <h2>No Doctor's Notes Found</h2>
                <p style={{ marginTop: '1rem' }}>
                  {searchTerm 
                    ? `No notes found matching "${searchTerm}"`
                    : "You don't have any doctor's notes yet."}
                </p>
                {searchTerm && (
                  <button 
                    className="form-button"
                    style={{ marginTop: '2rem', maxWidth: '200px' }}
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorNotes;