import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const contactInfo = [
  { icon: '📍', title: 'Our Office', lines: ['HealthCareHub Pvt. Ltd.', '4th Floor, Tech Park, Sector 21', 'Gurugram, Haryana 122016, India'], color: '#667eea', bg: '#f0f0ff' },
  { icon: '📞', title: 'Phone', lines: ['+91 98765 43210', '+91 11 4567 8900', 'Mon – Sat, 9 AM – 7 PM IST'], color: '#10b981', bg: '#ecfdf5' },
  { icon: '✉️', title: 'Email', lines: ['support@healthcarehub.in', 'doctors@healthcarehub.in', 'admin@healthcarehub.in'], color: '#764ba2', bg: '#f5f0ff' },
  { icon: '⏰', title: 'Support Hours', lines: ['Monday – Friday: 9 AM – 8 PM', 'Saturday: 10 AM – 5 PM', 'Emergency: 24/7 via portal'], color: '#f59e0b', bg: '#fffbeb' }
];

const topics = ['General Inquiry', 'Technical Support', 'Account & Billing', 'Book a Demo', 'Doctor Registration', 'Partnership', 'Report an Issue', 'Other'];

const miniFaqs = [
  { q: 'How quickly will you respond?', a: 'We typically respond within 2 business hours for support tickets and within 24 hours for general inquiries.' },
  { q: 'Can I call for urgent issues?', a: 'Yes! For urgent technical issues, call our support line. For medical emergencies, please contact local emergency services.' },
  { q: 'How do I report a bug?', a: 'Use the contact form and select "Report an Issue". Please include screenshots or steps to reproduce the issue.' }
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', topic: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.topic) e.topic = 'Please select a topic';
    if (!formData.message.trim()) e.message = 'Message is required';
    else if (formData.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    return e;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', topic: '', subject: '', message: '' });
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '0.85rem 1.1rem',
    background: 'white', border: `1px solid ${errors[field] ? '#ef4444' : '#e2e8f0'}`,
    borderRadius: '10px', color: '#333', fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  });

  return (
    <div style={{ background: '#f5f7fa', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '120px 2rem 4rem', background: 'linear-gradient(135deg, #f5f7fa, #e8ecff)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: '#667eea', fontSize: '0.85rem', fontWeight: '600' }}>
          💬 Contact Us
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', marginBottom: '1.25rem', color: '#1a202c' }}>
          We're Here to <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Help You</span>
        </h1>
        <p style={{ color: '#666', maxWidth: '520px', margin: '0 auto 2rem', lineHeight: '1.75', fontSize: '1.05rem' }}>
          Have a question, feedback, or need support? Our team responds within 2 hours on business days.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[{ icon: '⚡', label: '2hr Response Time' }, { icon: '🌐', label: 'Online 6 Days/Week' }, { icon: '📞', label: '24/7 Emergency Line' }].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#555', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              {b.icon} {b.label}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Info Cards */}
      <section style={{ padding: '3rem 2rem 0', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: '1.25rem' }}>
          {contactInfo.map(info => (
            <div key={info.title} style={{ padding: '1.75rem', borderRadius: '14px', background: info.bg, border: `1px solid ${info.color}20`, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', border: `1px solid ${info.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '0.85rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>{info.icon}</div>
              <h3 style={{ fontWeight: '800', fontSize: '0.95rem', color: info.color, margin: '0 0 0.6rem 0' }}>{info.title}</h3>
              {info.lines.map((line, i) => (
                <div key={i} style={{ fontSize: '0.83rem', color: i === 0 ? '#333' : '#888', fontWeight: i === 0 ? '600' : '400', marginBottom: '0.2rem' }}>{line}</div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Main: Form + Sidebar */}
      <section style={{ padding: '3rem 2rem 5rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

          {/* Contact Form */}
          <div style={{ padding: '2.5rem', borderRadius: '20px', background: '#f5f7fa', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontWeight: '800', fontSize: '1.35rem', marginBottom: '0.5rem', color: '#1a202c' }}>Send Us a Message</h2>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>Fill in the form below and we'll get back to you promptly.</p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white', borderRadius: '16px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontWeight: '800', fontSize: '1.4rem', marginBottom: '0.75rem', color: '#10b981' }}>Message Sent!</h3>
                <p style={{ color: '#555', marginBottom: '2rem', lineHeight: '1.7' }}>
                  Thank you! We've received your message and will respond to <strong style={{ color: '#667eea' }}>{formData.email || 'your email'}</strong> within 2 business hours.
                </p>
                <button onClick={() => setSubmitted(false)} style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#444', marginBottom: '0.4rem' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" name="name" placeholder="e.g. Priya Sharma" value={formData.name} onChange={handleChange} style={inputStyle('name')} />
                    {errors.name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>⚠ {errors.name}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#444', marginBottom: '0.4rem' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} style={inputStyle('email')} />
                    {errors.email && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>⚠ {errors.email}</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#444', marginBottom: '0.4rem' }}>Phone <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label>
                    <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} style={inputStyle('phone')} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#444', marginBottom: '0.4rem' }}>Topic <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="topic" value={formData.topic} onChange={handleChange} style={{ ...inputStyle('topic'), cursor: 'pointer' }}>
                      <option value="">Select a topic…</option>
                      {topics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.topic && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>⚠ {errors.topic}</div>}
                  </div>
                </div>

                <div style={{ marginBottom: '1.1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#444', marginBottom: '0.4rem' }}>Subject <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" name="subject" placeholder="Brief subject line…" value={formData.subject} onChange={handleChange} style={inputStyle('subject')} />
                </div>

                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', color: '#444', marginBottom: '0.4rem' }}>
                    <span>Message <span style={{ color: '#ef4444' }}>*</span></span>
                    <span style={{ color: formData.message.length >= 20 ? '#10b981' : '#bbb', fontWeight: '500' }}>{formData.message.length}/1000</span>
                  </label>
                  <textarea name="message" placeholder="Describe your question or issue in detail…" value={formData.message} onChange={handleChange} maxLength={1000} rows={6} style={{ ...inputStyle('message'), resize: 'vertical', minHeight: '140px', lineHeight: '1.6' }} />
                  {errors.message && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>⚠ {errors.message}</div>}
                </div>

                <button type="submit" disabled={submitting} style={{ width: '100%', padding: '0.95rem', borderRadius: '12px', background: submitting ? '#a9b8f5' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 6px 18px rgba(102,126,234,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                  {submitting ? (<><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Sending…</>) : '✉️ Send Message'}
                </button>
                <p style={{ textAlign: 'center', color: '#bbb', fontSize: '0.75rem', marginTop: '1rem' }}>🔒 Your information is encrypted and never shared.</p>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Links */}
            <div style={{ padding: '1.75rem', borderRadius: '16px', background: '#f5f7fa', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontWeight: '800', marginBottom: '1.1rem', fontSize: '0.98rem', color: '#1a202c' }}>🔗 Quick Links</h3>
              {[{ label: 'Browse Doctors', path: '/doctors', icon: '👨‍⚕️' }, { label: 'View Services', path: '/services', icon: '⚕️' }, { label: 'How It Works', path: '/how-it-works', icon: '📖' }, { label: 'FAQ', path: '/faq', icon: '❓' }, { label: 'Create Account', path: '/register', icon: '🚀' }, { label: 'Login', path: '/login', icon: '🔑' }].map(link => (
                <Link key={link.path} to={link.path} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0', borderBottom: '1px solid #e2e8f0', color: '#555', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' }}>
                  <span>{link.icon}</span> <span>{link.label}</span> <span style={{ marginLeft: 'auto', color: '#ccc' }}>›</span>
                </Link>
              ))}
            </div>

            {/* Social */}
            <div style={{ padding: '1.75rem', borderRadius: '16px', background: 'linear-gradient(135deg, #f0f0ff, #f5f0ff)', border: '1px solid rgba(102,126,234,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '0.98rem', color: '#1a202c' }}>📱 Connect With Us</h3>
              <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '1.1rem' }}>Follow for health tips and platform updates</p>
              {[{ platform: 'Twitter / X', handle: '@HealthCareHub', icon: '🐦', color: '#1da1f2' }, { platform: 'LinkedIn', handle: 'HealthCareHub India', icon: '💼', color: '#0077b5' }, { platform: 'Instagram', handle: '@healthcarehub.in', icon: '📸', color: '#e1306c' }].map(s => (
                <div key={s.platform} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(102,126,234,0.1)' }}>
                  <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
                  <div><div style={{ fontSize: '0.74rem', color: '#999' }}>{s.platform}</div><div style={{ fontSize: '0.83rem', fontWeight: '700', color: s.color }}>{s.handle}</div></div>
                </div>
              ))}
            </div>

            {/* Mini FAQ */}
            <div style={{ padding: '1.75rem', borderRadius: '16px', background: '#f5f7fa', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontWeight: '800', marginBottom: '1.1rem', fontSize: '0.98rem', color: '#1a202c' }}>❓ Common Questions</h3>
              {miniFaqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', color: '#333', cursor: 'pointer', padding: '0.7rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.83rem', fontWeight: '600', lineHeight: '1.4' }}>{faq.q}</span>
                    <span style={{ fontSize: '0.8rem', color: '#667eea', transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
                  </button>
                  {openFaq === i && <div style={{ padding: '0 0 0.75rem', color: '#666', fontSize: '0.82rem', lineHeight: '1.65' }}>{faq.a}</div>}
                </div>
              ))}
              <div style={{ marginTop: '1rem' }}>
                <Link to="/faq" style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>View all FAQs →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map CTA */}
      <section style={{ padding: '0 2rem 5rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ borderRadius: '16px', background: '#f5f7fa', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h3 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.1rem', color: '#1a202c' }}>Find Us at Our Office</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>4th Floor, Tech Park, Sector 21, Gurugram, Haryana 122016</p>
            <a href="https://maps.google.com/?q=Sector+21,Gurugram,Haryana" target="_blank" rel="noreferrer" style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', display: 'inline-block', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              📍 Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus, textarea:focus, select:focus { border-color: #667eea !important; box-shadow: 0 0 0 3px rgba(102,126,234,0.12) !important; outline: none; }`}</style>
    </div>
  );
};

export default Contact;