import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, ExternalLink } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

// --- CUSTOM BRAND SVG TO PREVENT LUCIDE CRASHES ---
const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const EventDetail = () => {
  const { slug } = useParams();
  const [data, setData] = useState({ event: null, attendees: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventAndAttendees = async () => {
      try {
        // 1. Fetch Event Details
        const eventRes = await fetch(`/api/v1/events/${slug}`);
        const eventData = await eventRes.json();

        if (eventData.success && eventData.data) {
          const event = eventData.data;
          
          // 2. Fetch Attendees using the Event's MongoDB _id
          const attendeesRes = await fetch(`/api/v1/attendees/event/${event._id}`);
          const attendeesData = await attendeesRes.json();

          setData({
            event: event,
            attendees: attendeesData.success ? attendeesData.data : []
          });
        }
      } catch (error) {
        console.error("Failed to fetch event data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventAndAttendees();
  }, [slug]);

  // Helper to generate initials for avatar placeholders
  const getInitials = (name) => {
    if (!name) return 'CT'; // Co-Thinker
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading event details...
      </div>
    );
  }
  
  if (!data.event) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Event not found.</h2>
        <Link to="/events" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>Return to Schedule</Link>
      </div>
    );
  }

  const { event, attendees } = data;
  const isUpcoming = event.status === 'Published';

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '100px', fontFamily: 'var(--font-sans)' }}>
      
      {/* --- HERO SECTION --- */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '60px 0 80px 0', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '32px', fontWeight: '600', transition: 'color 0.2s' }}>
            <ArrowLeft size={18} /> Back to Schedule
          </Link>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* Banner Image */}
            <div style={{ flex: '1 1 400px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', height: '300px', background: 'var(--bg-primary)' }}>
              {event.bannerUrl ? (
                <MediaImage src={event.bannerUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Banner Available</div>
              )}
            </div>

            {/* Event Info */}
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ display: 'inline-block', background: isUpcoming ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)', color: isUpcoming ? '#10b981' : '#6366f1', padding: '6px 16px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '800', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EDITION {event.edition || '?'} • {event.status}
              </div>
              
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 24px 0', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>{event.title}</h1>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}><Calendar size={20} color="#10b981" /></div>
                  <strong style={{ color: 'var(--text-primary)' }}>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}><MapPin size={20} color="#10b981" /></div>
                  <span style={{ color: 'var(--text-primary)' }}>{event.venue || 'Venue TBD'}</span>
                </div>
              </div>

              {isUpcoming && event.registerUrl && (
                <a 
                  href={event.registerUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: '#10b981', 
                    color: '#fff', 
                    textDecoration: 'none', 
                    padding: '16px 32px', 
                    borderRadius: '12px', 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.4)', 
                    transition: 'transform 0.2s' 
                  }} 
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} 
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                   Register Now <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* --- CONTENT AREA --- */}
      <div className="container" style={{ maxWidth: '1000px', marginTop: '60px', display: 'flex', flexWrap: 'wrap', gap: '60px' }}>
        
        {/* Left Column: Description & Speakers */}
        <div style={{ flex: '2 1 500px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-primary)' }}>About this Edition</h2>
          <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '60px' }}>
            {event.description || 'No description provided for this event.'}
          </div>

          {event.speakers && event.speakers.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', color: 'var(--text-primary)' }}>Featured Speakers</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {event.speakers.map(speaker => (
                  <Link to={`/speakers/${speaker.slug}`} key={speaker._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <MediaImage src={speaker.photoUrl} alt={speaker.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)' }} />
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{speaker.name}</h4>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{speaker.company}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: LIVE ATTENDEE WALL */}
        <div style={{ flex: '1 1 350px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'sticky', top: '40px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#10b981" /> Who's Attending
              </h2>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '99px', fontSize: '0.9rem', fontWeight: '700' }}>
                {attendees.length} Registered
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
              {attendees.map((attendee, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                  
                  {/* Dynamic Initial Avatar */}
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '1rem', flexShrink: 0 }}>
                    {getInitials(attendee.name)}
                  </div>

                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <h4 style={{ margin: '0 0 2px 0', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {attendee.name}
                    </h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {attendee.designation || 'Co-Thinker'}
                    </p>
                  </div>

                  {attendee.linkedinUrl && (
                    <a href={attendee.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', padding: '8px', borderRadius: '50%', background: 'rgba(10, 102, 194, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(10, 102, 194, 0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(10, 102, 194, 0.1)'}>
                      <LinkedinIcon size={16} />
                    </a>
                  )}
                </div>
              ))}

              {attendees.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  <Users size={40} opacity={0.3} style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>No attendees synced yet. Register on Luma to secure your spot!</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetail;