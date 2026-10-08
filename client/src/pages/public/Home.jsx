import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Users, Building, Award, CheckCircle, AlertCircle, Lightbulb, Zap, TrendingUp, Mail, Video, Newspaper, Edit3, ShieldCheck, Flame } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

const Home = () => {
  const [data, setData] = useState({
    upcomingEvent: null,
    attendees: [],
    recentWriteUps: [],
    previousEvents: [],
    aiBlogs: [],
    sessions: [],
    speakers: [],
    stats: { coThinkers: 0, editions: 0, speakers: 0, companies: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ loading: false, success: '', error: '' });
  
  // State for the new Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [eventsRes, writeUpsRes, speakersRes, aiBlogsRes, sessionsRes] = await Promise.all([
          fetch('/api/v1/events').catch(() => ({ ok: false })),
          fetch('/api/v1/content/write-ups').catch(() => ({ ok: false })),
          fetch('/api/v1/speakers').catch(() => ({ ok: false })),
          fetch('/api/v1/content/ai-blog').catch(() => ({ ok: false })), 
          fetch('/api/v1/content/sessions').catch(() => ({ ok: false }))
        ]);

        const parseData = async (res) => {
          if (!res || !res.ok) return [];
          const json = await res.json();
          return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        };

        const events = await parseData(eventsRes);
        const writeUps = await parseData(writeUpsRes);
        const speakers = await parseData(speakersRes);
        const aiBlogs = await parseData(aiBlogsRes);
        const sessions = await parseData(sessionsRes);

        const upcoming = events.find(e => e.status === 'Published') || events[0] || null;
        const past = events.filter(e => e._id !== upcoming?._id).slice(0, 3);

        let eventAttendees = [];
        if (upcoming) {
          const attRes = await fetch(`/api/v1/attendees/event/${upcoming._id}`).catch(() => ({ ok: false }));
          if (attRes.ok) {
            const attData = await attRes.json();
            if (attData.success && attData.data) {
              eventAttendees = attData.data; 
            }
          }
        }

        setData({
          upcomingEvent: upcoming,
          attendees: eventAttendees,
          recentWriteUps: writeUps.slice(0, 3), 
          previousEvents: past,
          aiBlogs: aiBlogs.slice(0, 3), 
          sessions: sessions.slice(0, 3), 
          speakers: speakers, 
          stats: {
            coThinkers: 412,
            editions: events.filter(e => e.status === 'Completed').length || 4,
            speakers: speakers.length,
            companies: new Set(speakers.map(s => s.company).filter(Boolean)).size || 31
          }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Countdown Timer Logic
  useEffect(() => {
    if (!data.upcomingEvent?.date) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(data.upcomingEvent.date) - +new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [data.upcomingEvent]);

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

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getInitials = (name) => {
    if (!name) return 'CT';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Helper to format dynamic event title safely
  const renderDynamicHeadline = () => {
    if (data.upcomingEvent && data.upcomingEvent.title) {
      // Split the title roughly in half to wrap it cleanly over two lines
      const words = data.upcomingEvent.title.split(' ');
      const middle = Math.ceil(words.length / 2);
      const part1 = words.slice(0, middle).join(' ');
      const part2 = words.slice(middle).join(' ');

      return (
        <>
          {part1} <br />
          <span className="hero-accent" style={{ fontWeight: '600' }}>{part2}</span>
        </>
      );
    }
    
    // Fallback if no event is scheduled
    return (
      <>
        Build Tech <span className="hero-accent" style={{ fontWeight: '600' }}>Solutions</span>,<br /> not just software.
      </>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', gap: '16px' }}>
        <Zap size={32} color="#06b6d4" style={{ animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading aiCo-thinkers...</span>
      </div>
    );
  }

  const marqueeSpeakers = [...data.speakers, ...data.speakers, ...data.speakers, ...data.speakers];

  const baseAttendees = data.attendees.length > 0 ? data.attendees : [
    { name: 'Aarav Sharma', designation: 'AI Engineer @ Microsoft' },
    { name: 'Priya Patel', designation: 'Full Stack Dev @ Google' },
    { name: 'Rahul Verma', designation: 'Founder @ TechLabs' },
    { name: 'Ananya Iyer', designation: 'Data Scientist @ Amazon' },
    { name: 'Kiran Kumar', designation: 'Cloud Architect' },
    { name: 'Sneha Reddy', designation: 'ML Researcher' },
    { name: 'Vikram Singh', designation: 'Software Engineer @ Stripe' },
    { name: 'Divya Nair', designation: 'Product Designer' },
    { name: 'Arjun Das', designation: 'Backend Lead @ Zeta' },
    { name: 'Meera Menon', designation: 'DevOps Engineer' }
  ];

  const midPoint = Math.ceil(baseAttendees.length / 2);
  const column1Data = [...baseAttendees.slice(0, midPoint), ...baseAttendees.slice(0, midPoint), ...baseAttendees.slice(0, midPoint)];
  const column2Data = [...baseAttendees.slice(midPoint), ...baseAttendees.slice(midPoint), ...baseAttendees.slice(midPoint)];

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      
      {/* NATIVE CSS ANIMATIONS & FULL RESPONSIVE QUERIES */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scrollHorizontal {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scrollVerticalUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes scrollVerticalDown {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.15); }
            50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.35); }
          }
          @keyframes ping {
            75%, 100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes buttonPulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7); }
            70% { transform: scale(1.03); box-shadow: 0 0 0 12px rgba(6, 182, 212, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
          }

          /* RESPONSIVE HERO CLASSES */
          .hero-grid-bg {
            background-size: 40px 40px;
            background-image:
              linear-gradient(to right, rgba(150, 150, 150, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(150, 150, 150, 0.1) 1px, transparent 1px);
            background-position: center top;
          }
          .hero-serif {
            font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          }
          .hero-accent {
            color: #06b6d4; 
          }
          .hero-cursive {
            font-family: 'Caveat', 'Comic Sans MS', cursive;
            transform: rotate(-8deg);
            display: inline-block;
            position: absolute;
            right: -40px;
            bottom: 0;
          }

          /* RESPONSIVE COUNTDOWN */
          .hero-countdown {
            display: flex;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08);
            margin-bottom: 48px;
          }
          .countdown-item {
            padding: 16px 28px;
            text-align: center;
            min-width: 100px;
            border-right: 1px solid var(--border-color);
          }
          .countdown-item:last-child {
            border-right: none;
          }

          /* RESPONSIVE TICKER GRID */
          .dual-ticker-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .ticker-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            pointer-events: none;
          }

          /* MEDIA QUERIES FOR MOBILE DEVICES */
          @media (max-width: 768px) {
            .hero-countdown {
              flex-wrap: wrap; /* Allows 2x2 grid on mobile */
            }
            .countdown-item {
              width: 50%;
              min-width: auto;
              padding: 16px 10px;
              border-right: none;
              border-bottom: 1px solid var(--border-color);
            }
            .countdown-item:nth-child(odd) {
              border-right: 1px solid var(--border-color);
            }
            .countdown-item:nth-child(3),
            .countdown-item:nth-child(4) {
              border-bottom: none;
            }
            .hero-cursive {
              right: 0; /* Prevents horizontal scroll */
              bottom: -30px;
            }
            .dual-ticker-grid {
              grid-template-columns: 1fr; /* Stacks vertical scrollers into 1 column */
            }
            .vertical-ticker-wrapper {
              height: 280px !important; /* Shorter ticker on mobile */
            }
            .pulse-cta {
              width: 100%;
              justify-content: center;
            }
            .hero-grid-bg {
              padding: 60px 16px !important;
            }
          }

          .live-ping {
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          .glow-container {
            animation: pulseGlow 5s ease-in-out infinite;
          }
          .pulse-cta {
            animation: buttonPulse 2.5s infinite;
          }
          .animate-fade-in {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .delay-1 { animation-delay: 0.1s; opacity: 0; }
          .delay-2 { animation-delay: 0.2s; opacity: 0; }
          .delay-3 { animation-delay: 0.3s; opacity: 0; }

          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .hover-lift:hover {
            transform: translateY(-6px);
            box-shadow: var(--card-shadow-hover);
          }
          
          .custom-marquee-container {
            overflow: hidden;
            white-space: nowrap;
            width: 100%;
            display: flex;
            position: relative;
          }
          .custom-marquee-container::before,
          .custom-marquee-container::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            width: 120px;
            z-index: 2;
            pointer-events: none;
          }
          .custom-marquee-container::before {
            left: 0;
            background: linear-gradient(to right, var(--bg-primary), transparent);
          }
          .custom-marquee-container::after {
            right: 0;
            background: linear-gradient(to left, var(--bg-primary), transparent);
          }
          .custom-marquee-track {
            display: flex;
            gap: 24px;
            padding: 20px 0;
            width: max-content;
            animation: scrollHorizontal 45s linear infinite;
          }
          .custom-marquee-track:hover {
            animation-play-state: paused;
          }

          .vertical-ticker-wrapper {
            height: 420px;
            overflow: hidden;
            position: relative;
            mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          }
          .vertical-track-up {
            display: flex;
            flex-direction: column;
            gap: 16px;
            animation: scrollVerticalUp 105s linear infinite;
          }
          .vertical-track-down {
            display: flex;
            flex-direction: column;
            gap: 16px;
            animation: scrollVerticalDown 105s linear infinite;
          }
          .vertical-ticker-wrapper:hover .vertical-track-up,
          .vertical-ticker-wrapper:hover .vertical-track-down {
            animation-play-state: paused;
          }

          .speaker-pill {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 10px 32px 10px 10px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 100px;
            text-decoration: none;
            color: inherit;
            flex-shrink: 0;
            width: 280px;
          }
          .speaker-avatar-wrap {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            padding: 3px;
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            flex-shrink: 0;
          }
          .speaker-avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--bg-secondary);
          }
          .speaker-info {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            width: 100%;
          }
          .speaker-name {
            font-size: 1.05rem;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 2px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .speaker-company {
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin: 0;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}
      </style>

      {/* ================================================================================= */}
      {/* SECTION 1 — NEW DESIGN: CLEAN GRID, COUNTDOWN, SERIF TYPOGRAPHY & REGISTRATION FORM */}
      {/* ================================================================================= */}
      <section className="hero-grid-bg animate-fade-in" style={{ padding: '80px 20px 120px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '90vh' }}>
        
        {/* Event Meta Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 20px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '48px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <span style={{ display: 'flex', height: '8px', width: '8px', position: 'relative' }}>
            <span className="live-ping" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#06b6d4', opacity: 0.7 }}></span>
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: '#06b6d4' }}></span>
          </span>
          {data.upcomingEvent ? `THE AICO-THINKERS WORKSHOP • ${new Date(data.upcomingEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • ${new Date(data.upcomingEvent.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'AICO-THINKERS • UPCOMING EDITION'}
        </div>

        {/* Dynamic Massive Serif Headline */}
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: '1000px', marginBottom: '40px' }}>
          <h1 className="hero-serif" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: '500', color: 'var(--text-primary)', margin: 0, lineHeight: '1.1', letterSpacing: '-0.02em' }}>
            
            {renderDynamicHeadline()}
            
            {/* Handwriting annotation */}
            <span className="hero-cursive hero-accent" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: '1', right: '-20px' }}>
              #{data.upcomingEvent?.edition || '2'}<br/>
              <span style={{ fontSize: '0.5em', display: 'block', transform: 'translateX(10px)' }}>edition</span>
            </span>
          </h1>
        </div>

        {/* Real-time Responsive Countdown Timer */}
        {data.upcomingEvent && (
          <div className="hero-countdown">
            {[
              { label: 'DAYS', value: timeLeft.days },
              { label: 'HOURS', value: timeLeft.hours },
              { label: 'MIN', value: timeLeft.minutes },
              { label: 'SEC', value: timeLeft.seconds }
            ].map((time) => (
              <div key={time.label} className="countdown-item">
                <div className="hero-accent" style={{ fontSize: '2.5rem', fontWeight: '600', lineHeight: '1' }}>
                  {time.value.toString().padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.1em', marginTop: '8px' }}>
                  {time.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Description & Bullets */}
        <div style={{ maxWidth: '650px', width: '100%', marginBottom: '48px' }}>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: '1.6', textAlign: 'center', marginBottom: '24px' }}>
            A free live workshop for builders. No fluff. We map out the <strong style={{ color: 'var(--text-primary)' }}>mental models</strong>, the <strong style={{ color: 'var(--text-primary)' }}>components every scalable system is made of</strong>, and then build them live in front of you.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              "Network directly with industry builders in real time",
              "Live architectural teardowns and Q&A as long as it takes",
              "Recordings and write-ups if you can't make it live"
            ].map((bullet, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#06b6d4', marginTop: '6px' }}>●</span> {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Form Registration Block Replica */}
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
          {data.upcomingEvent?.registerUrl ? (
            <a 
              href={data.upcomingEvent.registerUrl} 
              target="_blank"
              rel="noreferrer"
              className="pulse-cta"
              style={{ 
                display: 'block', 
                width: '100%', 
                background: '#06b6d4', 
                color: '#ffffff', 
                textAlign: 'center', 
                padding: '16px', 
                borderRadius: '6px', 
                fontSize: '1.1rem',
                fontWeight: '700', 
                textDecoration: 'none',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
            >
              Save my free seat
            </a>
          ) : (
            <Link 
              to={data.upcomingEvent ? `/events/${data.upcomingEvent.slug}` : '/events'} 
              className="pulse-cta"
              style={{ 
                display: 'block', 
                width: '100%', 
                background: '#06b6d4', 
                color: '#ffffff', 
                textAlign: 'center', 
                padding: '16px', 
                borderRadius: '6px', 
                fontSize: '1.1rem',
                fontWeight: '700', 
                textDecoration: 'none',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
            >
              Learn More
            </Link>
          )}
          
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', lineHeight: '1.8', marginBottom: '16px' }}>
            PERSONAL JOIN LINK BY EMAIL • LIVE CHAT + Q&A • RUNS IN THE BROWSER • RECORDING IF YOU CAN'T MAKE IT LIVE
          </div>
          
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.5' }}>
            Registering also notifies you for future aiCo-thinkers editions. You can unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* SECTION 2 — IMPACT STATS */}
      <section className="animate-fade-in delay-2" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '60px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', justifyContent: 'center' }}>
          {[
            { icon: <Users size={32} color="#06b6d4" />, value: `${data.stats.coThinkers}+`, label: 'Co-Thinkers' },
            { icon: <Calendar size={32} color="#3b82f6" />, value: data.stats.editions, label: 'Live Editions' },
            { icon: <Award size={32} color="#8b5cf6" />, value: data.stats.speakers, label: 'Expert Speakers' },
            { icon: <Building size={32} color="#f59e0b" />, value: `${data.stats.companies}+`, label: 'Tech Companies' }
          ].map((stat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <div style={{ padding: '20px', borderRadius: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UNIQUE SECTION: DUAL-COLUMN VERTICAL SCROLL TICKER & EXCLUSIVE REGISTRATION (RESPONSIVE) */}
      <section className="animate-fade-in delay-3" style={{ background: 'var(--bg-secondary)', padding: '80px 0', borderBottom: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '600px', height: '500px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.07) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '0 20px' }}>
          {/* Responsive grid: minmax uses min(100%, 280px) to prevent screen blowout on phones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '40px', alignItems: 'center' }}>
            
            {/* LEFT COLUMN */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: '#06b6d4', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>
                <span style={{ display: 'flex', height: '10px', width: '10px', position: 'relative' }}>
                  <span className="live-ping" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#06b6d4', opacity: 0.7 }}></span>
                  <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '10px', width: '10px', backgroundColor: '#06b6d4' }}></span>
                </span>
                Live Registrations Active ({data.attendees.length > 0 ? data.attendees.length : '45'}+ Confirmed)
              </div>

              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '20px' }}>
                Exclusive Event. <br />
                <span style={{ color: '#06b6d4' }}>Limited Seats Available.</span>
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '36px' }}>
                Watch live as builders, engineers, and tech innovators lock in their spots for our upcoming edition in real-time. Don't miss out on deep-dive tech architectural breakdowns.
              </p>

              {data.upcomingEvent ? (
                <Link 
                  to={`/events/${data.upcomingEvent.slug}`} 
                  className="pulse-cta"
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '12px', 
                    background: '#06b6d4', 
                    color: '#ffffff', 
                    padding: '16px 32px', 
                    borderRadius: '9999px', 
                    fontSize: '1.05rem', 
                    fontWeight: '800', 
                    textDecoration: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.5)', 
                    transition: 'background 0.2s',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#0891b2'}
                  onMouseOut={e => e.currentTarget.style.background = '#06b6d4'}
                >
                  <Flame size={20} color="#eff6ff" /> Hurry Up — Register Now <ArrowRight size={20} />
                </Link>
              ) : (
                <Link 
                  to="/events" 
                  className="pulse-cta"
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '12px', 
                    background: '#06b6d4', 
                    color: '#ffffff', 
                    padding: '16px 32px', 
                    borderRadius: '9999px', 
                    fontSize: '1.05rem', 
                    fontWeight: '800', 
                    textDecoration: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.5)',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#0891b2'}
                  onMouseOut={e => e.currentTarget.style.background = '#06b6d4'}
                >
                  <Flame size={20} color="#eff6ff" /> View Upcoming Events <ArrowRight size={20} />
                </Link>
              )}
            </div>

            {/* RIGHT COLUMN: DUAL-COLUMN TICKER */}
            <div className="glow-container" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '20px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="#06b6d4" /> Live Attendee Feed
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', padding: '4px 10px', borderRadius: '99px' }}>
                  Auto-Syncing
                </span>
              </div>

              <div className="dual-ticker-grid">
                <div className="vertical-ticker-wrapper">
                  <div className="vertical-track-up">
                    {column1Data.map((att, idx) => (
                      <div key={`col1-${idx}`} className="ticker-card">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>
                          {getInitials(att.name)}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.designation || 'Co-Thinker'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="vertical-ticker-wrapper">
                  <div className="vertical-track-down">
                    {column2Data.map((att, idx) => (
                      <div key={`col2-${idx}`} className="ticker-card">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>
                          {getInitials(att.name)}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.designation || 'Co-Thinker'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5 — FEATURED SPEAKERS */}
      {data.speakers.length > 0 && (
        <section style={{ background: 'var(--bg-primary)', padding: '100px 0', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '60px', color: 'var(--text-primary)', textAlign: 'center', letterSpacing: '-0.02em' }}>Hear From Industry Leaders</h2>
          </div>
          
          <div className="custom-marquee-container">
            <div className="custom-marquee-track">
              {marqueeSpeakers.map((speaker, index) => (
                <Link 
                  to={`/speakers/${speaker.slug}`} 
                  key={`${speaker._id}-${index}`} 
                  className="speaker-pill hover-lift"
                >
                  <div className="speaker-avatar-wrap">
                    <MediaImage src={speaker.photoUrl} alt={speaker.name} className="speaker-avatar" />
                  </div>
                  <div className="speaker-info">
                    <h3 className="speaker-name">{speaker.name}</h3>
                    <p className="speaker-company">{speaker.company}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3 — COMMUNITY PILLARS */}
      <section className="container animate-fade-in" style={{ padding: '100px var(--container-padding)' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>Built for the Builders</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>We bridge the gap between academic theory and production engineering.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          {[
            { icon: <Users size={24} color="#06b6d4" />, title: 'Deep Networking', desc: 'Connect directly with peers, senior engineers, and founders in an open, ego-free environment.', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.2)' },
            { icon: <Lightbulb size={24} color="#3b82f6" />, title: 'Knowledge Sharing', desc: 'Learn from real-world case studies, architectural breakdowns, and production failures.', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' },
            { icon: <Video size={24} color="#8b5cf6" />, title: 'Resource Access', desc: 'Get lifetime access to recorded sessions, write-ups, and industry-grade AI research.', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)' },
            { icon: <TrendingUp size={24} color="#f59e0b" />, title: 'Career Acceleration', desc: 'Discover hidden opportunities, get portfolio feedback, and navigate the tech landscape.', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' }
          ].map((pillar, idx) => (
            <div key={idx} className="hover-lift" style={{ display: 'flex', flexDirection: 'column', padding: '32px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: pillar.bg, border: `1px solid ${pillar.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                {pillar.icon}
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>{pillar.title}</h4>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DYNAMIC CONTENT WRAPPER */}
      <div style={{ background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', padding: '100px 0' }}>
        
        {/* SECTION 4.1 — RECENT WRITE-UPS */}
        <section className="container animate-fade-in" style={{ marginBottom: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                <Edit3 size={16} /> Editorials
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Recent Write-Ups</h2>
            </div>
            <Link to="/write-ups" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', background: 'rgba(6, 182, 212, 0.1)', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
              View Archive <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            {data.recentWriteUps.map(article => (
              <Link 
                to={`/write-ups/${article.slug}`} 
                key={article._id} 
                className="hover-lift" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  background: 'var(--bg-primary)', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border-color)', 
                  overflow: 'hidden', 
                  textDecoration: 'none', 
                  color: 'inherit',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {article.coverImage ? (
                  <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--border-light)', overflow: 'hidden' }}>
                    <MediaImage src={article.coverImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit3 size={40} color="var(--text-muted)" opacity={0.5} />
                  </div>
                )}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'inline-block', alignSelf: 'flex-start', fontSize: '0.75rem', fontWeight: '800', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {article.category || 'Technology'}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '800', 
                    color: 'var(--text-primary)', 
                    marginBottom: '12px', 
                    lineHeight: '1.4', 
                    letterSpacing: '-0.01em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
                    {article.summary}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ color: '#06b6d4', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Read <ArrowRight size={14}/>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 4.3 — AI BLOGS (RESPONSIVE & NO IMAGE CROPPING) */}
        <section className="container animate-fade-in" style={{ marginBottom: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                <Newspaper size={16} /> Intelligence
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>AI Research & News</h2>
            </div>
            <Link to="/ai-blog" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', background: 'rgba(139, 92, 246, 0.1)', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
              View Grid <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            {data.aiBlogs.map(blog => (
              <Link 
                to={`/ai-blog/${blog.slug}`} 
                key={blog._id} 
                className="hover-lift" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  background: 'var(--bg-primary)', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border-color)', 
                  overflow: 'hidden', 
                  textDecoration: 'none', 
                  color: 'inherit',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {(blog.coverImage || blog.coverUrl) ? (
                  <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--border-light)', overflow: 'hidden' }}>
                    <MediaImage 
                      src={blog.coverImage || blog.coverUrl} 
                      alt={blog.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
                    />
                  </div>
                ) : (
                  <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lightbulb size={48} color="var(--text-muted)" opacity={0.5} />
                  </div>
                )}

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'inline-block', alignSelf: 'flex-start', fontSize: '0.75rem', fontWeight: '800', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {blog.category || 'Research'}
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                    {blog.title}
                  </h3>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
                    {blog.summary}
                  </p>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ color: '#8b5cf6', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Explore <ArrowRight size={14}/>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

       {/* SECTION 4.4 — RECORDED SESSIONS */}
        <section className="container animate-fade-in" style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                <Video size={16} /> Video Library
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Recorded Sessions</h2>
            </div>
            <Link to="/sessions" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
              Watch All <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            {data.sessions.map(session => {
              const ytId = getYouTubeId(session.youtubeUrl);
              const coverImg = session.coverImage || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null);

              return (
                <Link 
                  to={`/sessions/${session.slug}`} 
                  key={session._id} 
                  className="hover-lift" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    background: 'var(--bg-primary)', 
                    borderRadius: '20px', 
                    border: '1px solid var(--border-color)', 
                    overflow: 'hidden', 
                    textDecoration: 'none', 
                    color: 'inherit',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--border-light)', position: 'relative', overflow: 'hidden' }}>
                    {coverImg ? (
                      <MediaImage src={coverImg} alt={session.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Video size={48} color="var(--text-muted)" opacity={0.5} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.95)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.25)' }}>
                        <Video size={22} color="#f59e0b" style={{ marginLeft: '3px' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ display: 'inline-block', alignSelf: 'flex-start', fontSize: '0.75rem', fontWeight: '800', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {session.topic || 'Masterclass'}
                    </div>
                    
                    <h4 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '800', 
                      marginBottom: '10px', 
                      color: 'var(--text-primary)', 
                      lineHeight: '1.4', 
                      letterSpacing: '-0.01em',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {session.title}
                    </h4>
                    
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: '500' }}>
                      By {session.speaker?.name || 'Guest Speaker'}
                    </p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                        <Calendar size={14} /> {new Date(session.createdAt || session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Watch <ArrowRight size={14}/>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* NEWSLETTER CTA SECTION */}
      <section id="join" className="container" style={{ maxWidth: '1200px', margin: '80px auto 0 auto', padding: '0 16px' }}>
        <style>{`
          .newsletter-card {
            background: linear-gradient(135deg, #0f172a 0%, #083344 100%);
            border-radius: 28px;
            padding: 48px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justifyContent: space-between;
            gap: 32px;
            box-shadow: 0 25px 50px -12px rgba(8, 145, 178, 0.4);
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
            background: #06b6d4;
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

        <div className="newsletter-card">
          {/* Subtle Background Glow matches new Cyan brand */}
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Info Column */}
          <div className="newsletter-info">
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
              <Mail size={28} color="#06b6d4" />
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
          
          {/* Form Column */}
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
                onMouseOver={e => e.currentTarget.style.background = '#0891b2'}
                onMouseOut={e => e.currentTarget.style.background = '#06b6d4'}
              >
                {subStatus.loading ? '...' : 'Subscribe'}
              </button>
            </form>
            
            {subStatus.success && (
              <div style={{ marginTop: '12px', color: '#34d399', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
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

export default Home;