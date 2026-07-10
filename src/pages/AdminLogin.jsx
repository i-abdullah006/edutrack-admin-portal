import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';
import PasswordInput from '../components/PasswordInput';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/auth/admin/login', {
        method: 'POST',
        body: { username, password, rememberMe }
      });
      loginAsAdmin(data, rememberMe);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card" style={{ maxWidth: 380, width: '100%' }}>
        <h2 style={{ marginBottom: 4 }}>Admin Login</h2>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 20 }}>
          Log in to access settings and student records.
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" className="text-muted" style={{ fontSize: '0.85rem' }}>← Back</Link>
        </div>
      </div>
    </div>
  );
}
