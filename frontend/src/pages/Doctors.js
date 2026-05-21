import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const doctorsList = [
  { id: 1, name: 'Dr. Rajesh Kumar', specialty: 'Cardiologist', rating: 4.9, reviews: 124, exp: '15 Yrs', color: '#ef4444', avatar: '👨‍⚕️' },
  { id: 2, name: 'Dr. Sunita Verma', specialty: 'Dermatologist', rating: 4.8, reviews: 98, exp: '12 Yrs', color: '#10b981', avatar: '👩‍⚕️' },
  { id: 3, name: 'Dr. Anil Sharma', specialty: 'General Physician', rating: 4.7, reviews: 312, exp: '20 Yrs', color: '#3b82f6', avatar: '👨‍⚕️' },
  { id: 4, name: 'Dr. Priya Patel', specialty: 'Pediatrician', rating: 4.9, reviews: 205, exp: '10 Yrs', color: '#f59e0b', avatar: '👩‍⚕️' },
  { id: 5, name: 'Dr. Vikram Singh', specialty: 'Orthopedist', rating: 4.6, reviews: 156, exp: '18 Yrs', color: '#6366f1', avatar: '👨‍⚕️' },
  { id: 6, name: 'Dr. Neha Gupta', specialty: 'Gynecologist', rating: 4.9, reviews: 280, exp: '14 Yrs', color: '#ec4899', avatar: '👩‍⚕️' },
  { id: 7, name: 'Dr. Amit Desai', specialty: 'Neurologist', rating: 4.8, reviews: 89, exp: '16 Yrs', color: '#8b5cf6', avatar: '👨‍⚕️' },
  { id: 8, name: 'Dr. Kavita Reddy', specialty: 'Psychiatrist', rating: 5.0, reviews: 110, exp: '9 Yrs', color: '#14b8a6', avatar: '👩‍⚕️' }
];

const specialties = ['All', 'Cardiologist', 'Dermatologist', 'General Physician', 'Pediatrician', 'Orthopedist', 'Gynecologist', 'Neurologist', 'Psychiatrist'];

const Doctors = () => {
  const [filter, setFilter] = useState('All');
  
  const filteredDoctors = filter === 'All' ? doctorsList : doctorsList.filter(d => d.specialty === filter);

  return (
    <div style={{ background: '#f5f7fa', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ padding: '120px 2rem 4rem', background: 'linear-gradient(135deg, #f5f7fa, #e8ecff)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: '#667eea', fontSize: '0.85rem', fontWeight: '600' }}>
          🩺 Meet Our Experts
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', marginBottom: '1.25rem', color: '#1a202c' }}>
          Top Doctors <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>At Your Service</span>
        </h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
          Book an appointment with India's most trusted healthcare professionals. In-person visits or HD video consultations.
        </p>
      </section>

      {/* Filter Section */}
      <section style={{ padding: '2rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {specialties.map(spec => (
            <button 
              key={spec}
              onClick={() => setFilter(spec)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '25px',
                border: filter === spec ? 'none' : '1px solid #e2e8f0',
                background: filter === spec ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                color: filter === spec ? 'white' : '#555',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: filter === spec ? '0 4px 12px rgba(102,126,234,0.25)' : 'none'
              }}
            >
              {spec}
            </button>
          ))}
        </div>
      </section>

      {/* Doctors Grid */}
      <section style={{ padding: '4rem 2rem 6rem', background: '#f5f7fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredDoctors.map(doctor => (
              <div key={doctor.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div style={{ height: '100px', background: `linear-gradient(135deg, ${doctor.color}20, ${doctor.color}40)`, position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: '-35px', left: '20px', width: '70px', height: '70px', borderRadius: '50%', background: 'white', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {doctor.avatar}
                  </div>
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', color: doctor.color }}>
                    {doctor.exp} Exp
                  </div>
                </div>
                
                <div style={{ padding: '3.5rem 1.5rem 1.5rem' }}>
                  <h3 style={{ fontWeight: '800', fontSize: '1.15rem', color: '#1a202c', marginBottom: '0.2rem' }}>{doctor.name}</h3>
                  <div style={{ color: doctor.color, fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{doctor.specialty}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    <span style={{ color: '#fbbf24', fontSize: '1rem' }}>★</span>
                    <span style={{ fontWeight: '700', color: '#333', fontSize: '0.9rem' }}>{doctor.rating}</span>
                    <span style={{ color: '#888', fontSize: '0.8rem' }}>({doctor.reviews} reviews)</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/register" style={{ flex: 1, padding: '0.6rem 0', background: 'white', color: '#667eea', border: '1px solid #667eea', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                      Profile
                    </Link>
                    <Link to="/login" style={{ flex: 1, padding: '0.6rem 0', background: '#667eea', color: 'white', border: '1px solid #667eea', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                      Book 
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredDoctors.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😞</div>
                <h3 style={{ fontSize: '1.2rem', color: '#1a202c', marginBottom: '0.5rem' }}>No doctors found</h3>
                <p style={{ color: '#666' }}>We currently don't have experts in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #10b981, #059669)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>Are you a Doctor?</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', fontSize: '1.05rem' }}>Join our network and reach thousands of patients daily.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" style={{ padding: '0.9rem 2.5rem', background: 'white', color: '#059669', textDecoration: 'none', borderRadius: '12px', fontWeight: '800', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>Apply Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Doctors;
