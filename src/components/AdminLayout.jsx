import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Edu<span>Track</span></div>

        <NavLink to="/admin" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/admin/students" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Students
        </NavLink>
        <NavLink to="/admin/attendance" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Attendance
        </NavLink>
        <NavLink to="/admin/marks" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Marks
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Settings
        </NavLink>
        <NavLink to="/admin/help" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Help
        </NavLink>

        <div className="sidebar-footer">
          <div style={{ color: '#94A3B8', fontSize: '0.8rem', padding: '0 12px 10px' }}>
            {user?.username}
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
