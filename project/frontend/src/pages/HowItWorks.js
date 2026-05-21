import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const patientSteps = [
  { step: 1, title: 'Sign Up', desc: 'Create a free account using your email or phone number. Basic details take just 1 minute.', icon: '👤', img: '📱' },
  { step: 2, title: 'Find a Specialist', desc: 'Browse or search doctors by name, specialty, or condition. View their ratings and schedule.', icon: '🔍', img: '👨‍⚕️' },
  { step: 3, title: 'Book an Appointment', desc: 'Select an available slot. Choose between a clinic visit or a secure video consultation.', icon: '📅', img: '🗓️' },
  { step: 4, title: 'Get Care & Prescriptions', desc: 'Attend your consultation. Get instant access to digital prescriptions and lab test recommendations.', icon: '💊', img: '📄' }
];

const doctorSteps = [
  { step: 1, title: 'Apply & Get Verified', desc: 'Submit your medical license and credentials. Our team verifies your profile within 24 hours.', icon: '📝', img: '✅' },
  { step: 2, title: 'Set Your Schedule', desc: 'Log in to your dashboard to set your availability, fees, and consultation modes.', icon: '⏱️', img: '🕒' },
  { step: 3, title: 'See Patients', desc: 'Receive bookings. Conduct High-Def video calls or manage in-person walk-ins easily.', icon: '🎥', img: '👥' },
  { step: 4, title: 'Manage Records', desc: 'Write electronic prescriptions, view patient health history, and track your daily earnings.', icon: '📊', img: '💻' }
];

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('patient');

  const steps = activeTab === 'patient' ? patientSteps : doctorSteps;

  return (
    <div style={{ background: '#f5f7fa', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ padding: '120px 2rem 5rem', background: 'linear-gradient(135deg, #f5f7fa, #e8ecff)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: '#667eea', fontSize: '0.85rem', fontWeight: '600' }}>
          💡 Simple & Easy
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', marginBottom: '1.25rem', color: '#1a202c' }}>
          How HealthCareHub <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Works</span>
        </h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
          We've streamlined the entire healthcare process so you can focus on what matters most — getting better or providing care.
        </p>

        {/* Tab Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button 
            onClick={() => setActiveTab('patient')}
            style={{ 
              padding: '0.8rem 2.5rem', borderRadius: '30px', 
              background: activeTab === 'patient' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white', 
              color: activeTab === 'patient' ? 'white' : '#555', 
              border: activeTab === 'patient' ? 'none' : '1px solid #e2e8f0', 
              fontWeight: '800', cursor: 'pointer', fontSize: '1rem',
              boxShadow: activeTab === 'patient' ? '0 4px 14px rgba(102,126,234,0.3)' : 'none',
              transition: 'all 0.3s'
            }}
          >
            For Patients
          </button>
          <button 
            onClick={() => setActiveTab('doctor')}
            style={{ 
              padding: '0.8rem 2.5rem', borderRadius: '30px', 
              background: activeTab === 'doctor' ? 'linear-gradient(135deg, #10b981, #059669)' : 'white', 
              color: activeTab === 'doctor' ? 'white' : '#555', 
              border: activeTab === 'doctor' ? 'none' : '1px solid #e2e8f0', 
              fontWeight: '800', cursor: 'pointer', fontSize: '1rem',
              boxShadow: activeTab === 'doctor' ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
              transition: 'all 0.3s'
            }}
          >
            For Doctors
          </button>
        </div>
      </section>

      {/* Steps List */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ position: 'relative' }}>
            
            {/* Connecting Line */}
            <div style={{ position: 'absolute', left: '32px', top: '20px', bottom: '20px', width: '2px', background: activeTab === 'patient' ? '#667eea30' : '#10b98130', zIndex: 1, display: 'none', '@media (minWidth: 768px)': { display: 'block' } }} />

            {steps.map((step, i) => (
              <div key={step.step} style={{ display: 'flex', gap: '2.5rem', marginBottom: i === steps.length - 1 ? 0 : '4rem', position: 'relative', zIndex: 2, alignItems: 'center' }}>
                {/* Step Circle */}
                <div style={{ 
                  flexShrink: 0, width: '64px', height: '64px', borderRadius: '50%', 
                  background: activeTab === 'patient' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '1.5rem', color: 'white', fontWeight: '900',
                  boxShadow: `0 4px 12px ${activeTab === 'patient' ? 'rgba(102,126,234,0.3)' : 'rgba(16,185,129,0.3)'}`
                }}>
                  {step.icon}
                </div>
                
                {/* Step Content */}
                <div style={{ flexGrow: 1, background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: activeTab === 'patient' ? '#667eea' : '#10b981', fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Step {step.step}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a202c', marginBottom: '0.75rem' }}>{step.title}</h3>
                  <p style={{ color: '#555', lineHeight: '1.7', fontSize: '1rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 2rem', background: '#1a202c', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '1rem', color: 'white' }}>
          Ready to get started?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '3rem', fontSize: '1.1rem' }}>
          Join the community today and experience a new era of digital healthcare.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', textDecoration: 'none', borderRadius: '12px', fontWeight: '800', boxShadow: '0 4px 14px rgba(102,126,234,0.2)' }}>
             Create An Account →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default HowItWorks;
