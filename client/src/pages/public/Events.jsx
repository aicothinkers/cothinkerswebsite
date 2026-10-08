import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Sparkles, Globe, Clock, Ticket } from 'lucide-react';
import MediaImage from '../../components/common/MediaImage';

const PublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    fetch('/api/v1/events')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Temporarily default missing cities to Hyderabad for legacy data
          const processedEvents = data.data.map(evt => ({ ...evt, city: evt.city || 'Hyderabad' }));
          setEvents(processedEvents);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', gap: '16px' }}>
        <Sparkles size={32} color="#10b981" style={{ animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Syncing community schedule...</span>
      </div>
    );
  }

  // Dynamically extract unique cities for the filter tabs
  const uniqueCities = ['All', ...new Set(events.map(e => e.city))];

  // Filter events based on selected city
  const filteredEvents = events.filter(e => selectedCity === 'All' || e.city === selectedCity);
  
  const upcomingEvents = filteredEvents.filter(e => e.status === 'Published');
  const pastEvents = filteredEvents.filter(e => e.status === 'Completed' || e.status === 'Draft');

  return (
    <div style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', overflowX: 'hidden', paddingBottom: '100px' }}>
      
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .animate-fade-in {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .hover-lift:hover {
            transform: translateY(-6px);
            box-shadow: var(--card-shadow-hover);
          }
          
          /* CITY FILTER TABS */
          .city-tabs {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            padding-bottom: 8px;
            margin-bottom: 40px;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .city-tabs::-webkit-scrollbar {
            display: none;
          }
          .city-tab-btn {
            padding: 10px 24px;
            border-radius: 100px;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
            border: 1px solid var(--border-color);
          }
          .city-tab-active {
            background: var(--text-primary);
            color: var(--bg-primary);
            border-color: var(--text-primary);
          }
          .city-tab-inactive {
            background: transparent;
            color: var(--text-secondary);
          }
          .city-tab-inactive:hover {
            border-color: var(--text-primary);
            color: var(--text-primary);
          }
        `}
      </style>

      {/* HEADER SECTION */}
      <section style={{ backgroundColor: '#090b14', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15), transparent 50%)', padding: '120px 0 80px 0', borderBottom: '1px solid #1e293b' }}>
        <div className="container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '0 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-full, 9999px)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 61, 185, 0.2)', fontSize: '0.85rem', fontWeight: '700', color: '#10b981', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Globe size={14} /> Global Network
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.1', marginBottom: '24px', color: '#ffffff' }}>
            Meetups & <span style={{ color: '#10aeb9' }}>Conferences.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: '1.7', margin: '0 auto' }}>
            Join students, builders, and industry experts at our live knowledge-sharing sessions across multiple cities.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT WRAPPER */}
      <div className="container" style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 10, boxSizing: 'border-box' }}>
        
        {/* CITY FILTER TABS */}
        <div className="city-tabs animate-fade-in">
          {uniqueCities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`city-tab-btn ${selectedCity === city ? 'city-tab-active' : 'city-tab-inactive'}`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* UPCOMING EVENTS (RESPONSIVE GRID) */}
        <section className="animate-fade-in" style={{ marginBottom: '80px', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1064b9', fontWeight: '800', fontSize: '1.25rem', marginBottom: '24px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1048b9', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            Upcoming in {selectedCity === 'All' ? 'All Cities' : selectedCity}
          </div>

          {upcomingEvents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
              {upcomingEvents.map(event => (
                <Link 
                  to={`/events/${event.slug}`} 
                  key={event._id} 
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
                    boxShadow: 'var(--card-shadow)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  
                  {/* Responsive 16:9 Banner */}
                  <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: '#0f111a', position: 'relative', overflow: 'hidden' }}>
                    {event.bannerUrl ? (
                      <MediaImage src={event.bannerUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={48} color="var(--text-muted)" opacity={0.3} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', color: '#090b14', padding: '6px 12px', borderRadius: 'var(--radius-full, 9999px)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Edition {event.edition}
                    </div>
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: '#106db9', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {event.city}
                    </div>
                  </div>
                  
                  <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '600' }}>
                      <Calendar size={14} color="#1081b9" /> {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                    </div>
                    
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                      {event.title}
                    </h3>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {event.description}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1062b9', fontWeight: '700', fontSize: '0.9rem', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: 'auto' }}>
                      <Ticket size={16} /> Secure Spot <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
              <Globe size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No Upcoming Events in {selectedCity}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>We are working on bringing our next edition here soon!</p>
            </div>
          )}
        </section>

        {/* PAST EDITIONS ARCHIVE (RESPONSIVE GRID) */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: '800', fontSize: '1.25rem', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
            <Clock size={20} /> Past Editions ({selectedCity})
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            {pastEvents.map(event => (
              <Link 
                to={`/events/${event.slug}`} 
                key={event._id} 
                className="hover-lift" 
                style={{ 
                  background: 'var(--bg-primary)', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border-color)', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  boxShadow: 'var(--card-shadow)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {/* Responsive 16:9 Banner */}
                <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                  {event.bannerUrl ? (
                    <MediaImage src={event.bannerUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                      <span style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.1' }}>{new Date(event.date).getDate()}</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: 'var(--radius-full, 9999px)', letterSpacing: '0.05em' }}>
                    EDITION {event.edition || 'Special'}
                  </div>
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {event.city}
                  </div>
                </div>
                
                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                    {event.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                  </p>
                  
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: 'auto' }}>
                    View Recap <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {pastEvents.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px', fontSize: '1rem' }}>
              No past events recorded for {selectedCity}.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default PublicEvents;