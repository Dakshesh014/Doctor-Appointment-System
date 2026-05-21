import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const team = [
  { name: 'Dr. Anil Sharma', role: 'Chief Medical Officer', avatar: '👨‍⚕️', bio: 'Former HOD of Medicine at AIIMS with 20+ years of clinical excellence.' },
  { name: 'Priya Kapoor', role: 'Head of Product', avatar: '👩‍💼', bio: 'Led digital health transformation at 3 major hospital chains across India.' },
  { name: 'Vikram Nair', role: 'Lead Engineer', avatar: '👨‍💻', bio: 'Full-stack expert specializing in HIPAA-compliant healthcare systems.' },
  { name: 'Dr. Sunita Rao', role: 'Patient Experience Lead', avatar: '👩‍⚕️', bio: 'Bridging patient care and technology with 15 years of clinical insights.' }
];

const milestones = [
  { year: '2022', title: 'Platform Founded', desc: 'HealthCareHub launched with 10 doctors and 50 patients.', color: '#667eea' },
  { year: '2023', title: 'Video Consultations', desc: 'Introduced HD video consultations — 500+ sessions in month 1.', color: '#10b981' },
  { year: '2024', title: 'Digital Prescriptions', desc: 'Launched digital PDF prescriptions with custom letterhead support.', color: '#764ba2' },
  { year: '2025', title: 'Full Platform', desc: '12,500+ patients, 280+ doctors, and growing every day.', color: '#f59e0b' }
];

const About = () => (
  <div style={{ background: '#f5f7fa', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh' }}>
    <Navbar />

    {/* Hero */}
    <section style={{ padding: '120px 2rem 5rem', background: 'linear-gradient(135deg, #f5f7fa, #e8ecff)', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: '#667eea', fontSize: '0.85rem', fontWeight: '600' }}>
        ℹ️ About Us
      </div>
      <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', marginBottom: '1.25rem', color: '#1a202c' }}>
        Our Mission: <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Better Healthcare for All</span>
      </h1>
      <p style={{ color: '#666', maxWidth: '620px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
        HealthCareHub was built with a single vision — make quality healthcare as easy to access as sending a message.
      </p>
    </section>

    {/* Mission / Vision / Values */}
    <section style={{ padding: '5rem 2rem', background: '#ffffff' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '1.5rem' }}>
        {[
          { icon: '🎯', title: 'Our Mission', color: '#667eea', bg: '#f0f0ff', desc: 'To eliminate barriers in healthcare by connecting patients and doctors through smart, accessible technology — enabling faster, better, and more affordable care.' },
          { icon: '🔭', title: 'Our Vision', color: '#10b981', bg: '#ecfdf5', desc: 'A world where every person, regardless of location or background, has instant access to the best possible medical expertise at their fingertips.' },
          { icon: '💎', title: 'Our Values', color: '#764ba2', bg: '#f5f0ff', desc: 'Patient privacy first. Clinical accuracy. Transparent billing. Continuous improvement. Building with empathy for both patients and healthcare providers.' }
        ].map(card => (
          <div key={card.title} style={{ padding: '2rem', borderRadius: '16px', background: card.bg, border: `1px solid ${card.color}20`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{card.icon}</div>
            <h3 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.75rem', color: card.color }}>{card.title}</h3>
            <p style={{ color: '#555', lineHeight: '1.75', fontSize: '0.9rem' }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Tech Stack */}
    <section style={{ padding: '5rem 2rem', background: '#f5f7fa' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontWeight: '800', fontSize: '2rem', marginBottom: '1rem', color: '#1a202c' }}>🛠️ Built With Modern Technology</h2>
        <p style={{ color: '#888', marginBottom: '3rem' }}>Our MERN stack architecture ensures scalability, security, and speed</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1rem' }}>
          {[
            { tech: 'MongoDB', icon: '🍃', role: 'Database', desc: 'NoSQL for flexible medical data storage', color: '#10b981', bg: '#ecfdf5' },
            { tech: 'Express.js', icon: '⚡', role: 'Backend API', desc: 'Fast, minimal REST API framework', color: '#d97706', bg: '#fffbeb' },
            { tech: 'React.js', icon: '⚛️', role: 'Frontend', desc: 'Dynamic, reactive user interfaces', color: '#667eea', bg: '#f0f0ff' },
            { tech: 'Node.js', icon: '💚', role: 'Runtime', desc: 'High-performance server environment', color: '#059669', bg: '#ecfdf5' }
          ].map(t => (
            <div key={t.tech} style={{ padding: '1.75rem', borderRadius: '16px', background: t.bg, border: `1px solid ${t.color}20`, textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{t.icon}</div>
              <h3 style={{ fontWeight: '800', color: t.color, marginBottom: '0.25rem', fontSize: '1rem' }}>{t.tech}</h3>
              <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.role}</div>
              <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: '1.5' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section style={{ padding: '5rem 2rem', background: '#ffffff' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        <h2 style={{ fontWeight: '800', fontSize: '2rem', marginBottom: '3rem', textAlign: 'center', color: '#1a202c' }}>📅 Our Journey</h2>
        <div style={{ position: 'relative', paddingLeft: '80px' }}>
          <div style={{ position: 'absolute', left: '40px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, #667eea, #764ba2)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {milestones.map(m => (
              <div key={m.year} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-46px', top: '14px', width: '18px', height: '18px', borderRadius: '50%', background: m.color, border: '3px solid #f5f7fa', zIndex: 1, boxShadow: `0 0 0 3px ${m.color}30` }} />
                <div style={{ padding: '1.25rem 1.5rem', background: '#f5f7fa', borderRadius: '12px', border: `1px solid ${m.color}20` }}>
                  <div style={{ fontWeight: '800', color: m.color, fontSize: '0.82rem', marginBottom: '0.35rem' }}>{m.year}</div>
                  <div style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.4rem' }}>{m.title}</div>
                  <div style={{ color: '#666', fontSize: '0.88rem', lineHeight: '1.6' }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Team */}
    <section style={{ padding: '5rem 2rem', background: '#f5f7fa' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontWeight: '800', fontSize: '2rem', marginBottom: '1rem', color: '#1a202c' }}>👥 The Team Behind HealthCareHub</h2>
        <p style={{ color: '#888', marginBottom: '3rem' }}>Driven by passion, guided by purpose</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1.5rem' }}>
          {team.map(member => (
            <div key={member.name} style={{ padding: '2rem 1.5rem', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(102,126,234,0.12)' }}>
                {member.avatar}
              </div>
              <h3 style={{ fontWeight: '800', fontSize: '0.98rem', marginBottom: '0.3rem', color: '#1a202c' }}>{member.name}</h3>
              <div style={{ color: '#667eea', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.75rem' }}>{member.role}</div>
              <p style={{ color: '#888', fontSize: '0.82rem', lineHeight: '1.65' }}>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>Join the HealthCareHub Community</h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Register as a patient or apply as a doctor today</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/register" style={{ padding: '0.9rem 2rem', background: 'white', color: '#667eea', textDecoration: 'none', borderRadius: '10px', fontWeight: '800' }}>Get Started →</Link>
        <Link to="/contact" style={{ padding: '0.9rem 2rem', background: 'rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', border: '2px solid rgba(255,255,255,0.35)' }}>Contact Us</Link>
      </div>
    </section>
  </div>
);

export default About;