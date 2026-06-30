import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="section" style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ color: 'var(--navy)', fontSize: 28 }}>Page not found</h2>
      <p style={{ color: 'var(--text-dim)', marginTop: 8 }}>The page you're looking for doesn't exist or you don't have access to it.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 18, display: 'inline-flex' }}>Back home</Link>
    </div>
  );
}
