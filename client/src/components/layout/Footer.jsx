import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import './Header.css'; 

// Logo imports
import aiDarkLogo from '../../assets/aidark.jpeg';
import aiWhiteLogo from '../../assets/aiwhite.jpeg';

// --- Custom Brand SVGs ---
const LinkedinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || 'light';

  const renderIcon = (IconComponent) => {
    return IconComponent ? <IconComponent size={18} /> : null;
  };

  return (
    <footer style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', padding: '70px 0 36px 0', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '48px', marginBottom: '48px' }}>
          
          {/* Brand Column */}
          <div style={{ flex: '2 1 300px' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '16px', textDecoration: 'none' }}>
              <img 
                src={theme === 'dark' ? aiDarkLogo : aiWhiteLogo} 
                alt="aiCo-Thinkers" 
                style={{ 
                  height: '42px', 
                  width: 'auto', 
                  maxHeight: '42px', 
                  maxWidth: '150px', 
                  borderRadius: '8px', 
                  objectFit: 'contain', 
                  display: 'block',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px', maxWidth: '340px' }}>
              A premier technology community bringing builders, professionals, and industry practitioners together to shape the future of tech.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { icon: LinkedinIcon, url: 'https://www.linkedin.com/company/aicothinkers/' },
                { icon: Mail, url: 'mailto:aicothinkers@gmail.com' }
              ].map((social, idx) => (
                <a key={idx} href={social.url} target="_blank" rel="noreferrer" className="footer-social-link">
                  {renderIcon(social.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '18px' }}>Explore</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Upcoming Events', path: '/events' },
                { label: 'Past Sessions', path: '/sessions' },
                { label: 'Write-Ups', path: '/write-ups' },
                { label: 'AI Blog', path: '/ai-blog' },
                { label: 'About Us', path: '/about' },
                { label: 'Jobs', path: '/jobs' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Want to Join Us Column */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '18px' }}>
              Want to join us?
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Share your message, ideas, or inquiries directly with our team:
            </p>
            <a 
              href="mailto:aicothinkers@gmail.com" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: '#00e5ff', 
                fontWeight: '600', 
                fontSize: '0.92rem', 
                textDecoration: 'none',
                background: 'rgba(0, 229, 255, 0.08)',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                wordBreak: 'break-all',
                transition: 'background 0.2s ease, border-color 0.2s ease',
                marginBottom: '12px'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(0, 229, 255, 0.16)';
                e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.45)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(0, 229, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.25)';
              }}
            >
              <Mail size={16} /> aicothinkers@gmail.com
            </a>
            
            <a 
              href="https://www.linkedin.com/company/aicothinkers/" 
              target="_blank"
              rel="noreferrer"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--text-primary)', 
                fontWeight: '600', 
                fontSize: '0.92rem', 
                textDecoration: 'none',
                background: 'var(--bg-secondary)',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                transition: 'background 0.2s ease, border-color 0.2s ease',
                display: 'flex',
                width: 'max-content'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#00e5ff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <LinkedinIcon size={16} /> Follow on LinkedIn
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingTop: '28px', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <p style={{ margin: 0 }}>© {currentYear} aiCo-thinkers. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            Designed with <span style={{ color: '#00e5ff' }}>●</span> for the builders.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;