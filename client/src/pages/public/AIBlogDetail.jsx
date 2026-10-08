import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ExternalLink, Lightbulb } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

const AIBlogDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/content/ai-blog/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setArticle(data.data);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading article...</div>;
  if (!article) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Article not found.</div>;

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', paddingBottom: '100px' }}>
      
      {/* Editorial Hero */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '60px 0 80px 0', borderBottom: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 10 }}>
          <Link to="/ai-blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', fontWeight: '600', textDecoration: 'none', marginBottom: '32px', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back to AI Blog
          </Link>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {article.category || 'Artificial Intelligence'}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} /> {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.15', letterSpacing: '-0.02em', marginBottom: '24px' }}>
            {article.title}
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6', fontWeight: '400' }}>
            {article.summary}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container" style={{ maxWidth: '800px', marginTop: '60px' }}>
        
        {/* Cover Image Feature */}
        {(article.coverImage || article.coverUrl) && (
          <div style={{ width: '100%', height: '400px', borderRadius: '24px', overflow: 'hidden', marginBottom: '60px', boxShadow: 'var(--card-shadow)', background: 'var(--bg-secondary)' }}>
            <MediaImage src={article.coverImage || article.coverUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Article Body */}
        <div style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
          {article.content}
        </div>

        {/* Source Citation */}
        {article.sourceUrl && (
          <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Original Source</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This article contains research gathered from external sources.</p>
            </div>
            <a href={article.sourceUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '12px 24px', borderRadius: 'var(--radius-full)', fontWeight: '600', textDecoration: 'none', border: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
              Read on {article.sourceName || 'External Website'} <ExternalLink size={16} />
            </a>
          </div>
        )}
      </section>
    </div>
  );
};

export default AIBlogDetail;