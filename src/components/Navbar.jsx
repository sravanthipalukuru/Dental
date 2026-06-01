import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import './Navbar.css';

const navLinks = [
  { path: '/',          label: 'Home',    emoji: '🏠' },
  { path: '/games',     label: 'Games',   emoji: '🎮' },
  { path: '/child',     label: 'Child',   emoji: '👦' },
  { path: '/store',     label: 'Epic Store', emoji: '🛍️' },
  { path: '/parent',    label: 'Parent',  emoji: '👨‍👩‍👧' },
  { path: '/dentist',   label: 'Dentist', emoji: '🦷' },
  { path: '/dr-smiles', label: 'Dr. Smiles', emoji: '🐻' },
];

export default function Navbar() {
  const location = useLocation();
  const userId = useStore(state => state.userId);
  const avatar = useStore(state => state.avatar);
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  // Hide global navbar on all game screens to avoid layout overlap
  if (location.pathname.startsWith('/game/')) {
    return null;
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🦷</span>
          <span className="navbar__logo-text">
            Happy<span>Dental</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="navbar__links">
          {navLinks
            .filter(link => userId || link.path === '/')
            .map(({ path, label, emoji }) => (
            <li key={path}>
              <Link
                to={path}
                className={`navbar__link ${location.pathname === path ? 'navbar__link--active' : ''}`}
              >
                <span className="navbar__link-emoji">{emoji}</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Dynamic Profile/Login Link */}
        <Link to={userId ? "/profile" : "/login"} className="btn btn-primary navbar__cta">
          {userId ? (
            <>
              <span style={{ fontSize: '1.3em', lineHeight: 1 }}>{avatar}</span>
              <span className="navbar__user-id">{userId}</span>
            </>
          ) : (
            "Login"
          )}
        </Link>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${menuOpen ? 'navbar__drawer--open' : ''}`}>
        {navLinks
          .filter(link => userId || link.path === '/')
          .map(({ path, label, emoji }) => (
          <Link
            key={path}
            to={path}
            className={`navbar__drawer-link ${location.pathname === path ? 'active' : ''}`}
          >
            {emoji} {label}
          </Link>
        ))}
        {userId && (
          <Link to="/child" className="btn btn-primary" style={{ marginTop: 12 }}>
            Start Adventure ✨
          </Link>
        )}
      </div>
    </nav>
  );
}
