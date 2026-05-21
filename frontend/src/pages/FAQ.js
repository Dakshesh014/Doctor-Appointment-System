import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const faqs = [
  {
    category: 'Patients',
    questions: [
      { q: 'How do I book an appointment?', a: 'You can book an appointment by creating a free account, searching for a doctor based on specialty or symptoms, and selecting an available time slot.' },
      { q: 'Is my medical data secure?', a: 'Yes. We use end-to-end encryption and comply with HIPAA standards to ensure your medical records and personal data are strictly confidential.' },
      { q: 'Can I cancel or reschedule my booking?', a: 'Absolutely. You can modify or cancel your booking from your Patient Dashboard up to 2 hours before the scheduled time.' },
      { q: 'How do I attend a video consultation?', a: 'At your appointment time, simply log in to your dashboard and click the "Join Call" button on your appointment card. No external apps are needed.' }
    ]
  },
  {
    category: 'Doctors',
    questions: [
      { q: 'How do I join HealthCareHub as a doctor?', a: 'Click the "Register" button and select "Doctor". Complete your profile and submit your credentials for verification. Once approved, you can start accepting patients.' },
      { q: 'What fees does the platform charge?', a: 'Creating a profile is completely free. We charge a small platform fee only on successful consultations. Detailed fee structures are provided during onboarding.' },
      { q: 'Can I provide my own digital signature for prescriptions?', a: 'Yes, you can upload your digital signature in your Doctor Dashboard settings. It will be automatically appended to all digital prescriptions you generate.' },
      { q: 'How do I get paid?', a: 'Payments are settled to your registered bank account weekly. You can track all earnings, invoices, and completed consultations in the Billing section of your dashboard.' }
    ]
  }
];

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('Patients');
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  const activeFaqs = faqs.find(f => f.category === activeCategory)?.questions || [];

  return (
    <div style={{ background: '#f5f7fa', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ padding: '120px 2rem 5rem', background: 'linear-gradient(135deg, #f5f7fa, #e8ecff)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: '#667eea', fontSize: '0.85rem', fontWeight: '600' }}>
          ❓ Help Center
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', marginBottom: '1.25rem', color: '#1a202c' }}>
          Frequently Asked <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Questions</span>
        </h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
          Find answers to the most common questions about HealthCareHub.
        </p>
      </section>

      {/* Main FAQ Content */}
      <section style={{ padding: '3rem 2rem 6rem', background: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Category Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
            {faqs.map((group) => (
              <button
                key={group.category}
                onClick={() => { setActiveCategory(group.category); setOpenIndex(null); }}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '12px',
                  border: activeCategory === group.category ? 'none' : '1px solid #e2e8f0',
                  background: activeCategory === group.category ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                  color: activeCategory === group.category ? 'white' : '#555',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: activeCategory === group.category ? '0 4px 12px rgba(102,126,234,0.3)' : 'none'
                }}
              >
                For {group.category}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    background: isOpen ? '#f8fafc' : 'white',
                    transition: 'all 0.3s'
                  }}
                >
                  <button 
                    onClick={() => toggleAccordion(idx)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '1.5rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: '700',
                      fontSize: '1.05rem',
                      color: isOpen ? '#667eea' : '#1a202c',
                    }}
                  >
                    {faq.q}
                    <span style={{ 
                      display: 'inline-block', 
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                      transition: 'transform 0.3s',
                      color: '#667eea',
                      fontSize: '1.2rem'
                    }}>
                      ▼
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.5rem', color: '#555', lineHeight: '1.7', fontSize: '0.95rem' }}>
                      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 1rem 0' }} />
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section style={{ padding: '5rem 2rem', background: '#f5f7fa', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem', color: '#1a202c' }}>
          Still have questions?
        </h2>
        <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
          Can't find the answer you're looking for? Reach out to our customer support.
        </p>
        <Link to="/contact" style={{ padding: '0.9rem 2.5rem', background: 'white', color: '#333', textDecoration: 'none', borderRadius: '12px', fontWeight: '700', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          Contact Support
        </Link>
      </section>

    </div>
  );
};

export default FAQ;
