import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const services = [
  { icon: '👨‍⚕️', title: 'Specialist Consultations', desc: 'Connect with top-rated specialists across 30+ medical fields for accurate diagnosis and treatment.', color: '#667eea', bg: '#f0f0ff' },
  { icon: '🎥', title: 'Video Telemedicine', desc: 'Secure, high-definition video calls for remote consultations from the comfort of your home.', color: '#10b981', bg: '#ecfdf5' },
  { icon: '💊', title: 'E-Prescriptions', desc: 'Receive digital prescriptions instantly after your visit. Easy to download and share with pharmacies.', color: '#764ba2', bg: '#f5f0ff' },
  { icon: '🧪', title: 'Lab Tests At Home', desc: 'Book diagnostic tests online and get samples collected right from your doorstep.', color: '#f59e0b', bg: '#fffbeb' },
  { icon: '🏥', title: 'Clinical Procedures', desc: 'Schedule minor clinical procedures with our network of trusted partner clinics and hospitals.', color: '#3b82f6', bg: '#eff6ff' },
  { icon: '🧘‍♀️', title: 'Mental Wellness', desc: 'Therapy and counseling sessions with certified psychologists and psychiatrists.', color: '#ef4444', bg: '#fff5f5' }
];

const Services = () => {
  return (
    <div style={{ background: '#f5f7fa', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ padding: '120px 2rem 5rem', background: 'linear-gradient(135deg, #f5f7fa, #e8ecff)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: '#667eea', fontSize: '0.85rem', fontWeight: '600' }}>
          ✨ Our Services
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', marginBottom: '1.25rem', color: '#1a202c' }}>
          Comprehensive Healthcare <br/>
          <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tailored For You</span>
        </h1>
        <p style={{ color: '#666', maxWidth: '620px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
          From online consultations to in-clinic procedures, HealthCareHub provides end-to-end medical services to keep you and your family healthy.
        </p>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '5rem 2rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {services.map((s, index) => (
              <div key={index} style={{ padding: '2.5rem', borderRadius: '20px', background: s.bg, border: `1px solid ${s.color}20`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'white', border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.75rem', color: '#1a202c' }}>{s.title}</h3>
                <p style={{ color: '#555', lineHeight: '1.7', fontSize: '0.95rem', flexGrow: 1 }}>{s.desc}</p>
                <div style={{ marginTop: '1.5rem' }}>
                  <Link to="/doctors" style={{ color: s.color, fontWeight: '700', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    View Doctors <span style={{ fontSize: '1.1rem' }}>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How To Book Section */}
      <section style={{ padding: '6rem 2rem', background: '#f5f7fa' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1a202c' }}>Need Immediate Care?</h2>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '3rem' }}>Booking an appointment is quick and completely online.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', flex: '1', minWidth: '250px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>1️⃣</div>
              <h4 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' }}>Search Doctor</h4>
              <p style={{ color: '#777', fontSize: '0.9rem' }}>Find a specialist based on symptoms or specialty.</p>
            </div>
            <div style={{ padding: '1.5rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', flex: '1', minWidth: '250px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>2️⃣</div>
              <h4 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' }}>Pick a Slot</h4>
              <p style={{ color: '#777', fontSize: '0.9rem' }}>Choose an available date and time that suits you.</p>
            </div>
            <div style={{ padding: '1.5rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', flex: '1', minWidth: '250px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3️⃣</div>
              <h4 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' }}>Consult</h4>
              <p style={{ color: '#777', fontSize: '0.9rem' }}>Attend via video call or visit the clinic in-person.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>Experience Better Healthcare Today</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Book your first appointment and see the difference.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ padding: '1rem 2.5rem', background: 'white', color: '#667eea', textDecoration: 'none', borderRadius: '12px', fontWeight: '800', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>Book Appointment →</Link>
          <Link to="/contact" style={{ padding: '1rem 2.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', borderRadius: '12px', fontWeight: '600', border: '2px solid rgba(255,255,255,0.3)' }}>Contact Support</Link>
        </div>
      </section>

    </div>
  );
};

export default Services;
