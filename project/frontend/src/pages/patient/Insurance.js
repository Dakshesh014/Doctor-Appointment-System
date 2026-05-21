import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const Insurance = () => {
  const [insurance, setInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    planType: 'PPO',
    coverageStartDate: '',
    coverageEndDate: '',
    status: 'Active',
    primaryInsured: {
      name: '',
      relationship: 'Self'
    },
    copay: '',
    deductible: '',
    outOfPocketMax: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsurance();
  }, []);

  const fetchInsurance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/insurance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsurance(data);
        setFormData({
          provider: data.provider || '',
          policyNumber: data.policyNumber || '',
          groupNumber: data.groupNumber || '',
          planType: data.planType || 'PPO',
          coverageStartDate: data.coverageStartDate ? data.coverageStartDate.split('T')[0] : '',
          coverageEndDate: data.coverageEndDate ? data.coverageEndDate.split('T')[0] : '',
          status: data.status || 'Active',
          primaryInsured: {
            name: data.primaryInsured?.name || '',
            relationship: data.primaryInsured?.relationship || 'Self'
          },
          copay: data.copay || '',
          deductible: data.deductible || '',
          outOfPocketMax: data.outOfPocketMax || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insurance:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/insurance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Insurance information updated successfully!');
        setInsurance(data.insurance);
        setEditMode(false);
      } else {
        setError(data.message || 'Failed to update insurance');
      }
    } catch (error) {
      setError('Error updating insurance. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#00c9b7',
      'Inactive': '#6c757d',
      'Pending': '#fbbf24',
      'Expired': '#e74c3c'
    };
    return colors[status] || '#6c757d';
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Insurance Information</h1>
            <button 
              className="form-button"
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : insurance ? 'Edit Insurance' : 'Add Insurance'}
            </button>
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {!editMode && insurance ? (
            // View Mode
            <div>
              {/* Status Card */}
              <div className="section-card" style={{ marginBottom: '2rem', background: `${getStatusColor(insurance.status)}10`, border: `2px solid ${getStatusColor(insurance.status)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ color: '#2c3544', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      {insurance.provider}
                    </h2>
                    <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
                      Policy #{insurance.policyNumber}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '20px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    background: getStatusColor(insurance.status),
                    color: 'white'
                  }}>
                    {insurance.status}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Policy Details */}
                <div className="dashboard-card">
                  <h3 style={{ color: '#2c3544', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📋</span> Policy Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Policy Number:</strong>
                      <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>{insurance.policyNumber}</p>
                    </div>
                    {insurance.groupNumber && (
                      <div>
                        <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Group Number:</strong>
                        <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>{insurance.groupNumber}</p>
                      </div>
                    )}
                    <div>
                      <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Plan Type:</strong>
                      <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>{insurance.planType}</p>
                    </div>
                  </div>
                </div>

                {/* Coverage Period */}
                <div className="dashboard-card">
                  <h3 style={{ color: '#2c3544', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📅</span> Coverage Period
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Start Date:</strong>
                      <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>{formatDate(insurance.coverageStartDate)}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>End Date:</strong>
                      <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>{formatDate(insurance.coverageEndDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Primary Insured */}
                <div className="dashboard-card">
                  <h3 style={{ color: '#2c3544', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>👤</span> Primary Insured
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Name:</strong>
                      <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>{insurance.primaryInsured?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Relationship:</strong>
                      <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>{insurance.primaryInsured?.relationship || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Cost Details */}
                <div className="dashboard-card">
                  <h3 style={{ color: '#2c3544', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💰</span> Cost Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Copay:</strong>
                      <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>${insurance.copay || 0}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Deductible:</strong>
                      <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>${insurance.deductible || 0}</p>
                    </div>
                    {insurance.outOfPocketMax && (
                      <div>
                        <strong style={{ color: '#2c3544', fontSize: '0.9rem' }}>Out-of-Pocket Max:</strong>
                        <p style={{ color: '#6c757d', marginTop: '0.25rem' }}>${insurance.outOfPocketMax}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : !editMode && !insurance ? (
            // No Insurance
            <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛡️</div>
              <h2>No Insurance Information</h2>
              <p style={{ marginTop: '1rem', color: '#6c757d' }}>You haven't added your insurance information yet.</p>
              <button 
                className="form-button"
                style={{ marginTop: '2rem', maxWidth: '300px' }}
                onClick={() => setEditMode(true)}
              >
                Add Insurance Information
              </button>
            </div>
          ) : (
            // Edit Mode
            <div className="section-card">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Insurance Provider *</label>
                  <input
                    type="text"
                    name="provider"
                    className="form-input"
                    value={formData.provider}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Policy Number *</label>
                  <input
                    type="text"
                    name="policyNumber"
                    className="form-input"
                    value={formData.policyNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Group Number</label>
                  <input
                    type="text"
                    name="groupNumber"
                    className="form-input"
                    value={formData.groupNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Plan Type *</label>
                  <select
                    name="planType"
                    className="form-select"
                    value={formData.planType}
                    onChange={handleChange}
                    required
                  >
                    <option value="HMO">HMO (Health Maintenance Organization)</option>
                    <option value="PPO">PPO (Preferred Provider Organization)</option>
                    <option value="EPO">EPO (Exclusive Provider Organization)</option>
                    <option value="POS">POS (Point of Service)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Coverage Start Date *</label>
                  <input
                    type="date"
                    name="coverageStartDate"
                    className="form-input"
                    value={formData.coverageStartDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Coverage End Date</label>
                  <input
                    type="date"
                    name="coverageEndDate"
                    className="form-input"
                    value={formData.coverageEndDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Insured Name</label>
                  <input
                    type="text"
                    name="primaryInsured.name"
                    className="form-input"
                    value={formData.primaryInsured.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship to Primary Insured</label>
                  <select
                    name="primaryInsured.relationship"
                    className="form-select"
                    value={formData.primaryInsured.relationship}
                    onChange={handleChange}
                  >
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Copay ($)</label>
                  <input
                    type="number"
                    name="copay"
                    className="form-input"
                    value={formData.copay}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Annual Deductible ($)</label>
                  <input
                    type="number"
                    name="deductible"
                    className="form-input"
                    value={formData.deductible}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Out-of-Pocket Maximum ($)</label>
                  <input
                    type="number"
                    name="outOfPocketMax"
                    className="form-input"
                    value={formData.outOfPocketMax}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <button type="submit" className="form-button">
                  Save Insurance Information
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insurance;