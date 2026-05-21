import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getFilteredAppointments = () => {
    switch (filter) {
      case 'pending':
        return appointments.filter(apt => apt.status === 'Pending');
      case 'confirmed':
        return appointments.filter(apt => apt.status === 'Confirmed');
      case 'completed':
        return appointments.filter(apt => apt.status === 'Completed');
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'Cancelled');
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  const statusCount = (status) => appointments.filter(apt => apt.status === status).length;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirmed': return 'status-approved';
      case 'Pending': return 'status-pending';
      case 'Completed': return 'status-approved'; // Or specific completed class
      case 'Cancelled': return 'status-rejected';
      default: return 'status-rejected';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar />
        <div className="main-content">
          <AdminTopNav />
          <div className="dashboard-content">
            <h1 className="page-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div className="main-content">
        <AdminTopNav />

        <div className="dashboard-content">
          <h1 className="page-title">Appointments Management</h1>

          {/* Statistics Cards */}
          <div className="stats-grid-5">
            <div
              className={`stat-card-clickable ${filter === 'all' ? 'stat-card-active bg-gradient-primary' : 'stat-card-inactive'}`}
              onClick={() => setFilter('all')}
            >
              <div className="stat-label">All</div>
              <div className="stat-number">{appointments.length}</div>
            </div>

            <div
              className={`stat-card-clickable ${filter === 'pending' ? 'stat-card-active bg-gradient-warning' : 'stat-card-inactive'}`}
              onClick={() => setFilter('pending')}
            >
              <div className="stat-label">Pending</div>
              <div className="stat-number">{statusCount('Pending')}</div>
            </div>

            <div
              className={`stat-card-clickable ${filter === 'confirmed' ? 'stat-card-active bg-gradient-info' : 'stat-card-inactive'}`}
              onClick={() => setFilter('confirmed')}
            >
              <div className="stat-label">Confirmed</div>
              <div className="stat-number">{statusCount('Confirmed')}</div>
            </div>

            <div
              className={`stat-card-clickable ${filter === 'completed' ? 'stat-card-active bg-gradient-success' : 'stat-card-inactive'}`}
              onClick={() => setFilter('completed')}
            >
              <div className="stat-label">Completed</div>
              <div className="stat-number">{statusCount('Completed')}</div>
            </div>

            <div
              className={`stat-card-clickable ${filter === 'cancelled' ? 'stat-card-active bg-gradient-danger' : 'stat-card-inactive'}`}
              onClick={() => setFilter('cancelled')}
            >
              <div className="stat-label">Cancelled</div>
              <div className="stat-number">{statusCount('Cancelled')}</div>
            </div>
          </div>

          <div className="section-card">
            {filteredAppointments.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((apt) => (
                      <tr key={apt._id} className="table-row-hover">
                        <td>
                          <div style={{ fontWeight: '600' }}>{formatDate(apt.date)}</div>
                          <div className="text-muted text-small">{formatTime(apt.date)}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{apt.patientId?.name || 'Unknown'}</div>
                          <div className="text-muted text-small">{apt.patientId?.email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{apt.doctorName}</div>
                        </td>
                        <td>{apt.department}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              background: apt.type === 'In Person' ? '#dbeafe' : '#fef3c7',
                              color: apt.type === 'In Person' ? '#1e40af' : '#92400e'
                            }}
                          >
                            {apt.type}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-action btn-view">
                              View
                            </button>
                            {apt.status === 'Pending' && (
                              <button className="btn-action btn-approve">
                                Confirm
                              </button>
                            )}
                            <button className="btn-action btn-delete">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-text">
                  No appointments found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;