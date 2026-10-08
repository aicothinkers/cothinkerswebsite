import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Link as LinkIcon, ChevronDown, ChevronUp, UploadCloud, Loader2, CheckCircle } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

const compressImage = (file, maxWidth = 1200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image(); img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      }; img.onerror = reject;
    }; reader.onerror = reject;
  });
};

const AdminWriteUps = () => {
  const [writeUps, setWriteUps] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = { title: '', speaker: '', event: '', summary: '', content: '', imageBase64: '' };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [wRes, sRes, eRes] = await Promise.all([ fetch('/api/v1/content/write-ups'), fetch('/api/v1/speakers'), fetch('/api/v1/events') ]);
      if (wRes.ok) setWriteUps((await wRes.json()).data);
      if (sRes.ok) setSpeakers((await sRes.json()).data);
      if (eRes.ok) setEvents((await eRes.json()).data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEditClick = (article) => {
    setFormData({
      title: article.title,
      speaker: article.speaker?._id || article.speaker || '',
      event: article.event?._id || article.event || '',
      summary: article.summary,
      content: article.content,
      imageBase64: ''
    });
    setEditingId(article._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    if (!e.target.files[0]) return;
    setIsCompressing(true);
    try { setFormData({ ...formData, imageBase64: await compressImage(e.target.files[0]) }); } 
    catch (err) { alert('Compression failed.'); } finally { setIsCompressing(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setUploading(true);
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `/api/v1/content/write-ups/${editingId}` : '/api/v1/content/write-ups';
    try {
      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if ((await res.json()).success) { setFormData(initialFormState); setEditingId(null); setIsFormOpen(false); fetchData(); }
    } catch (err) { alert('Network error'); } finally { setUploading(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete write-up: "${title}"?`)) return;
    try { if ((await (await fetch(`/api/v1/content/write-ups/${id}`, { method: 'DELETE' })).json()).success) fetchData(); } 
    catch (err) { alert('Network error'); }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading write-ups...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>Write-ups Management</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Publish editorial content about events and sessions.</p>
        </div>
        <button onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData(initialFormState); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: isFormOpen ? 'var(--bg-secondary)' : '#3b82f6', color: isFormOpen ? 'var(--text-primary)' : '#fff', border: isFormOpen ? '1px solid var(--border-color)' : 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          {isFormOpen ? 'Cancel' : <><Plus size={18} /> Compose Write-up</>}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem' }}>{editingId ? 'Edit Write-up' : 'New Write-up'}</h3>
          <div style={{ marginBottom: '20px' }}>
            <input className="admin-input" required placeholder="Article Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <select className="admin-input" value={formData.speaker} onChange={e => setFormData({...formData, speaker: e.target.value})}>
              <option value="">Link Speaker (Optional)</option>
              {speakers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select className="admin-input" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})}>
              <option value="">Link Event (Optional)</option>
              {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: formData.imageBase64 ? '2px solid #10b981' : '2px dashed var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', cursor: isCompressing ? 'not-allowed' : 'pointer' }}>
              {isCompressing ? <><Loader2 size={16} className="spin" color="#3b82f6" /> <span style={{ color: '#3b82f6', fontWeight: '600' }}>Compressing...</span></> : formData.imageBase64 ? <><CheckCircle size={16} color="#10b981" /> <span style={{ color: '#10b981', fontWeight: '600' }}>Ready</span></> : <><UploadCloud size={16} color="var(--text-secondary)" /> <span>{editingId ? 'Replace Cover Image' : 'Upload Cover Image'}</span></>}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isCompressing} />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <textarea className="admin-input" required placeholder="Short Summary" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <textarea className="admin-input" required placeholder="Full Article Content (Supports paragraphs)" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ minHeight: '200px', resize: 'vertical' }} />
          </div>
          <button type="submit" disabled={uploading || isCompressing} style={{ padding: '12px 28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: (uploading || isCompressing) ? 'not-allowed' : 'pointer', fontWeight: '700' }}>
            {uploading ? 'Publishing...' : editingId ? 'Update Write-up' : 'Publish Write-up'}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {writeUps.map(article => {
          const isExpanded = expandedId === article._id;
          return (
            <div key={article._id} className="admin-card">
              {article.coverImage && <div style={{ height: '140px', borderBottom: '1px solid var(--border-color)' }}><MediaImage src={article.coverImage} alt={article.title} style={{ width: '100%', height: '100%' }} /></div>}
              <div style={{ padding: '24px 24px 12px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '12px', fontWeight: '500' }}>
                  <Edit3 size={14} /> {new Date(article.createdAt).toLocaleDateString()}
                </div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', lineHeight: '1.3' }}>{article.title}</h3>
                {(article.speaker || article.event) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {article.event && <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}><LinkIcon size={12}/> {article.event.title}</span>}
                    {article.speaker && <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}><LinkIcon size={12}/> {article.speaker.name}</span>}
                  </div>
                )}
              </div>
              <div style={{ padding: '0 24px 16px 24px', flexGrow: 1 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.summary}</div>
                {article.summary && article.summary.length > 80 && (
                  <button onClick={() => setExpandedId(isExpanded ? null : article._id)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', padding: '8px 0 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isExpanded ? 'View Less' : 'Read Summary'} {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>
              <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => handleEditClick(article)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}><Edit3 size={16} /> Edit</button>
                <button onClick={() => handleDelete(article._id, article.title)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminWriteUps;