import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, User as UserIcon, PlayCircle, Mic } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

const PublicSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('All');

  useEffect(() => {
    fetch('/api/v1/content/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSessions(data.data);
      })
      .catch(err => console.error('Failed to fetch sessions:', err))
      .finally(() => setLoading(false));
  }, []);

  // Extract unique topics for filter tabs
  const topics = ['All', ...new Set(sessions.map(s => s.topic).filter(Boolean))];

  const filteredSessions = selectedTopic === 'All' 
    ? sessions 
    : sessions.filter(s => s.topic === selectedTopic);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
        <Video size={32} color="#1056b9" />
        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading sessions directory...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', overflowX: 'hidden', paddingBottom: '100px' }}>
      
      {/* HEADER SECTION */}
      <section style={{ backgroundColor: '#090b14', backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1), transparent 50%)', padding: '100px 0 70px 0', borderBottom: '1px solid #1e293b', marginBottom: '40px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full, 9999px)', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.85rem', fontWeight: '600', color: '#10b981', marginBottom: '24px' }}>
            <Mic size={14} /> aiCo-thinkers Sessions
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '20px', color: '#ffffff' }}>
            Explore Talks & <span style={{ color: '#1070b9' }}>Sessions.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: '1.7', margin: '0 auto' }}>
            Immerse yourself in deep-dive architectural walkthroughs, engineering sessions, and live panel recordings from past aiCo-thinkers editions.
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        
        {/* TOPIC FILTER PILLS */}
        {topics.length > 1 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px', justifyContent: 'center' }}>
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: selectedTopic === topic ? '1px solid #1075b9' : '1px solid var(--border-color)',
                  background: selectedTopic === topic ? '#106ab9' : 'var(--bg-secondary)',
                  color: selectedTopic === topic ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedTopic === topic ? '0 4px 12px rgba(16, 98, 185, 0.2)' : 'none'
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {/* RESPONSIVE SESSIONS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
          {filteredSessions.map(session => {
            const ytId = getYouTubeId(session.youtubeUrl);
            const coverImg = session.coverImage || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null);

            return (
              <Link 
                to={`/sessions/${session.slug || session._id}`}
                key={session._id} 
                style={{ 
                  background: 'var(--bg-primary)', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border-color)', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: 'var(--card-shadow)', 
                  textDecoration: 'none',
                  color: 'inherit',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease' 
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.1)'; }} 
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
              >
                
                {/* 16:9 Video Thumbnail Container */}
                <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--bg-secondary)', position: 'relative', borderBottom: '1px solid var(--border-light)', overflow: 'hidden' }}>
                  {coverImg ? (
                    <MediaImage src={coverImg} alt={session.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      <Video size={44} opacity={0.3} />
                    </div>
                  )}
                  
                  {session.topic && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255, 255, 255, 0.95)', color: '#0f111a', padding: '4px 12px', borderRadius: 'var(--radius-full, 9999px)', fontSize: '0.72rem', fontWeight: '800', backdropFilter: 'blur(4px)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {session.topic}
                    </div>
                  )}

                  {ytId && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                      <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.95)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.25)' }}>
                        <PlayCircle size={28} color="#109db9" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '14px', lineHeight: '1.35', color: 'var(--text-primary)' }}>
                    {session.title}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <UserIcon size={13} color="var(--text-primary)" />
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{session.speaker?.name || 'Industry Practitioner'}</span>
                      {session.speaker?.company && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@ {session.speaker.company}</span>
                      )}
                    </div>
                    {session.event?.title && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Calendar size={14} /> <span>{session.event.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Clean 3-Line Clamping without Fixed Height Overflow */}
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
                    {session.summary}
                  </div>
                </div>

                {/* Action Footer */}
                <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '50%' }}>
                    /{session.slug || session._id}
                  </span>
                  <span style={{ fontSize: '0.88rem', color: '#104bb9', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PlayCircle size={16} /> View Session
                  </span>
                </div>

              </Link>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filteredSessions.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', marginTop: '20px' }}>
            <Video size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>No sessions found</h3>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>No video recordings are currently available for this topic.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicSessions;