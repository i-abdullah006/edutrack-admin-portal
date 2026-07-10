import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="page-center" style={{ background: 'var(--color-primary)' }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '2.4rem', marginBottom: 8 }}>
          Edu<span style={{ color: 'var(--color-accent-light)' }}>Track</span>
        </h1>
        <p style={{ color: '#94A3B8', marginBottom: 40, fontSize: '0.95rem' }}>
          Attendance and academic records, all in one place.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Link
            to="/admin/login"
            className="btn btn-primary btn-block"
            style={{ padding: '14px', fontSize: '0.95rem', textDecoration: 'none' }}
          >
            Admin Login
          </Link>
          <Link
            to="/student/login"
            className="btn btn-block"
            style={{
              padding: '14px',
              fontSize: '0.95rem',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.15)',
              textDecoration: 'none'
            }}
          >
            Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}
