import { useContext } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)', padding: '24px' }}>
        <h3 style={{ marginBottom: '32px' }}>⚡ CMS</h3>
<nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/admin/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
          <Link to="/admin/events" style={{ color: 'var(--text-secondary)' }}>Events</Link>
          <Link to="/admin/speakers" style={{ color: 'var(--text-secondary)' }}>Speakers</Link>
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>
          <Link to="/admin/sessions" style={{ color: 'var(--text-secondary)' }}>Sessions</Link>
          <Link to="/admin/write-ups" style={{ color: 'var(--text-secondary)' }}>Write-ups</Link>
          <Link to="/admin/ai-blog" style={{ color: 'var(--text-secondary)' }}>AI Blog</Link>
          <Link to="/admin/jobs" style={{ color: 'var(--text-secondary)' }}>Jobs</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h2>Welcome, {user.name}</h2>
          <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;