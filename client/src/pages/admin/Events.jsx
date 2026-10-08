import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Trash2, Users, ChevronDown, ChevronUp, Plus, Image as ImageIcon, UploadCloud, Loader2, CheckCircle, FileText, Globe, Edit3, Link as LinkIcon } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

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

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [availableSpeakers, setAvailableSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedDescId, setExpandedDescId] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncingEventId, setSyncingEventId] = useState(null);
  const [syncedEvents, setSyncedEvents] = useState(new Set());
  
  const [editingId, setEditingId] = useState(null);
  
  // NEW: Added registerUrl to the initial state
  const initialFormState = { 
    title: '', edition: '', date: '', city: 'Hyderabad', venue: '', description: '', status: 'Draft', imageBase64: '', speakers: [], registerUrl: '' 
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [eventsRes, speakersRes] = await Promise.all([
        fetch('/api/v1/events'),
        fetch('/api/v1/speakers')
      ]);
      const eventsData = await eventsRes.json();
      const speakersData = await speakersRes.json();
      
      if (eventsData.success) setEvents(eventsData.data);
      if (speakersData.success) setAvailableSpeakers(speakersData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSpeakerToggle = (speakerId) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.includes(speakerId) 
        ? prev.speakers.filter(id => id !== speakerId)
        : [...prev.speakers, speakerId]
    }));
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

  const handleCSVUpload = async (e, eventId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSyncingEventId(eventId);
    
    try {
      const text = await file.text();
      const cleanText = text.replace(/^\uFEFF/, ''); 
      const lines = cleanText.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) throw new Error("CSV is empty or invalid");

      const parseLine = (str) => {
        let result = [], insideQuotes = false, token = '';
        for (let i = 0; i < str.length; i++) {
          let char = str[i];
          if (char === '"') insideQuotes = !insideQuotes;
          else if (char === ',' && !insideQuotes) { result.push(token.trim()); token = ''; }
          else token += char;
        }
        result.push(token.trim());
        return result.map(s => s.replace(/^"|"$/g, '').trim());
      };

      const headers = parseLine(lines[0]).map(h => h.toLowerCase());
      
      const firstNameIdx = headers.findIndex(h => h.includes('first'));
      const lastNameIdx = headers.findIndex(h => h.includes('last'));
      const fullNameIdx = headers.findIndex(h => h.includes('name') && !h.includes('company') && !h.includes('event'));
      const desigIdx = headers.findIndex(h => h.includes('title') || h.includes('designation') || h.includes('role') || h.includes('company') || h.includes('headline'));
      const linkIdx = headers.findIndex(h => h.includes('linkedin'));

      if (fullNameIdx === -1 && firstNameIdx === -1) {
        throw new Error(`Could not find a Name column. Found headers: ${headers.join(', ')}`);
      }

      const attendees = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i]);
        
        let finalName = '';
        if (fullNameIdx !== -1 && cols[fullNameIdx]) {
          finalName = cols[fullNameIdx].trim();
        } else if (firstNameIdx !== -1 && cols[firstNameIdx]) {
          finalName = cols[firstNameIdx].trim();
          if (lastNameIdx !== -1 && cols[lastNameIdx]) {
            finalName += ' ' + cols[lastNameIdx].trim();
          }
        }

        if (!finalName || finalName === '') continue;

        attendees.push({
          name: finalName,
          designation: desigIdx !== -1 && cols[desigIdx] ? cols[desigIdx].trim() : '',
          linkedinUrl: linkIdx !== -1 && cols[linkIdx] ? cols[linkIdx].trim() : ''
        });
      }

      const res = await fetch(`/api/v1/attendees/sync/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendees })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        setSyncedEvents(prev => new Set(prev).add(eventId)); 
        fetchData(); 
      } else {
        alert('Sync failed: ' + data.error);
      }

    } catch (err) {
      alert(err.message);
    } finally {
      setSyncingEventId(null);
      e.target.value = null; 
    }
  };

  const handleEditClick = (event) => {
    const formattedDate = event.date ? new Date(event.date).toISOString().slice(0, 16) : '';
    
    // NEW: Added registerUrl mapping
    setFormData({
      title: event.title,
      edition: event.edition,
      date: formattedDate,
      city: event.city || 'Hyderabad',
      venue: event.venue,
      description: event.description,
      status: event.status,
      registerUrl: event.registerUrl || '',
      imageBase64: '', 
      speakers: event.speakers.map(s => s._id || s)
    });
    setEditingId(event._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `/api/v1/events/${editingId}` : '/api/v1/events';

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
        fetchData(); 
      } else {
        alert('Failed to save event: ' + data.error);
      }
    } catch (err) {
      alert('Network error while saving.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('Failed to delete event: ' + data.error);
      }
    } catch (err) {
      alert('Network error while deleting.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? 'Date not set' : d.toLocaleString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' };
      case 'Completed': return { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', border: 'rgba(99, 102, 241, 0.2)' };
      default: return { bg: 'var(--bg-secondary)', text: 'var(--text-secondary)', border: 'var(--border-color)' };
    }
  };

  if (loading) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading event schedule...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>Event Management</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Schedule events and sync Luma attendees.</p>
        </div>
        <button 
          onClick={isFormOpen ? handleCancel : () => setIsFormOpen(true)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: isFormOpen ? 'var(--bg-secondary)' : '#3b82f6', color: isFormOpen ? 'var(--text-primary)' : '#fff', border: isFormOpen ? '1px solid var(--border-color)' : 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
        >
          {isFormOpen ? 'Cancel' : <><Plus size={18} /> Create Event</>}
        </button>
      </div>

      {/* CREATE / EDIT EVENT FORM */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', fontWeight: '700' }}>
            {editingId ? 'Edit Event Details' : 'New Event Details'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Event Title *</label>
              <input className="admin-input" required placeholder="e.g. BacktoBase Meetup 4" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Edition Number *</label>
              <input className="admin-input" type="number" required placeholder="e.g. 4" value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Date & Time *</label>
              <input 
                className="admin-input" 
                type="datetime-local" 
                required 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div>
               <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>City *</label>
               <select className="admin-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                 <option value="Hyderabad">Hyderabad</option>
                 <option value="Bangalore">Bangalore</option>
                 <option value="Delhi">Delhi</option>
                 <option value="Mumbai">Mumbai</option>
                 <option value="Chennai">Chennai</option>
                 <option value="Pune">Pune</option>
                 <option value="Online">Online / Virtual</option>
               </select>
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Venue / Location *</label>
               <input className="admin-input" required placeholder="e.g. Microsoft Campus, Gachibowli" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</label>
              <select className="admin-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Draft">Draft (Hidden)</option>
                <option value="Published">Published (Upcoming)</option>
                <option value="Completed">Completed (Past Event)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Event Banner (Auto-Compress)</label>
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

          {/* NEW: Registration URL Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Registration / RSVP URL (Optional)</label>
            <input 
              className="admin-input" 
              type="url" 
              placeholder="e.g. https://lu.ma/..." 
              value={formData.registerUrl} 
              onChange={e => setFormData({...formData, registerUrl: e.target.value})} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
             <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Event Overview & Description *</label>
             <textarea className="admin-input" required placeholder="What will happen at this event?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ minHeight: '120px', resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: '32px', background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} color="#3b82f6" /> Select Event Speakers</h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {availableSpeakers.map(speaker => {
                const isSelected = formData.speakers.includes(speaker._id);
                return (
                  <label key={speaker._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', border: `1px solid ${isSelected ? '#3b82f6' : 'var(--border-color)'}`, transition: 'all 0.2s', fontSize: '0.95rem', fontWeight: isSelected ? '600' : '500', color: isSelected ? '#3b82f6' : 'var(--text-primary)' }}>
                    <input type="checkbox" checked={isSelected} onChange={() => handleSpeakerToggle(speaker._id)} style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
                    {speaker.name}
                  </label>
                );
              })}
              {availableSpeakers.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No speakers available in directory.</span>}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={uploading || isCompressing} style={{ padding: '14px 32px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: (uploading || isCompressing) ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              {uploading ? 'Publishing to GitHub...' : editingId ? 'Update Event' : 'Save & Publish Event'}
            </button>
          </div>
        </form>
      )}

      {/* EVENT CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '32px' }}>
        {events.map(event => {
          const isExpanded = expandedDescId === event._id;
          const statusStyle = getStatusColor(event.status);
          const isSyncing = syncingEventId === event._id;
          
          return (
            <div key={event._id} className="admin-card">
              
              {/* Banner */}
              <div style={{ height: '180px', backgroundColor: 'var(--bg-secondary)', position: 'relative', borderBottom: '1px solid var(--border-color)' }}>
                {event.bannerUrl ? (
                  <MediaImage src={event.bannerUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><ImageIcon size={40} opacity={0.3} /></div>
                )}
                
                {/* City Badge Overlay */}
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Globe size={14} /> {event.city || 'Hyderabad'}
                </div>

                <div style={{ position: 'absolute', top: '16px', right: '16px', background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '700', backdropFilter: 'blur(8px)' }}>
                  {event.status || 'Draft'}
                </div>
              </div>

              {/* Header Info */}
              <div style={{ padding: '24px 24px 0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}>ED {event.edition || '?'}</div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', lineHeight: '1.3', fontWeight: '700' }}>{event.title || 'Untitled Event'}</h3>
                </div>

                {/* ALIGNED DATE & VENUE BOX */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                    <Calendar size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
                    <span style={{ lineHeight: '1.4' }}>{formatDate(event.date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                    <MapPin size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    <span style={{ lineHeight: '1.4' }}>{event.venue || 'Venue TBD'}</span>
                  </div>
                  {/* NEW: Show Registration Link on Admin Card if it exists */}
                  {event.registerUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                      <LinkIcon size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                      <a href={event.registerUrl} target="_blank" rel="noreferrer" style={{ lineHeight: '1.4', color: '#f59e0b', textDecoration: 'none', wordBreak: 'break-all' }}>
                        {event.registerUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ padding: '0 24px 24px 24px', flexGrow: 1 }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {event.description || 'No description provided.'}
                </div>
                {event.description && event.description.length > 100 && (
                  <button onClick={() => setExpandedDescId(isExpanded ? null : event._id)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', padding: '8px 0 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    {isExpanded ? 'View Less' : 'Read More'} {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>

              {/* ACTION FOOTER */}
              <div style={{ padding: '20px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: syncedEvents.has(event._id) ? '#10b981' : 'var(--bg-primary)', 
                  color: syncedEvents.has(event._id) ? '#fff' : 'var(--text-primary)', 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  cursor: isSyncing ? 'not-allowed' : 'pointer', 
                  opacity: isSyncing ? 0.7 : 1,
                  transition: 'background 0.3s ease',
                  border: syncedEvents.has(event._id) ? '1px solid #10b981' : '1px solid var(--border-color)'
                }}>
                  {isSyncing ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : syncedEvents.has(event._id) ? (
                    <CheckCircle size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                  {isSyncing ? 'Syncing...' : syncedEvents.has(event._id) ? 'Uploaded' : 'Sync CSV'}
                  <input type="file" accept=".csv" onChange={(e) => handleCSVUpload(e, event._id)} style={{ display: 'none' }} disabled={isSyncing} />
                </label>

                {/* EDIT & DELETE GROUP */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEditClick(event)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600', padding: '8px' }}>
                    <Edit3 size={18} /> Edit
                  </button>
                  <button onClick={() => handleDelete(event._id, event.title)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600', padding: '8px' }}>
                    <Trash2 size={18} /> Delete
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminEvents;