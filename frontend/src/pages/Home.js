import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const Home = () => {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('patient');

  const patients = useCounter(12500, 2200, statsVisible);
  const doctors = useCounter(280, 2000, statsVisible);
  const appointments = useCounter(45000, 2400, statsVisible);
  const satisfaction = useCounter(98, 1800, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: '📅', title: 'Smart Scheduling', desc: 'AI-powered appointment booking with real-time slot availability and instant confirmations.', color: '#667eea', bg: '#f0f0ff' },
    { icon: '🎥', title: 'Video Consultations', desc: 'Connect with doctors face-to-face from your home. Secure, HD-quality calls.', color: '#10b981', bg: '#ecfdf5' },
    { icon: '💊', title: 'Digital Prescriptions', desc: 'Receive, store and download prescriptions digitally. Never lose a prescription again.', color: '#764ba2', bg: '#f5f0ff' },
    { icon: '🧪', title: 'Lab Results', desc: 'View lab test results online the moment they\'re ready. Track trends over time.', color: '#f59e0b', bg: '#fffbeb' },
    { icon: '🔒', title: 'HIPAA Compliant', desc: 'Your health data is encrypted and protected with the highest security standards.', color: '#3b82f6', bg: '#eff6ff' },
    { icon: '📊', title: 'Health Analytics', desc: 'Visualize your health history with charts, graphs, and actionable insights.', color: '#ef4444', bg: '#fff5f5' }
  ];

  const howItWorks = [
    { step: '01', title: 'Create Your Account', desc: 'Sign up in seconds as a patient or apply as a doctor.', icon: '👤' },
    { step: '02', title: 'Find Your Doctor', desc: 'Browse specialists and read profiles, ratings, and availability.', icon: '🔍' },
    { step: '03', title: 'Book Appointment', desc: 'Select a slot, choose in-person or video, confirm instantly.', icon: '📅' },
    { step: '04', title: 'Get Treated', desc: 'Attend your session and receive digital prescriptions & notes.', icon: '💊' }
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Patient', text: 'Booking appointments has never been easier. I got a consultation within 2 hours!', avatar: '👩' },
    { name: 'Dr. Rajesh Kumar', role: 'Cardiologist', text: 'Managing my patient records and schedule is completely streamlined. Saves me 2 hours daily.', avatar: '👨‍⚕️' },
    { name: 'Anita Patel', role: 'Patient', text: 'The video consultation feature is fantastic. No travel, no waiting rooms — pure convenience.', avatar: '👩‍💼' },
    { name: 'Dr. Sunita Verma', role: 'Dermatologist', text: 'The prescription module and lab record system helped me serve 40% more patients per day.', avatar: '👩‍⚕️' }
  ];

  const dashboardRoles = [
    { role: 'patient', label: '🩺 Patient', color: '#667eea', features: ['Book & track appointments', 'View prescriptions & lab results', 'Video consultations from home', 'Treatment plans & diagnoses', 'Billing & insurance', 'Secure messaging with doctors'] },
    { role: 'doctor', label: '👨‍⚕️ Doctor', color: '#10b981', features: ['Manage patient appointments', 'Write digital prescriptions', 'Record visit history', 'View lab results & billing', 'Video consultation sessions', 'Diagnoses & treatment plans'] },
    { role: 'admin', label: '👨‍💼 Admin', color: '#764ba2', features: ['Oversee all appointments', 'Manage doctors & patients', 'Billing & payments overview', 'Medical records control', 'System reports & analytics', 'Message center'] }
  ];

  return (
    <div style={{ background: '#f5f7fa', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflowX: 'hidden' }}>
      <Navbar />

      {/* ===== HERO ===== */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '68px', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecff 50%, #f0f0ff 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '2%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(118,75,162,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#667eea', fontWeight: '600' }}>
              <span>⚕️</span> India's Leading Healthcare Platform
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-1px', color: '#1a202c' }}>
              Healthcare That<br />
              <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Works For You</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.75', marginBottom: '2.5rem', maxWidth: '500px' }}>
              Connect with top doctors, book appointments in seconds, get prescriptions digitally, and manage your entire health journey — all in one place.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/register')} style={{ padding: '0.9rem 2.25rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(102,126,234,0.35)', transition: 'transform 0.2s' }}>
                Get Started Free →
              </button>
              <button onClick={() => navigate('/how-it-works')} style={{ padding: '0.9rem 2.25rem', background: 'white', color: '#555', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
                How It Works
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              {['🔐 HIPAA Compliant', '⭐ 4.9/5 Rated', '🚀 Free to Start'].map(badge => (
                <div key={badge} style={{ fontSize: '0.82rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{badge}</div>
              ))}
            </div>
          </div>

          {/* Hero Visual Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { icon: '📅', label: 'Book Appointment', value: 'In 2 mins', color: '#667eea', bg: '#f0f0ff' },
              { icon: '🎥', label: 'Video Consult', value: 'HD Quality', color: '#10b981', bg: '#ecfdf5' },
              { icon: '💊', label: 'Digital Rx', value: 'Instant', color: '#764ba2', bg: '#f5f0ff' },
              { icon: '🧪', label: 'Lab Results', value: 'Live Updates', color: '#f59e0b', bg: '#fffbeb' },
              { icon: '🏥', label: 'Visit History', value: 'Full Timeline', color: '#3b82f6', bg: '#eff6ff' },
              { icon: '📊', label: 'Health Stats', value: 'Analytics', color: '#ef4444', bg: '#fff5f5' }
            ].map((card, i) => (
              <div key={card.label} style={{ padding: '1.25rem', borderRadius: '16px', background: card.bg, border: `1px solid ${card.color}25`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transform: i % 2 === 1 ? 'translateY(12px)' : 'none', transition: 'transform 0.3s' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{card.icon}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem' }}>{card.label}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section ref={statsRef} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '2rem', textAlign: 'center' }}>
          {[
            { label: 'Happy Patients', value: patients.toLocaleString() + '+', icon: '👥' },
            { label: 'Expert Doctors', value: doctors + '+', icon: '👨‍⚕️' },
            { label: 'Appointments Done', value: appointments.toLocaleString() + '+', icon: '📅' },
            { label: 'Satisfaction Rate', value: satisfaction + '%', icon: '⭐' }
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white' }}>{stat.value}</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: '6rem 2rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: '800', marginBottom: '0.75rem', color: '#1a202c' }}>Everything You Need in One Platform</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '4rem', fontSize: '1.05rem' }}>Comprehensive tools for patients, doctors, and administrators</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: '1.5rem' }}>
            {features.map(f => (
              <div key={f.title} style={{ padding: '2rem', borderRadius: '16px', background: f.bg, border: `1px solid ${f.color}20`, transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'white', border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: '700', marginBottom: '0.6rem', fontSize: '1.05rem', color: '#1a202c' }}>{f.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.7', fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '6rem 2rem', background: '#f5f7fa' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: '800', marginBottom: '0.75rem', color: '#1a202c' }}>Get Started in 4 Simple Steps</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '4rem' }}>Your health journey starts with a single click</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: '2rem' }}>
            {howItWorks.map((step, i) => (
              <div key={step.step} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(102,126,234,0.3)' }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'rgba(102,126,234,0.15)', marginBottom: '0.5rem' }}>{step.step}</div>
                <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '1rem', color: '#1a202c' }}>{step.title}</h3>
                <p style={{ color: '#666', fontSize: '0.88rem', lineHeight: '1.6' }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/how-it-works" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem', borderBottom: '2px solid rgba(102,126,234,0.3)', paddingBottom: '2px' }}>
              See the complete guide →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ROLE TABS ===== */}
      <section style={{ padding: '6rem 2rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: '800', marginBottom: '0.75rem', color: '#1a202c' }}>Built For Everyone</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '3rem' }}>Dedicated dashboards and features for each role</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {dashboardRoles.map(r => (
              <button key={r.role} onClick={() => setActiveTab(r.role)} style={{ padding: '0.6rem 1.5rem', borderRadius: '25px', border: '2px solid', borderColor: activeTab === r.role ? r.color : '#e2e8f0', background: activeTab === r.role ? r.color : 'white', color: activeTab === r.role ? 'white' : '#555', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', fontSize: '0.9rem' }}>
                {r.label}
              </button>
            ))}
          </div>
          {dashboardRoles.filter(r => r.role === activeTab).map(r => (
            <div key={r.role} style={{ padding: '2.5rem', borderRadius: '20px', background: '#f5f7fa', border: `1px solid ${r.color}20`, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1rem' }}>
                {r.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'white', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', color: '#444' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{ padding: '6rem 2rem', background: '#f5f7fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: '800', marginBottom: '0.75rem', color: '#1a202c' }}>Loved By Patients & Doctors</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '4rem' }}>Real experiences from our community</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px,1fr))', gap: '1.5rem' }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ padding: '2rem', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: '0.1rem', marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: '0.9rem' }}>★</span>)}
                </div>
                <p style={{ color: '#555', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '0.92rem', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a202c' }}>{t.name}</div>
                    <div style={{ color: '#667eea', fontSize: '0.78rem' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: '900', marginBottom: '1rem', color: 'white' }}>Ready to Transform Your Healthcare Experience?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: '1.7' }}>
            Join 12,500+ patients and 280+ doctors already using HealthCareHub. Free to start, no credit card needed.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '1rem 2.5rem', background: 'white', color: '#667eea', border: 'none', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              Create Free Account
            </button>
            <button onClick={() => navigate('/doctors')} style={{ padding: '1rem 2.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer' }}>
              Browse Doctors
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#1a202c', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚕️</span>
                <span style={{ fontWeight: '800', color: 'white' }}>HealthCareHub</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', lineHeight: '1.7' }}>Making quality healthcare accessible to everyone, everywhere.</p>
            </div>
            {[
              { title: 'Platform', links: [{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }, { label: 'Our Doctors', path: '/doctors' }, { label: 'How It Works', path: '/how-it-works' }] },
              { title: 'Company', links: [{ label: 'About Us', path: '/about' }, { label: 'Contact', path: '/contact' }, { label: 'FAQ', path: '/faq' }] },
              { title: 'Account', links: [{ label: 'Login', path: '/login' }, { label: 'Register', path: '/register' }] }
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: '700', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{col.title}</h4>
                {col.links.map(link => (
                  <div key={link.label} style={{ marginBottom: '0.5rem' }}>
                    <Link to={link.path} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.87rem' }}>{link.label}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem' }}>
            © 2025 HealthCareHub. All rights reserved. Built with ❤️ for better healthcare.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;