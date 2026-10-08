import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

const PublicWriteUps = () => {
  const [writeUps, setWriteUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/content/write-ups')
      .then(res => res.json())
      .then(data => {
        if (data.success) setWriteUps(data.data);
      })
      .catch(err => console.error('Failed to fetch write-ups:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
        <BookOpen size={32} color="#108cb9" />
        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading write-ups...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', overflowX: 'hidden', paddingBottom: '100px' }}>
      
      {/* HEADER SECTION */}
      <section style={{ backgroundColor: '#090b14', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16, 86, 185, 0.1), transparent 50%)', padding: '100px 0 70px 0', borderBottom: '1px solid #1e293b', marginBottom: '50px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full, 9999px)', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.85rem', fontWeight: '600', color: '#1089b9', marginBottom: '24px' }}>
            <BookOpen size={14} /> aiCo-thinkers Knowledge Base
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '20px', color: '#ffffff' }}>
            Community <span style={{ color: '#106db9' }}>Write-ups.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: '1.7', margin: '0 auto' }}>
            Deep-dive articles, architectural breakdowns, and key takeaways written by our community and industry speakers.
          </p>
        </div>
      </section>

      {/* RESPONSIVE WRITE-UPS GRID */}
      <section className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
          {writeUps.map(article => (
            <Link 
              to={`/write-ups/${article.slug || article._id}`} 
              key={article._id} 
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
              onMouseOver={(e) => { 
                e.currentTarget.style.transform = 'translateY(-4px)'; 
                e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(0,0,0,0.12)'; 
              }} 
              onMouseOut={(e) => { 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.boxShadow = 'var(--card-shadow)'; 
              }}
            >
              {/* 16:9 Aspect Ratio Cover Image */}
              <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                {article.coverImage ? (
                  <MediaImage 
                    src={article.coverImage} 
                    alt={article.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={44} color="var(--text-muted)" opacity={0.3} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)', color: '#0f111a', fontSize: '0.72rem', fontWeight: '800', padding: '4px 12px', borderRadius: 'var(--radius-full, 9999px)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {article.category || 'Article'}
                </div>
              </div>

              {/* Content Body */}
              <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '500' }}>
                  <Calendar size={14} /> {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px', lineHeight: '1.35', color: 'var(--text-primary)' }}>
                  {article.title}
                </h2>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.summary}
                </p>
                
                {/* Author & Read Action Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: 'auto' }}>
                  {article.speaker ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <User size={14} color="var(--text-secondary)" />
                      </div>
                      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden' }}>{article.speaker.name}</div>
                        {article.speaker.company && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{article.speaker.company}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      aiCo-thinkers Team
                    </div>
                  )}
                  
                  <span style={{ color: '#1075b9', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem', fontWeight: '700', flexShrink: 0, marginLeft: '12px' }}>
                    Read <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Empty State */}
        {writeUps.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
            <BookOpen size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>No write-ups published yet</h3>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>Check back later for new insights and articles from the community.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default PublicWriteUps;