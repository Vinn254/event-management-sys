import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isOrganizer } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const allNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
  ];

  if (user) {
    if (isOrganizer) {
      allNavLinks.push({ path: '/organizer', label: 'Organizer' });
      allNavLinks.push({ path: '/analytics', label: 'Analytics' });
    }
    allNavLinks.push({ path: '/profile', label: 'Profile' });
    allNavLinks.push({ path: '/tickets', label: 'My Tickets' });
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          EventHub
        </Link>

        {/* Mobile Menu Toggle - Always visible */}
        <button
          className="navbar-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Right Side - Desktop Menu Dropdown */}
        <div className="navbar-user" style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Menu</span>
            <span style={{ fontSize: '0.8rem' }}>▼</span>
          </button>
          
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              minWidth: '200px',
              zIndex: 1000,
              marginTop: '0.5rem',
              overflow: 'hidden'
            }}>
              {allNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    padding: '0.85rem 1.25rem',
                    color: 'var(--dark)',
                    fontWeight: 500,
                    borderBottom: '1px solid var(--light-cool)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--light)';
                    e.target.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = 'var(--dark)';
                  }}
                >
                  {link.label}
                </Link>
              ))}
              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      padding: '0.85rem 1.25rem',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      borderBottom: '1px solid var(--light-cool)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--light)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      padding: '0.85rem 1.25rem',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--light)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                    }}
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: 'var(--error)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {!user && (
          <>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              Login
            </Link>
            <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
              Get Started
            </Link>
          </>
        )}
        {allNavLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {user && (
          <button
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            style={{ 
              width: '100%', 
              marginTop: '0.5rem',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              color: 'var(--error)',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '0.75rem 0'
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
