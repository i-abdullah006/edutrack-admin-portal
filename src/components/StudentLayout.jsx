import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resolvePhotoUrl } from '../api/config';

const DEFAULT_AVATAR = '/default-avatar.svg';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 8px' }}>
          <img
            src={user?.hasCustomPhoto ? resolvePhotoUrl(user.photoUrl) : DEFAULT_AVATAR}
            alt={user?.name}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
          />
          <div className="sidebar-brand" style={{ marginBottom: 0 }}>Edu<span>Track</span></div>
        </div>

        <NavLink to="/student" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/student/attendance" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          My Attendance
        </NavLink>
        <NavLink to="/student/marks" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          My Marks
        </NavLink>
        <NavLink to="/student/help" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Help
        </NavLink>

        <div className="sidebar-footer">
          <div style={{ color: '#94A3B8', fontSize: '0.8rem', padding: '0 12px 10px' }}>
            {user?.name} · {user?.rollNo}
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
