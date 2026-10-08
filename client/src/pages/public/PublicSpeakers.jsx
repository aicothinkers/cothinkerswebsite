import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MediaImage from '../../components/common/MediaImage';
import { ArrowRight, Users } from 'lucide-react';

// --- CUSTOM BRAND SVG TO PREVENT LUCIDE CRASHES ---
const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const PublicSpeakers = () => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedSpeakers = async () => {
      try {
        const res = await fetch('/api/v1/speakers');
        const data = await res.json();
        
        if (data.success) {
          // SECURITY FILTER: Only show speakers who are NOT marked as 'Pending'
          const approvedSpeakers = data.data.filter(speaker => speaker.status !== 'Pending');
          setSpeakers(approvedSpeakers);
        }
      } catch (err) {
        console.error('Failed to load speakers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedSpeakers();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
        <Users size={32} color="#109db9" />
        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading speaker directory...</span>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '80px 0 100px 0', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 60px auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(16, 165, 185, 0.1)', border: '1px solid rgba(16, 160, 185, 0.2)', fontSize: '0.85rem', fontWeight: '700', color: '#109ab9', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Users size={14} /> Knowledge Leaders
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
            Our Speakers
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
            Learn from industry leaders, visionary founders, and top-tier engineers shaping the future of technology.
          </p>
        </div>

        {/* Responsive Speakers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
          {speakers.map(speaker => (
            <div 
              key={speaker._id} 
              style={{ 
                background: 'var(--bg-secondary)', 
                borderRadius: '20px', 
                border: '1px solid var(--border-color)', 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden', 
                boxShadow: 'var(--card-shadow)',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease' 
              }} 
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.1)'; }} 
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              
              {/* Profile Header */}
              <div style={{ display: 'flex', padding: '24px 20px 18px 20px', gap: '16px', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: '68px', height: '68px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '2px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                  <MediaImage src={speaker.photoUrl} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {speaker.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#10a8b9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {speaker.designation}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @ {speaker.company}
                  </p>
                </div>
              </div>

              {/* Bio & Links */}
              <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                
                {speaker.linkedinUrl && (
                  <a 
                    href={speaker.linkedinUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      fontSize: '0.85rem', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)', 
                      textDecoration: 'none', 
                      marginBottom: '14px', 
                      padding: '6px 14px', 
                      background: 'var(--bg-primary)', 
                      borderRadius: '99px', 
                      border: '1px solid var(--border-color)', 
                      alignSelf: 'flex-start', 
                      transition: 'border-color 0.2s',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }} 
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#1086b9'} 
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <LinkedinIcon size={15} /> Connect on LinkedIn
                  </a>
                )}

                <div style={{ 
                  fontSize: '0.92rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  display: '-webkit-box', 
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden',
                  flexGrow: 1,
                  marginBottom: '16px'
                }}>
                  {speaker.bio || 'Biography coming soon.'}
                </div>

                <Link 
                  to={`/speakers/${speaker.slug}`}
                  style={{ color: '#1081b9', fontSize: '0.88rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto', alignSelf: 'flex-start' }}
                >
                  View Full Profile <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {speakers.length === 0 && !loading && (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', marginTop: '20px' }}>
            No speakers have been announced yet. Check back soon!
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicSpeakers;