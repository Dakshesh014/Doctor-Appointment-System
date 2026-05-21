import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/reports/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports summary:', error);
      setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
          <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="main-content">
            <AdminTopNav toggleSidebar={toggleSidebar} />
            <div style={{ padding: '5rem', textAlign: 'center', color: '#a0aec0' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
               <h3>Compiling system-wide analytics...</h3>
            </div>
          </div>
        </div>
     );
  }

  return (
    <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        <div className="dashboard-content" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>System Analytics & Reports</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Comprehensive performance metrics across clinical and financial domains</p>
            </div>
            <button onClick={fetchSummary} style={{ padding: '0.6rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#4a5568' }}>🔄 Regenerate Data</button>
          </div>

          {/* Top Level Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
             {[
               { l: 'Total Revenue', v: `$${(summary?.totalRevenue || 0).toLocaleString()}`, i: '💰', c: '#10b981' },
               { l: 'Registered Patients', v: summary?.totalPatients || 0, i: '👥', c: '#667eea' },
               { l: 'Total Appointments', v: summary?.totalAppointments || 0, i: '📅', c: '#3b82f6' },
               { l: 'Clinical Records', v: summary?.totalMedicalRecords || 0, i: '📁', c: '#6366f1' }
             ].map(s => (
               <div key={s.l} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                     <div style={{ fontSize: '1.5rem', width: '45px', height: '45px', borderRadius: '14px', background: `${s.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.i}</div>
                     <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '800' }}>+4.5% ↑</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase' }}>{s.l}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a202c' }}>{s.v}</div>
               </div>
             ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
             {/* Growth Trends (Simple CSS Bar Chart) */}
             <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#1a202c' }}>Monthly Appointment Trends</h3>
                 <div style={{ height: '300px', marginTop: '1rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={summary?.monthlyAppointments || []}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} 
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#667eea" 
                          radius={[6, 6, 0, 0]} 
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
             </div>

             {/* Activity Feed */}
             <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#1a202c' }}>Recent System Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                   {(summary?.recentActivity || []).length > 0 ? summary.recentActivity.map((log, idx) => (
                     <div key={idx} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid #f1f5f9', paddingLeft: '1rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '8px', height: '8px', borderRadius: '50%', background: '#667eea' }}></div>
                        <div>
                           <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2d3748' }}>{log.action}</div>
                           <div style={{ fontSize: '0.75rem', color: '#718096' }}>{new Date(log.timestamp).toLocaleString()}</div>
                        </div>
                     </div>
                   )) : (
                     <div style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0', fontSize: '0.9rem' }}>No recent activity logs available.</div>
                   )}
                </div>
             </div>
          </div>

          {/* Department Performance */}
          <div style={{ marginTop: '2.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem' }}>
             <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#1a202c' }}>Clinical Records Breakdown</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {[
                  { label: 'Lab Results', count: summary?.totalLabRecords || 0, color: '#3b82f6' },
                  { label: 'Medical Prescriptions', count: summary?.totalPrescriptions || 0, color: '#10b981' },
                  { label: 'Diagnostic Charts', count: summary?.totalMedicalRecords || 0, color: '#6366f1' }
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                       <span style={{ fontWeight: '700', color: '#4a5568' }}>{item.label}</span>
                       <span style={{ fontWeight: '800', color: '#1a202c' }}>{item.count}</span>
                    </div>
                    <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                       <div style={{ width: `${(item.count / (summary?.totalMedicalRecords || 1) * 100)}%`, height: '100%', background: item.color, borderRadius: '5px' }}></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reports;