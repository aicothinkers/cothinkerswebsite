import { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, Trash2, Plus, Power, Eye, X, ExternalLink, Edit3 } from 'lucide-react';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // NEW: Track if we are editing an existing job
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = { 
    title: '', company: '', location: '', type: 'Full-time', description: '', applyUrl: '', status: 'Open'
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/v1/jobs');
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchJobs(); 
  }, []);

  // Lock body scroll when admin detail modal is open
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setSelectedJob(null); };
    if (selectedJob) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedJob]);

  // NEW: Handle Edit Button Click
  const handleEditClick = (job) => {
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      description: job.description,
      applyUrl: job.applyUrl,
      status: job.status
    });
    setEditingId(job._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    // NEW: Determine if we are Creating (POST) or Updating (PUT)
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `/api/v1/jobs/${editingId}` : '/api/v1/jobs';

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
        fetchJobs();
      } else { 
        alert('Failed: ' + data.error); 
      }
    } catch (err) { 
      alert('Network error'); 
    } finally { 
      setUploading(false); 
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`/api/v1/jobs/${id}/status`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        fetchJobs();
      }
    } catch (err) { 
      alert('Network error'); 
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete ${title}?`)) return;
    try {
      await fetch(`/api/v1/jobs/${id}`, { method: 'DELETE' });
      fetchJobs();
    } catch (err) { 
      alert('Network error'); 
    }
  };

  const sanitizeUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  if (loading) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading jobs...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px 20px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>Job Board Management</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Post and manage opportunities for the community.</p>
        </div>
        <button 
          onClick={isFormOpen ? handleCancel : () => setIsFormOpen(true)} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
            background: isFormOpen ? 'var(--bg-secondary)' : '#3b82f6', 
            color: isFormOpen ? 'var(--text-primary)' : '#fff', 
            border: isFormOpen ? '1px solid var(--border-color)' : 'none', 
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600' 
          }}
        >
          {isFormOpen ? 'Cancel' : <><Plus size={18} /> Post Job</>}
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem' }}>
            {editingId ? 'Edit Job Posting' : 'Create New Job Posting'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>Job Title *</label>
              <input className="admin-input" required placeholder="e.g. Senior Frontend Engineer" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>Company Name *</label>
              <input className="admin-input" required placeholder="e.g. Acme Corp" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>Location *</label>
              <input className="admin-input" required placeholder="e.g. Remote, or Bangalore" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>Employment Type *</label>
              <select className="admin-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>Apply URL *</label>
              <input className="admin-input" type="url" required placeholder="https://careers.company.com/..." value={formData.applyUrl} onChange={e => setFormData({...formData, applyUrl: e.target.value})} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>Job Description *</label>
            <textarea className="admin-input" required placeholder="Requirements, responsibilities, perks..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ minHeight: '120px', resize: 'vertical' }} />
          </div>

          <button type="submit" disabled={uploading} style={{ padding: '12px 28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '700' }}>
            {uploading ? 'Saving...' : editingId ? 'Update Job' : 'Post Job'}
          </button>
        </form>
      )}

      {/* JOBS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {jobs.map(job => {
          const isJobOpen = (job.status || 'Open').toLowerCase() === 'open';

          return (
            <div key={job._id} className="admin-card" style={{ opacity: isJobOpen ? 1 : 0.75 }}>
              <div style={{ padding: '24px', flexGrow: 1 }}>
                {/* Header with Title & Status Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building size={22} color={isJobOpen ? '#3b82f6' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 2px 0', fontSize: '1.15rem', fontWeight: '700' }}>{job.title}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.88rem' }}>{job.company}</p>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.04em',
                    background: isJobOpen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isJobOpen ? '#10b981' : '#ef4444',
                    border: `1px solid ${isJobOpen ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`, whiteSpace: 'nowrap'
                  }}>
                    {isJobOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                {/* Metadata */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>
                    <MapPin size={12}/> {job.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>
                    <Briefcase size={12}/> {job.type}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 12px 0' }}>
                  {job.description}
                </p>

                <button type="button" onClick={() => setSelectedJob(job)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} /> View Details
                </button>
              </div>
              
              {/* Bottom Card Controls */}
              <div style={{ padding: '14px 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => toggleStatus(job._id)} style={{ background: 'transparent', border: 'none', color: isJobOpen ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                    <Power size={15} /> {isJobOpen ? 'Close' : 'Open'}
                  </button>
                  <button onClick={() => handleEditClick(job)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                    <Edit3 size={15} /> Edit
                  </button>
                </div>

                <button onClick={() => handleDelete(job._id, job.title)} style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {jobs.length === 0 && (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
          <Briefcase size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>No listings posted yet</h3>
        </div>
      )}

      {/* ADMIN DETAIL POPUP */}
      {selectedJob && (
        <div onClick={() => setSelectedJob(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-primary, #ffffff)', color: 'var(--text-primary)', borderRadius: '20px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: '800' }}>{selectedJob.title}</h3>
                <p style={{ margin: 0, color: '#3b82f6', fontWeight: '600' }}>{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flexGrow: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                <span style={{ background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>{selectedJob.location}</span>
                <span style={{ background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>{selectedJob.type}</span>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Apply URL</h4>
                <a href={sanitizeUrl(selectedJob.applyUrl)} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{selectedJob.applyUrl} <ExternalLink size={14} /></a>
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Description</h4>
                <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{selectedJob.description}</div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedJob(null)} style={{ padding: '10px 20px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;