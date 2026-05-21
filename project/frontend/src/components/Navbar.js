import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const isLoggedIn = localStorage.getItem('token');
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const getDashboardLink = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'patient') return '/patient/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'superadmin') return '/superadmin/dashboard';
    return '/';
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/doctors', label: 'Our Doctors' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/faq', label: 'FAQ' }
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: scrolled ? '#ffffff' : 'rgba(255,255,255,0.97)',
      borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid #e2e8f0',
      boxShadow: scrolled ? '0 2px 12px rgba(102,126,234,0.1)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚕️</div>
          <span style={{ color: '#1a202c', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
            Health<span style={{ color: '#667eea' }}>Care</span>Hub
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', flexWrap: 'wrap' }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              color: isActive(link.path) ? '#667eea' : '#555',
              textDecoration: 'none', padding: '0.45rem 0.85rem', borderRadius: '7px',
              fontSize: '0.9rem', fontWeight: isActive(link.path) ? '700' : '500',
              background: isActive(link.path) ? 'rgba(102,126,234,0.1)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!isLoggedIn ? (
            <>
              <Link to="/login" style={{ color: '#555', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #e2e8f0', transition: 'all 0.2s', background: 'white' }}>
                Login
              </Link>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 4px 12px rgba(102,126,234,0.3)', transition: 'all 0.2s' }}>
                Get Started
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to={getDashboardLink()} style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} style={{ color: '#555', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
