import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Video, Edit3, Newspaper, ArrowRight, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    events: 0, speakers: 0, sessions: 0, writeUps: 0, aiArticles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/v1/stats');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, count, icon, color, linkTo }) => (
    <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: `${color}15`, color: color, padding: '12px', borderRadius: '12px' }}>
          {icon}
        </div>
        <span style={{ fontSize: '2rem', fontWeight: '700', lineHeight: '1' }}>{count}</span>
      </div>
      <div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>{title}</h3>
      </div>
      <Link to={linkTo} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: color, fontWeight: '600', textDecoration: 'none' }}>
        Manage {title} <ArrowRight size={14} />
      </Link>
    </div>
  );

  if (loading) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading platform overview...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity color="var(--accent-primary)" /> Platform Overview
        </h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time metrics for the BacktoBase content ecosystem.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Events" count={stats.events} icon={<Calendar size={24} />} color="#3b82f6" linkTo="/admin/events" />
        <StatCard title="Speakers" count={stats.speakers} icon={<Users size={24} />} color="#8b5cf6" linkTo="/admin/speakers" />
        <StatCard title="Sessions" count={stats.sessions} icon={<Video size={24} />} color="#ef4444" linkTo="/admin/sessions" />
        <StatCard title="Write-ups" count={stats.writeUps} icon={<Edit3 size={24} />} color="#f59e0b" linkTo="/admin/write-ups" />
        <StatCard title="AI Articles" count={stats.aiArticles} icon={<Newspaper size={24} />} color="#10b981" linkTo="/admin/ai-blog" />
      </div>

      <div style={{ background: 'var(--bg-primary)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem' }}>Quick Actions</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
          Jump straight into creating new content for the community.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/admin/events" style={{ padding: '10px 20px', background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '6px', fontWeight: '500', textDecoration: 'none' }}>+ Schedule Event</Link>
          <Link to="/admin/speakers" style={{ padding: '10px 20px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: '500', textDecoration: 'none' }}>+ Add Speaker</Link>
          <Link to="/admin/write-ups" style={{ padding: '10px 20px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: '500', textDecoration: 'none' }}>+ Write Article</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;