import { useState, useEffect } from 'react';
import MediaImage from '../../components/common/MediaImage';
// ADDED Download icon
import { Trash2, CheckCircle, Plus, UploadCloud, Loader2, ChevronDown, ChevronUp, Edit3, Download } from 'lucide-react';

// --- CUSTOM BRAND SVG TO PREVENT LUCIDE CRASHES ---
const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

// --- NATIVE BROWSER IMAGE COMPRESSOR ---
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
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

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const AdminSpeakers = () => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [expandedBioId, setExpandedBioId] = useState(null); 
  
  const [editingId, setEditingId] = useState(null);

  const initialFormState = { name: '', designation: '', company: '', bio: '', imageBase64: '', linkedinUrl: '' };
  const [formData, setFormData] = useState(initialFormState);

  const fetchSpeakers = async () => {
    try {
      const res = await fetch('/api/v1/speakers');
      const data = await res.json();
      if (data.success) setSpeakers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpeakers(); }, []);

  const handleEditClick = (speaker) => {
    setFormData({
      name: speaker.name,
      designation: speaker.designation,
      company: speaker.company,
      bio: speaker.bio,
      linkedinUrl: speaker.linkedinUrl || '',
      imageBase64: '' 
    });
    setEditingId(speaker._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedBase64 = await compressImage(file, 800, 0.7);
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
    
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `/api/v1/speakers/${editingId}` : '/api/v1/speakers';

    try {
      const payload = { ...formData, status: 'Approved' };
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setFormData(initialFormState);
        setEditingId(null);
        setIsFormOpen(false);
        fetchSpeakers();
      } else {
        alert('Failed to save: ' + data.error);
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/v1/speakers/${id}/approve`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        fetchSpeakers();
        setExpandedBioId(null); 
      }
    } catch (err) {
      alert('Network error while approving.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/v1/speakers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchSpeakers();
    } catch (err) {
      alert('Network error while deleting.');
    }
  };

  // --- NEW: Helper to force-download the image rather than opening in new tab ---
  const handleDownloadPhoto = async (photoUrl, speakerName) => {
    if (!photoUrl) return;
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      // Cleans the name for the file (e.g. "Jane Doe" -> "Jane_Doe_ProfilePic.jpg")
      link.download = `${speakerName.replace(/\s+/g, '_')}_ProfilePic.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback if CDN strictly blocks cross-origin fetch
      window.open(photoUrl, '_blank');
    }
  };

  if (loading) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading directory...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-sans)', paddingBottom: '80px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>Speaker Directory</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Review pending applications and manage approved speakers.</p>
        </div>
        <button 
          onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData(initialFormState); }} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: isFormOpen ? 'var(--bg-secondary)' : '#3b82f6', color: isFormOpen ? 'var(--text-primary)' : '#fff', border: isFormOpen ? '1px solid var(--border-color)' : 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
        >
          {isFormOpen ? 'Cancel' : <><Plus size={18} /> Add Speaker Manually</>}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.3rem' }}>{editingId ? 'Edit Speaker Profile' : 'Add Speaker Profile'}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <input className="admin-input" required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input className="admin-input" required placeholder="Company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            <input className="admin-input" required placeholder="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
            <input className="admin-input" type="url" placeholder="LinkedIn URL" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isCompressing ? 'not-allowed' : 'pointer', padding: '16px', border: formData.imageBase64 ? '2px solid #10b981' : '2px dashed var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', transition: 'all 0.2s' }}>
              {isCompressing ? (
                <><Loader2 size={20} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} /> <span style={{ color: '#3b82f6', fontWeight: '500' }}>Compressing Image...</span><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style></>
              ) : formData.imageBase64 ? (
                <><CheckCircle size={20} color="#10b981" /> <span style={{ color: '#10b981', fontWeight: '500' }}>Image Ready</span></>
              ) : (
                <><UploadCloud size={20} color="var(--text-secondary)" /> <span style={{ color: 'var(--text-secondary)' }}>{editingId ? 'Replace Profile Photo (.jpg, .png)' : 'Upload Profile Photo (.jpg, .png)'}</span></>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isCompressing} />
            </label>
          </div>

          <textarea className="admin-input" required placeholder="Biography" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ minHeight: '120px', marginBottom: '24px', resize: 'vertical' }} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={uploading || isCompressing} style={{ padding: '12px 28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: (uploading || isCompressing) ? 'not-allowed' : 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              {uploading ? 'Uploading to GitHub...' : editingId ? 'Update Speaker' : 'Save & Approve'}
            </button>
          </div>
        </form>
      )}

      {/* Grid Layout utilizing .admin-card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {speakers.map(speaker => {
          const isPending = speaker.status === 'Pending';
          const isExpanded = expandedBioId === speaker._id;

          return (
            <div key={speaker._id} className="admin-card" style={{ border: isPending ? '2px solid #eab308' : '1px solid var(--border-color)' }}>
              
              <div style={{ display: 'flex', padding: '24px', gap: '20px', alignItems: 'flex-start' }}>
                <MediaImage src={speaker.photoUrl} alt={speaker.name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-light)' }} />
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{speaker.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{speaker.designation}</p>
                  <p style={{ margin: '2px 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{speaker.company}</p>
                  {isPending && <span style={{ background: '#fef08a', color: '#854d0e', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '99px', fontWeight: '700', display: 'inline-block' }}>Action Required</span>}
                </div>
              </div>

              <div style={{ padding: '0 24px 20px', flexGrow: 1, borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                
                {speaker.linkedinUrl && (
                  <a href={speaker.linkedinUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#3b82f6', textDecoration: 'none', marginBottom: '12px' }}>
                    <LinkedinIcon size={16} /> View LinkedIn Profile
                  </a>
                )}

                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  display: isExpanded ? 'block' : '-webkit-box', 
                  WebkitLineClamp: isExpanded ? 'unset' : 2, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden'
                }}>
                  {speaker.bio || 'No biography provided.'}
                </div>

                {speaker.bio && speaker.bio.length > 100 && (
                  <button 
                    onClick={() => setExpandedBioId(isExpanded ? null : speaker._id)}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', padding: '8px 0 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isExpanded ? 'Show Less' : 'Read Full Bio'} {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>
              
              {/* UPDATED: Action Footer layout to accommodate the download button */}
              <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                
                {/* Download Button */}
                <button 
                  onClick={() => handleDownloadPhoto(speaker.photoUrl, speaker.name)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', padding: '4px 0' }}
                  title="Download Profile Picture"
                >
                  <Download size={16} /> Photo
                </button>

                {/* Edit / Approve / Delete Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {isPending && (
                    <button onClick={() => handleApprove(speaker._id)} style={{ background: '#10b981', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', padding: '8px 16px', borderRadius: '6px', transition: 'opacity 0.2s' }}>
                      <CheckCircle size={16} /> Approve
                    </button>
                  )}
                  {!isPending && (
                    <button onClick={() => handleEditClick(speaker)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                      <Edit3 size={16} /> Edit
                    </button>
                  )}
                  <button onClick={() => handleDelete(speaker._id, speaker.name)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', padding: '8px', marginLeft: isPending ? '0' : '4px' }}>
                    <Trash2 size={16} /> {isPending ? 'Reject & Delete' : 'Delete'}
                  </button>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
      
      {speakers.length === 0 && !loading && (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
          No speakers found in the directory.
        </div>
      )}
      
    </div>
  );
};

export default AdminSpeakers;