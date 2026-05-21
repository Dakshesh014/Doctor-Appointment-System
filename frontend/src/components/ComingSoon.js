import React from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const ComingSoon = ({ title }) => {
  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      
      <div className="main-content">
        <PatientTopNav />
        
        <div className="coming-soon-page">
          <div className="coming-soon-content">
            <h1>Coming Soon 🚧</h1>
            <p>The {title} feature is under development.</p>
            <p style={{ marginTop: '1rem', fontSize: '1rem', color: '#8b92a7' }}>
              We're working hard to bring you this feature soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;