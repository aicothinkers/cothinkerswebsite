import { useState } from 'react';
import { UploadCloud, CheckCircle, Loader2, User } from 'lucide-react';

// --- NATIVE BROWSER IMAGE COMPRESSOR (< 1MB Guarantee) ---
const compressImageToUnder1MB = (file, maxWidth = 800) => {
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

        let quality = 0.9; // Start at 90% quality
        let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // Estimate bytes in Base64 string: (string.length * 3) / 4
        let estimatedBytes = (compressedBase64.length * 3) / 4;

        // Loop: If it's over 1,000,000 bytes (1MB), reduce quality until it fits
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

const ApplySpeaker = () => {
  const [formData, setFormData] = useState({ name: '', designation: '', company: '', bio: '', imageBase64: '', linkedinUrl: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    setStatus({ ...status, error: '' });

    try {
      const compressedBase64 = await compressImageToUnder1MB(file, 800);
      setFormData({ ...formData, imageBase64: compressedBase64 });
    } catch (err) {
      setStatus({ ...status, error: 'Failed to process image. Please try another file.' });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageBase64) {
      setStatus({ ...status, error: 'Please upload a professional headshot.' });
      return;
    }

    setStatus({ loading: true, success: false, error: '' });

    try {
      const res = await fetch('/api/v1/speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'Pending' })
      });
      const data = await res.json();

      if (data.success) {
        setStatus({ loading: false, success: true, error: '' });
      } else {
        setStatus({ loading: false, success: false, error: data.error });
      }
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Network error occurred.' });
    }
  };

  if (status.success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '60px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}>
          <CheckCircle size={80} color="#109ab9" style={{ margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '-0.02em' }}>Application Received!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Our team will review your profile and reach out shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Mobile Responsive CSS & Input Focus Styles */}
      <style>
        {`
          .responsive-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
          }
          .custom-input {
            width: 100%;
            padding: 14px 16px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: 'var(--text-primary)';
            outline: none;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 0.95rem;
          }
          .custom-input:focus {
            border-color: #10abb9;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
          }
          @media (max-width: 650px) {
            .responsive-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
          }
        `}
      </style>

      {/* Ambient Background Glow */}
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '400px', background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ maxWidth: '750px', margin: '80px auto', padding: '0 24px', position: 'relative', zIndex: 1, fontFamily: 'var(--font-sans)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(16, 126, 185, 0.1)', color: '#10abb9', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
            <User size={14} /> Call for Speakers
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            Share your expertise.
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Join industry leaders, visionary founders, and top engineers to share your knowledge with our premier community.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: 'clamp(24px, 5vw, 48px)', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}>
          
          <div className="responsive-grid">
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name *</label>
              <input required className="custom-input" placeholder="e.g. Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>LinkedIn Profile URL *</label>
              <input required type="url" className="custom-input" placeholder="https://linkedin.com/in/..." value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Company *</label>
              <input required className="custom-input" placeholder="e.g. Google, Stripe" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Designation / Title *</label>
              <input required className="custom-input" placeholder="e.g. Senior Data Scientist" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Professional Headshot *</label>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', border: formData.imageBase64 ? '2px solid #10b981' : '2px dashed var(--border-color)', borderRadius: '16px', background: 'var(--bg-primary)', cursor: isCompressing ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
              
              {isCompressing ? (
                <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Loader2 size={40} color="#3b82f6" style={{ marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontWeight: '600', color: '#3b82f6', fontSize: '1.1rem' }}>Optimizing Image...</span>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
              ) : formData.imageBase64 ? (
                <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={formData.imageBase64} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px', border: '3px solid #10abb9', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
                  <span style={{ fontWeight: '700', color: '#108fb9', fontSize: '1.1rem' }}>Perfect. Image is optimized.</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>Click to upload a different photo</span>
                </div>
              ) : (
                <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <UploadCloud size={32} color="#1086b9" />
                  </div>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Click to upload a high-quality photo</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>We will automatically compress it to load instantly.</span>
                </div>
              )}

              {/* Faint background image if selected */}
              {formData.imageBase64 && !isCompressing && (
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${formData.imageBase64})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)', opacity: 0.1, zIndex: 1 }} />
              )}

              <input required={!formData.imageBase64} type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isCompressing} />
            </label>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Short Biography *</label>
            <textarea required className="custom-input" placeholder="Tell us about your background, achievements, and what you are passionate about..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ minHeight: '150px', resize: 'vertical' }} />
          </div>

          {status.error && (
            <div style={{ color: '#ef4444', marginBottom: '24px', fontSize: '0.95rem', background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '8px', fontWeight: '500' }}>
              {status.error}
            </div>
          )}

          <button type="submit" disabled={status.loading || isCompressing} style={{ width: '100%', padding: '16px', background: '#109ab9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '700', cursor: (status.loading || isCompressing) ? 'not-allowed' : 'pointer', transition: 'background 0.3s ease', boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.4)' }}>
            {status.loading ? 'Uploading Profile to GitHub...' : 'Submit Speaker Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplySpeaker;