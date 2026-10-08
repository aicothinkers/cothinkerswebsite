import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Building, ExternalLink, Clock, X, Eye } from 'lucide-react';

const PublicJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetch('/api/v1/jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success) setJobs(data.data);
      })
      .catch(err => console.error('Failed to fetch jobs:', err))
      .finally(() => setLoading(false));
  }, []);

  // Lock body scroll and listen for Escape key when popup is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedJob(null);
    };

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

  const sanitizeUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
        <Briefcase size={32} color="#3b82f6" />
        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading opportunities...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', paddingBottom: '100px', overflowX: 'hidden' }}>
      
      {/* HEADER SECTION */}
      <section style={{ backgroundColor: '#090b14', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15), transparent 50%)', padding: '100px 0 80px 0', borderBottom: '1px solid #1e293b', marginBottom: '50px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.85rem', fontWeight: '700', color: '#3b82f6', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Briefcase size={14} /> Career Opportunities
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.15', marginBottom: '20px', color: '#ffffff' }}>
            Find Your Next <span style={{ color: '#3b82f6' }}>Role.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: '1.7', margin: '0 auto' }}>
            Hand-picked opportunities shared directly by founders and hiring managers in our community.
          </p>
        </div>
      </section>

      {/* RESPONSIVE JOBS GRID */}
      <section className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
          {jobs.map(job => {
            const isClosed = job.status?.toLowerCase() === 'closed';

            return (
              <div 
                key={job._id} 
                className="hover-lift" 
                style={{ 
                  background: 'var(--bg-primary)', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border-color)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: 'var(--card-shadow)',
                  opacity: isClosed ? 0.75 : 1,
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Top info & status pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building size={24} color={isClosed ? 'var(--text-muted)' : '#3b82f6'} />
                      </div>
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 2px 0', color: 'var(--text-primary)', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.title}
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: isClosed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: isClosed ? '#ef4444' : '#10b981',
                      border: `1px solid ${isClosed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {isClosed ? 'Closed' : 'Active'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '5px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600' }}>
                      <MapPin size={13} /> {job.location || 'Remote'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '5px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600' }}>
                      <Clock size={13} /> {job.type || 'Full-time'}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flexGrow: 1 }}>
                    {job.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      alignSelf: 'flex-start'
                    }}
                  >
                    <Eye size={14} /> View Full Details
                  </button>
                </div>

                {/* Card footer CTA */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)' }}>
                  {isClosed ? (
                    <button 
                      disabled 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        width: '100%', 
                        background: 'var(--bg-secondary)', 
                        color: 'var(--text-muted)', 
                        border: '1px solid var(--border-color)', 
                        padding: '12px', 
                        borderRadius: '10px', 
                        fontWeight: '700', 
                        fontSize: '0.9rem', 
                        cursor: 'not-allowed',
                        opacity: 0.7
                      }}
                    >
                      Applications Closed
                    </button>
                  ) : (
                    <a 
                      href={sanitizeUrl(job.applyUrl)} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '6px', 
                        width: '100%', 
                        background: '#3b82f6', 
                        color: '#fff', 
                        padding: '12px', 
                        borderRadius: '10px', 
                        textDecoration: 'none', 
                        fontWeight: '700', 
                        fontSize: '0.92rem', 
                        transition: 'background 0.2s',
                        boxSizing: 'border-box'
                      }} 
                      onMouseOver={e => e.currentTarget.style.background = '#2563eb'} 
                      onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}
                    >
                      Apply Now <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {jobs.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
            <Briefcase size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>No open roles right now</h3>
            <p style={{ margin: 0, fontSize: '0.92rem' }}>Check back later. We post new opportunities as they arise in the community.</p>
          </div>
        )}
      </section>

      {/* POPUP / MODAL COMPONENT */}
      {selectedJob && (
        <div 
          onClick={() => setSelectedJob(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-primary, #ffffff)',
              color: 'var(--text-primary)',
              borderRadius: '20px',
              border: '1px solid var(--border-color, #e2e8f0)',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light, #f1f5f9)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building size={22} color="#3b82f6" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 2px 0', lineHeight: '1.2' }}>{selectedJob.title}</h2>
                  <p style={{ margin: 0, color: '#3b82f6', fontWeight: '600', fontSize: '0.9rem' }}>{selectedJob.company}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedJob(null)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  flexShrink: 0
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flexGrow: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600' }}>
                  <MapPin size={13} /> {selectedJob.location || 'Remote'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600' }}>
                  <Clock size={13} /> {selectedJob.type || 'Full-time'}
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  textTransform: 'uppercase',
                  background: selectedJob.status?.toLowerCase() === 'closed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: selectedJob.status?.toLowerCase() === 'closed' ? '#ef4444' : '#10b981',
                  border: `1px solid ${selectedJob.status?.toLowerCase() === 'closed' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
                }}>
                  Status: {selectedJob.status?.toLowerCase() === 'closed' ? 'Closed' : 'Active'}
                </span>
              </div>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>About the Role</h4>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {selectedJob.description}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light, #f1f5f9)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={() => setSelectedJob(null)}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}
              >
                Close
              </button>

              {selectedJob.status?.toLowerCase() === 'closed' ? (
                <button 
                  disabled 
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    background: 'var(--border-color)', 
                    color: 'var(--text-muted)', 
                    border: 'none', 
                    fontWeight: '700', 
                    fontSize: '0.9rem',
                    cursor: 'not-allowed' 
                  }}
                >
                  Applications Closed
                </button>
              ) : (
                <a 
                  href={sanitizeUrl(selectedJob.applyUrl)} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    background: '#3b82f6', 
                    color: '#fff', 
                    textDecoration: 'none', 
                    fontWeight: '700',
                    fontSize: '0.9rem'
                  }} 
                >
                  Apply for this role <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicJobs;