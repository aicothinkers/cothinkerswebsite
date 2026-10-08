import { useState } from 'react';
import { Users, Code, Globe, Sparkles, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const About = () => {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ loading: false, success: '', error: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubStatus({ loading: true, success: '', error: '' });

    try {
      const res = await fetch('/api/v1/community/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await res.json();

      if (result.success) {
        setSubStatus({ loading: false, success: 'Welcome aboard! You are officially part of aiCo-thinkers.', error: '' });
        setEmail('');
      } else {
        setSubStatus({ loading: false, success: '', error: result.error });
      }
    } catch (err) {
      setSubStatus({ loading: false, success: '', error: 'Network error. Please try again.' });
    }
  };

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', paddingBottom: '100px', overflowX: 'hidden' }}>
      
      <style>{`
        .about-feature-card {
          background: var(--bg-secondary);
          padding: 40px;
          border-radius: 24px;
          border: 1px solid var(--border-color);
          box-shadow: var(--card-shadow);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          box-sizing: border-box;
          width: 100%;
        }

        .newsletter-card {
          background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%);
          border-radius: 28px;
          padding: 48px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justifyContent: space-between;
          gap: 32px;
          box-shadow: 0 25px 50px -12px rgba(6, 78, 59, 0.4);
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          width: 100%;
        }

        .newsletter-info {
          display: flex;
          align-items: center;
          gap: 24px;
          flex: 1 1 320px;
          z-index: 10;
        }

        .newsletter-form-wrapper {
          flex: 1 1 320px;
          max-width: 460px;
          width: 100%;
          z-index: 10;
        }

        .newsletter-form {
          display: flex;
          align-items: center;
          background: #ffffff;
          padding: 6px 6px 6px 18px;
          border-radius: 9999px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
          width: 100%;
          box-sizing: border-box;
        }

        .newsletter-input {
          flex: 1;
          min-width: 0;
          padding: 10px 8px 10px 0;
          border: none;
          background: transparent;
          color: #0f111a;
          outline: none;
          font-size: 0.95rem;
          font-weight: 500;
          width: 100%;
        }

        .newsletter-btn {
          padding: 12px 28px;
          background: #109ab9;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.95rem;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        @media (max-width: 768px) {
          .about-feature-card {
            padding: 24px !important;
            border-radius: 20px !important;
          }

          .newsletter-card {
            padding: 28px 20px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 24px !important;
          }

          .newsletter-info {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            width: 100% !important;
          }

          .newsletter-info h2 {
            font-size: 1.85rem !important;
          }

          .newsletter-form-wrapper {
            max-width: 100% !important;
          }

          .newsletter-form {
            flex-direction: column !important;
            border-radius: 16px !important;
            padding: 12px !important;
            gap: 12px !important;
          }

          .newsletter-input {
            padding: 8px !important;
            text-align: center !important;
            font-size: 1rem !important;
          }

          .newsletter-btn {
            width: 100% !important;
            border-radius: 12px !important;
            padding: 14px !important;
            font-size: 1rem !important;
          }
        }
      `}</style>
      
      {/* Hero Section */}
      <section style={{ backgroundColor: '#090b14', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 185, 0.15), transparent 60%)', padding: '100px 0 80px 0', borderBottom: '1px solid #1e293b', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(16, 160, 185, 0.1)', border: '1px solid rgba(16, 185, 182, 0.2)', fontSize: '0.85rem', fontWeight: '700', color: '#10b6b9', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={14} /> The aiCo-thinkers Manifesto
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.15', marginBottom: '20px', color: '#ffffff' }}>
            Where Technology <br/><span style={{ color: '#10b0b9' }}>Minds Meet.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8', lineHeight: '1.7', margin: '0 auto' }}>
            aiCo-thinkers is an independent technology community bringing students, software engineers, builders, and industry practitioners together through meaningful conversations, live meetups, and open knowledge sharing.
          </p>
        </div>
      </section>

      {/* Mission & Vision Grid */}
      <section className="container" style={{ maxWidth: '1200px', margin: '-40px auto 0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
          
          <div className="about-feature-card">
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Code size={26} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>What We Do</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1rem', margin: 0 }}>
              We host regular editions featuring industry practitioners from product companies, GCCs, and high-growth startups sharing real-world engineering insights, architectural deep-dives, and production failures.
            </p>
          </div>

          <div className="about-feature-card">
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16, 154, 185, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(16, 174, 185, 0.2)' }}>
              <Globe size={26} color="#10b9b6" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1rem', margin: 0 }}>
              Bridging the gap between academic theory and real-world production engineering by creating a collaborative ecosystem for builders. We believe the best way to learn is by interacting with those who are actively building the future.
            </p>
          </div>

        </div>
      </section>

      {/* Community Stats/Trust Bar */}
      <section className="container" style={{ maxWidth: '1200px', margin: '70px auto 0 auto', padding: '0 20px', textAlign: 'center', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '32px' }}>Built for the community, by the community.</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', opacity: 0.9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            <Users size={22} color="#10b6b9" /> Open to All
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            <Code size={22} color="#10b9b9" /> Tech Agnostic
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            <Globe size={22} color="#10b6b9" /> Global Mindset
          </div>
        </div>
      </section>

      {/* NEWSLETTER CTA SECTION */}
      <section id="join" className="container" style={{ maxWidth: '1200px', margin: '80px auto 0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <div className="newsletter-card">
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16, 134, 185, 0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div className="newsletter-info">
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
              <Mail size={28} color="#10b9b9" />
            </div>
            <div>
              <h2 style={{ fontSize: '2.1rem', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                Stay in the Loop
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                Get the latest updates on exclusive events, deep-dive write-ups, and community news.
              </p>
            </div>
          </div>
          
          <div className="newsletter-form-wrapper">
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input 
                type="email" 
                required 
                placeholder="Enter your email address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="newsletter-input"
              />
              <button 
                type="submit" 
                disabled={subStatus.loading}
                className="newsletter-btn"
                onMouseOver={e => e.currentTarget.style.background = '#05968f'}
                onMouseOut={e => e.currentTarget.style.background = '#109ab9'}
              >
                {subStatus.loading ? '...' : 'Subscribe'}
              </button>
            </form>
            
            {subStatus.success && (
              <div style={{ marginTop: '12px', color: '#34bed3', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <CheckCircle size={18} /> {subStatus.success}
              </div>
            )}
            {subStatus.error && (
              <div style={{ marginTop: '12px', color: '#f87171', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <AlertCircle size={18} /> {subStatus.error}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;