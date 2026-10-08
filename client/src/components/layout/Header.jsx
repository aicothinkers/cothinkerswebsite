import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import './Header.css';

// Logo imports (adjust relative path if stored elsewhere, e.g. public/)
import aiDarkLogo from '../../assets/aidark.jpeg';
import aiWhiteLogo from '../../assets/aiwhite.jpeg';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || 'light';
  const toggleTheme = themeContext?.toggleTheme || (() => console.log('Theme toggle clicked'));

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
      <div className="container header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', padding: '0 20px', boxSizing: 'border-box' }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          
          {/* LOGO: STRICT INLINE DIMENSIONS, NO GLOW */}
          <Link 
            to="/" 
            onClick={closeMobileMenu}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              height: '38px',
              flexShrink: 0
            }}
          >
            <img 
              src={theme === 'dark' ? aiDarkLogo : aiWhiteLogo} 
              alt="aiCo-Thinkers" 
              style={{ 
                height: '36px', 
                width: 'auto', 
                maxHeight: '36px', 
                maxWidth: '130px', 
                borderRadius: '8px', 
                objectFit: 'contain', 
                display: 'block',
                transition: 'transform 0.2s ease'
              }} 
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </Link>
          
          <nav className="desktop-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/events" className="nav-link">Events</Link>
            <Link to="/sessions" className="nav-link">Sessions</Link>
            <Link to="/write-ups" className="nav-link">Write-ups</Link>
            <Link to="/speakers" className="nav-link">Speakers</Link>
            <Link to="/ai-blog" className="nav-link">AI Blog</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/jobs" className="nav-link">Jobs</Link>
          </nav>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* Changed from <a> to <Link> routing to /events */}
          <Link to="/events" className="btn-primary" style={{ textDecoration: 'none' }}>
            Register Event
          </Link>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>Home</Link>
          <Link to="/events" className="mobile-nav-link" onClick={closeMobileMenu}>Events</Link>
          <Link to="/sessions" className="mobile-nav-link" onClick={closeMobileMenu}>Sessions</Link>
          <Link to="/write-ups" className="mobile-nav-link" onClick={closeMobileMenu}>Write-ups</Link>
          <Link to="/speakers" className="mobile-nav-link" onClick={closeMobileMenu}>Speakers</Link>
          <Link to="/ai-blog" className="mobile-nav-link" onClick={closeMobileMenu}>AI Blog</Link>
          <Link to="/jobs" className="mobile-nav-link" onClick={closeMobileMenu}>Jobs</Link> 
          <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>About</Link>
          <div className="mobile-cta-wrapper">
            {/* Changed from <a> to <Link> routing to /events */}
            <Link to="/events" className="btn-primary-mobile" onClick={closeMobileMenu}>
              Register Event
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;