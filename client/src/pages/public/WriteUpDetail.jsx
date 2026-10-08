import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Mic } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

const WriteUpDetail = () => {
  const { slug } = useParams();
  const [writeUp, setWriteUp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/content/write-ups/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setWriteUp(data.data);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading write-up...</div>;
  if (!writeUp) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Write-up not found.</div>;

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', paddingBottom: '100px' }}>
      
      {/* Editorial Hero */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '60px 0 80px 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <Link to="/write-ups" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: '600', textDecoration: 'none', marginBottom: '32px', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back to Write-ups
          </Link>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Editorial
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} /> {new Date(writeUp.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.15', letterSpacing: '-0.02em', marginBottom: '24px' }}>
            {writeUp.title}
          </h1>
          
          {writeUp.summary && (
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6', fontWeight: '400', borderLeft: '4px solid #3b82f6', paddingLeft: '20px' }}>
              {writeUp.summary}
            </p>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container" style={{ maxWidth: '800px', marginTop: '60px' }}>
        
        {/* Cover Image Feature */}
        {(writeUp.coverImage || writeUp.coverUrl) && (
          <div style={{ width: '100%', height: '400px', borderRadius: '24px', overflow: 'hidden', marginBottom: '60px', boxShadow: 'var(--card-shadow)', background: 'var(--bg-secondary)' }}>
            <MediaImage src={writeUp.coverImage || writeUp.coverUrl} alt={writeUp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* References Panel (If admin linked a speaker or event) */}
        {(writeUp.speaker || writeUp.event) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '40px' }}>
            {writeUp.speaker && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#3b82f6" />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', fontWeight: '700' }}>Featured Speaker</p>
                  <Link to={`/speakers/${writeUp.speaker.slug}`} style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'none' }}>{writeUp.speaker.name}</Link>
                </div>
              </div>
            )}
            
            {writeUp.event && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic size={20} color="#10b981" />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', fontWeight: '700' }}>Related Event</p>
                  <Link to={`/events/${writeUp.event.slug}`} style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'none' }}>{writeUp.event.title}</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Article Body */}
        <div style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
          {writeUp.content}
        </div>
      </section>
    </div>
  );
};

export default WriteUpDetail;