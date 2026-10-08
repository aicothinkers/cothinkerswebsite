import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MediaImage from '../../components/common/MediaImage';
import { ArrowLeft, Video, Calendar, MapPin, ArrowRight } from 'lucide-react';

// --- CUSTOM BRAND SVG TO PREVENT LUCIDE CRASHES ---
const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

// --- YOUTUBE URL CONVERTER ---
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
};

const SpeakerProfile = () => {
  const { slug } = useParams(); 
  const [data, setData] = useState({ speaker: null, sessions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeakerData = async () => {
      try {
        const res = await fetch(`/api/v1/speakers/${slug}`);
        const result = await res.json();
        
        if (result.success) {
          setData(result.data); 
        }
      } catch (error) {
        console.error("Failed to fetch speaker details", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpeakerData();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading speaker profile...
      </div>
    );
  }
  
  if (!data.speaker) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '0 20px' }}>
        <h2 style={{ color: 'var(--text-primary)', textAlign: 'center' }}>Speaker not found.</h2>
        <Link to="/speakers" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>Return to Directory</Link>
      </div>
    );
  }

  const { speaker, sessions } = data;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 100px 0', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      
      <style>{`
        .speaker-hero-card {
          background: var(--bg-secondary);
          border-radius: 24px;
          padding: 40px;
          border: 1px solid var(--border-color);
          display: flex;
          gap: 36px;
          align-items: center;
          margin-bottom: 40px;
          box-shadow: var(--card-shadow);
          box-sizing: border-box;
          width: 100%;
        }

        .speaker-avatar-profile {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--bg-primary);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }

        @media (max-width: 680px) {
          .speaker-hero-card {
            flex-direction: column !important;
            text-align: center !important;
            padding: 28px 20px !important;
            gap: 20px !important;
          }
          .speaker-avatar-profile {
            width: 110px !important;
            height: 110px !important;
          }
          .speaker-hero-actions {
            justify-content: center !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        
        <Link to="/speakers" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '32px', fontWeight: '600', transition: 'color 0.2s' }}>
          <ArrowLeft size={18} /> Back to Directory
        </Link>

        {/* --- PROFILE HERO SECTION (RESPONSIVE STACK) --- */}
        <div className="speaker-hero-card">
           <MediaImage 
             src={speaker.photoUrl} 
             alt={speaker.name} 
             className="speaker-avatar-profile"
           />
           
           <div style={{ flex: 1, minWidth: 0 }}>
             <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
               {speaker.name}
             </h1>
             <p style={{ fontSize: '1.15rem', color: '#10b981', fontWeight: '600', margin: '0 0 4px 0' }}>
               {speaker.designation}
             </p>
             <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
               {speaker.company}
             </p>
             
             {speaker.linkedinUrl && (
               <div className="speaker-hero-actions" style={{ display: 'flex' }}>
                 <a 
                   href={speaker.linkedinUrl} 
                   target="_blank" 
                   rel="noreferrer" 
                   style={{ 
                     display: 'inline-flex', 
                     alignItems: 'center', 
                     gap: '8px', 
                     padding: '10px 20px', 
                     background: 'var(--bg-primary)', 
                     color: 'var(--text-primary)', 
                     borderRadius: '99px', 
                     textDecoration: 'none', 
                     fontWeight: '600', 
                     fontSize: '0.9rem',
                     border: '1px solid var(--border-color)', 
                     transition: 'border-color 0.2s' 
                   }} 
                   onMouseOver={(e) => e.currentTarget.style.borderColor = '#10b981'} 
                   onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                 >
                   <LinkedinIcon size={16} /> Connect on LinkedIn
                 </a>
               </div>
             )}
           </div>
        </div>

        {/* --- BIOGRAPHY SECTION --- */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
            About {speaker.name.split(' ')[0]}
          </h2>
          <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
            {speaker.bio || 'No biography provided.'}
          </div>
        </div>

        {/* --- SESSIONS & MASTERCLASSES (RESPONSIVE 16:9 GRID) --- */}
        {sessions.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '24px', color: 'var(--text-primary)' }}>
              Sessions & Masterclasses
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
              {sessions.map(session => {
                const embedUrl = getYouTubeEmbedUrl(session.youtubeUrl);

                return (
                  <div 
                    key={session._id} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '20px', 
                      border: '1px solid var(--border-color)', 
                      overflow: 'hidden', 
                      width: '100%',
                      boxSizing: 'border-box',
                      boxShadow: 'var(--card-shadow)',
                      transition: 'box-shadow 0.2s ease, transform 0.2s ease' 
                    }} 
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(0,0,0,0.1)'; }} 
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
                  >
                    
                    {/* Media Container: Responsive 16:9 Aspect Ratio */}
                    <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: '#000', borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      {embedUrl ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={embedUrl}
                          title={session.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ border: 'none' }}
                        ></iframe>
                      ) : session.coverImage ? (
                        <MediaImage src={session.coverImage} alt={session.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Video size={44} color="#10b981" />
                        </div>
                      )}
                    </div>

                    {/* Session Details */}
                    <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'inline-block', alignSelf: 'flex-start', fontSize: '0.72rem', fontWeight: '800', padding: '4px 10px', borderRadius: '99px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {session.topic || 'Masterclass'}
                      </div>
                      
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)', lineHeight: '1.35' }}>
                        {session.title}
                      </h3>
                      
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flexGrow: 1 }}>
                        {session.summary}
                      </p>
                      
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {session.event && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {session.event.title}</span>}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {new Date(session.createdAt || session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>

                        <Link to={`/sessions/${session.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '700', fontSize: '0.88rem', textDecoration: 'none', alignSelf: 'flex-start' }}>
                          View Details <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SpeakerProfile;