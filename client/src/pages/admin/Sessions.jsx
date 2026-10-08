import { useState, useEffect } from 'react';
import { Video, Plus, Trash2, Calendar, User as UserIcon, ChevronDown, ChevronUp, PlayCircle, Edit3 } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedSummId, setExpandedSummId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = { title: '', topic: '', speaker: '', event: '', summary: '', keyTakeaways: '', youtubeUrl: '' };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [sessRes, speakRes, eventRes] = await Promise.all([ fetch('/api/v1/content/sessions'), fetch('/api/v1/speakers'), fetch('/api/v1/events') ]);
      if (sessRes.ok) setSessions((await sessRes.json()).data);
      if (speakRes.ok) setSpeakers((await speakRes.json()).data);
      if (eventRes.ok) setEvents((await eventRes.json()).data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEditClick = (session) => {
    setFormData({
      title: session.title, topic: session.topic,
      speaker: session.speaker?._id || session.speaker || '',
      event: session.event?._id || session.event || '',
      summary: session.summary, keyTakeaways: session.keyTakeaways || '', youtubeUrl: session.youtubeUrl
    });
    setEditingId(session._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `/api/v1/content/sessions/${editingId}` : '/api/v1/content/sessions';
    try {
      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if ((await res.json()).success) { setFormData(initialFormState); setEditingId(null); setIsFormOpen(false); fetchData(); }
    } catch (err) { alert('Network error'); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete the session: "${title}"?`)) return;
    try {
      if ((await (await fetch(`/api/v1/content/sessions/${id}`, { method: 'DELETE' })).json()).success) fetchData();
    } catch (err) { alert('Network error'); }
  };

  const getYouTubeId = (url) => {
    if (!url) return null; const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading sessions directory...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>Session Management</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Link speakers to events and embed their talk recordings.</p>
        </div>
        <button onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData(initialFormState); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: isFormOpen ? 'var(--bg-secondary)' : '#3b82f6', color: isFormOpen ? 'var(--text-primary)' : '#fff', border: isFormOpen ? '1px solid var(--border-color)' : 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          {isFormOpen ? 'Cancel' : <><Plus size={18} /> Add Session</>}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem' }}>{editingId ? 'Edit Session Details' : 'New Session Details'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <input className="admin-input" required placeholder="Session Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <input className="admin-input" required placeholder="Broad Topic Category" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <select className="admin-input" required value={formData.speaker} onChange={e => setFormData({...formData, speaker: e.target.value})}>
              <option value="">Select a Speaker...</option>
              {speakers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select className="admin-input" required value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})}>
              <option value="">Select an Event...</option>
              {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input className="admin-input" required placeholder="YouTube Video URL" value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <textarea className="admin-input" required placeholder="Full Session Summary" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} style={{ minHeight: '120px', resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <textarea className="admin-input" placeholder="Key Takeaways (Comma separated)" value={formData.keyTakeaways} onChange={e => setFormData({...formData, keyTakeaways: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>
          <button type="submit" style={{ padding: '12px 28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
            {editingId ? 'Update Session' : 'Save Session'}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {sessions.map(session => {
          const isExpanded = expandedSummId === session._id;
          const ytId = getYouTubeId(session.youtubeUrl);
          const displayImage = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null;

          return (
            <div key={session._id} className="admin-card">
              <div style={{ height: '180px', backgroundColor: 'var(--bg-secondary)', position: 'relative', borderBottom: '1px solid var(--border-color)' }}>
                {displayImage ? <MediaImage src={displayImage} alt={session.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={40} opacity={0.3} /></div>}
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '600', backdropFilter: 'blur(4px)' }}>{session.topic}</div>
                {ytId && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}><PlayCircle size={48} color="white" opacity={0.9} /></div>}
              </div>

              <div style={{ padding: '24px 24px 16px 24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', lineHeight: '1.3' }}>{session.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', fontWeight: '500' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserIcon size={16} color="var(--text-secondary)" /> <span>{session.speaker?.name || 'Unknown Speaker'}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} color="var(--text-secondary)" /> <span>{session.event?.title || 'Unknown Event'}</span></div>
                </div>
              </div>

              <div style={{ padding: '0 24px 16px 24px', flexGrow: 1 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{session.summary}</div>
                {session.summary && session.summary.length > 90 && (
                  <button onClick={() => setExpandedSummId(isExpanded ? null : session._id)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', padding: '8px 0 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isExpanded ? 'View Less' : 'Read Summary'} {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>

              <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={session.youtubeUrl} target="_blank" rel="noreferrer" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}><Video size={16} /> Watch</a>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEditClick(session)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}><Edit3 size={16} /> Edit</button>
                  <button onClick={() => handleDelete(session._id, session.title)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}><Trash2 size={16} /> Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSessions;