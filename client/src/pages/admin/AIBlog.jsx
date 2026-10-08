import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, ChevronDown, ChevronUp, UploadCloud, Loader2, CheckCircle, Edit3 } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

// --- NATIVE BROWSER IMAGE COMPRESSOR (< 1MB Guarantee) ---
const compressImageToUnder1MB = (file, maxWidth = 1200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.9; 
        let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        let estimatedBytes = (compressedBase64.length * 3) / 4;
        while (estimatedBytes > 1000000 && quality > 0.1) {
          quality -= 0.1;
          compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          estimatedBytes = (compressedBase64.length * 3) / 4;
        }
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const AdminAIBlog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // NEW: Editing State
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = { 
    title: '', category: 'News', summary: '', content: '', sourceName: '', sourceUrl: '', imageBase64: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/v1/content/ai-blog');
      const data = await res.json();
      if (data.success) setArticles(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  // NEW: Handle Edit Click
  const handleEditClick = (article) => {
    setFormData({
      title: article.title,
      category: article.category || 'News',
      summary: article.summary,
      content: article.content,
      sourceName: article.sourceName || '',
      sourceUrl: article.sourceUrl || '',
      imageBase64: '' // Leave empty so we don't re-upload unless changed
    });
    setEditingId(article._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const compressedBase64 = await compressImageToUnder1MB(file, 1200);
      setFormData({ ...formData, imageBase64: compressedBase64 });
    } catch (err) {
      alert('Failed to compress image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // Determine if creating or updating
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `/api/v1/content/ai-blog/${editingId}` : '/api/v1/content/ai-blog';

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setFormData(initialFormState);
        setEditingId(null);
        setIsFormOpen(false);
        fetchArticles();
      } else {
        alert('Failed to save article: ' + data.error);
      }
    } catch (err) { 
      alert('Network error'); 
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete AI Article: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/content/ai-blog/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchArticles();
      }
    } catch (err) { 
      alert('Network error'); 
    }
  };

  if (loading) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading AI Blog directory...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>AI Blog Management</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Publish AI news, research, and tools to the community.</p>
        </div>
        <button 
          onClick={isFormOpen ? handleCancel : () => setIsFormOpen(true)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: isFormOpen ? 'var(--bg-secondary)' : '#3b82f6', color: isFormOpen ? 'var(--text-primary)' : '#fff', border: isFormOpen ? '1px solid var(--border-color)' : 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
        >
          {isFormOpen ? 'Cancel' : <><Plus size={18} /> New Article</>}
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', fontWeight: '700' }}>
            {editingId ? 'Edit Article' : 'New Article'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Headline *</label>
              <input className="admin-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Category *</label>
              <select className="admin-input" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="News">News</option>
                <option value="Research">Research</option>
                <option value="Tools">Tools</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Opinion">Opinion</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Original Source Name (Optional)</label>
              <input className="admin-input" placeholder="e.g. OpenAI Blog, TechCrunch" value={formData.sourceName} onChange={e => setFormData({...formData, sourceName: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Original Source URL (Optional)</label>
              <input className="admin-input" type="url" placeholder="https://..." value={formData.sourceUrl} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Cover Image (Auto-Compress)</label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px 16px', border: formData.imageBase64 ? '2px solid #10b981' : '2px dashed var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', cursor: isCompressing ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {isCompressing ? (
                  <><Loader2 size={18} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} /> <span style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600' }}>Compressing...</span></>
                ) : formData.imageBase64 ? (
                  <><CheckCircle size={18} color="#10b981" /> <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>Image Ready</span></>
                ) : (
                  <><UploadCloud size={18} color="var(--text-secondary)" /> <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>{editingId ? 'Replace Image' : 'Upload Image'}</span></>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isCompressing} />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Summary (1-2 sentences) *</label>
            <textarea className="admin-input" required value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Full Article *</label>
            <textarea className="admin-input" required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ minHeight: '200px', resize: 'vertical' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={uploading || isCompressing} style={{ padding: '14px 32px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: (uploading || isCompressing) ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              {uploading ? 'Publishing to GitHub...' : editingId ? 'Update Article' : 'Publish Article'}
            </button>
          </div>
        </form>
      )}

      {/* ARTICLES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {articles.map(article => {
          const isExpanded = expandedId === article._id;

          return (
            <div key={article._id} className="admin-card">
              
              {/* Cover Image */}
              {article.coverImage && (
                <div style={{ height: '180px', overflow: 'hidden', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                  <MediaImage src={article.coverImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              
              {/* Header Details */}
              <div style={{ padding: '24px 24px 12px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', background: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '12px', fontWeight: '700' }}>
                    {article.category}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', lineHeight: '1.4', fontWeight: '700' }}>{article.title}</h3>
              </div>

              {/* Summary */}
              <div style={{ padding: '0 24px 20px 24px', flexGrow: 1 }}>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6', 
                  display: isExpanded ? 'block' : '-webkit-box', 
                  WebkitLineClamp: isExpanded ? 'unset' : 3, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden' 
                }}>
                  {article.summary}
                </div>
                {article.summary && article.summary.length > 100 && (
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : article._id)}
                    style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', padding: '8px 0 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}
                  >
                    {isExpanded ? 'View Less' : 'Read Summary'} {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>
              
              {/* ACTION FOOTER */}
              <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                <div>
                  {article.sourceUrl ? (
                    <a href={article.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontWeight: '600' }}>
                      <ExternalLink size={16}/> {article.sourceName || 'Source'}
                    </a>
                  ) : <div />}
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEditClick(article)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600', padding: '6px' }}>
                    <Edit3 size={18} /> Edit
                  </button>
                  <button onClick={() => handleDelete(article._id, article.title)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600', padding: '6px' }}>
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
                
              </div>
            </div>
          );
        })}
        {articles.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
            No AI Blog articles published yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAIBlog;