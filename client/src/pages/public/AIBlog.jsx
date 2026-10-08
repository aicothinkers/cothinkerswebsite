import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Added for routing
import { ExternalLink, Newspaper, Cpu, ArrowRight } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

const PublicAIBlog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/content/ai-blog')
      .then(res => res.json())
      .then(data => {
        if (data.success) setArticles(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
        <Cpu size={32} color="#10b981" />
        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Syncing with the grid...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', paddingBottom: '100px' }}>
      
      {/* HEADER SECTION */}
      <section style={{ backgroundColor: '#090b14', backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1), transparent 50%)', padding: '80px 0', borderBottom: '1px solid #1e293b', marginBottom: '60px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.85rem', fontWeight: '600', color: '#3b82f6', marginBottom: '24px' }}>
            <Newspaper size={14} /> aiCo-thinkers Intelligence
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '24px', color: '#ffffff' }}>
            AI Industry <span style={{ color: '#3b82f6' }}>News & Research.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.15rem', lineHeight: '1.7', margin: '0 auto' }}>
            Curated updates, breakthrough tools, and technical breakdowns across artificial intelligence and machine learning.
          </p>
        </div>
      </section>

      {/* ARTICLES GRID */}
      <section className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
          {articles.map(article => (
            // Swapped from <article> to <Link> to route to AIBlogDetail.jsx
            <Link 
              to={`/ai-blog/${article.slug || article._id}`} 
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
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.1)'; }} 
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              {/* Image Header */}
              {article.coverImage && (
                <div style={{ height: '200px', backgroundColor: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                  <MediaImage src={article.coverImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {article.category || 'AI News'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              )}

              {/* Body Content */}
              <div style={{ padding: '32px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '16px', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                  {article.title}
                </h2>
                
                {/* Locked Summary to 3 lines */}
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  marginBottom: '24px', 
                  flexGrow: 1,
                  display: '-webkit-box', 
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden'
                }}>
                  {article.summary}
                </div>
                
                {/* Read Article Action */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Read Article <ArrowRight size={16} />
                  </span>
                  
                  {article.sourceName && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={12} /> {article.sourceName}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <div style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
            <Newspaper size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>No articles published yet</h3>
            <p>Our scouts are currently gathering the latest AI research.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default PublicAIBlog;