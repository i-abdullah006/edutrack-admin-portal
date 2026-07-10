import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';
import PasswordInput from '../components/PasswordInput';

export default function AdminSettings() {
  const { user } = useAuth();

  // Attendance timing settings
  const [classStartTime, setClassStartTime] = useState('08:00');
  const [lateCutoffMinutes, setLateCutoffMinutes] = useState(10);
  const [combinedMatric, setCombinedMatric] = useState(false);
  const [combinedIntermediate, setCombinedIntermediate] = useState(false);
  const [hasSecretPassword, setHasSecretPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Secret password fields
  const [currentSecretPassword, setCurrentSecretPassword] = useState('');
  const [newSecretPassword, setNewSecretPassword] = useState('');
  const [secretError, setSecretError] = useState('');
  const [secretSuccess, setSecretSuccess] = useState('');
  const [secretLoading, setSecretLoading] = useState(false);

  // Change admin login password fields (requires the secret password)
  const [secretPasswordForChange, setSecretPasswordForChange] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [confirmLoginPassword, setConfirmLoginPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiRequest('/settings', { token: user.token });
        setClassStartTime(data.classStartTime);
        setLateCutoffMinutes(data.lateCutoffMinutes);
        setCombinedMatric(data.combinedIslamiatPakStudiesMatric);
        setCombinedIntermediate(data.combinedIslamiatPakStudiesIntermediate);
        setHasSecretPassword(data.hasSecretPassword);
      } catch (err) {
        setError(err.message);
      }
    }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await apiRequest('/settings', {
        method: 'PUT',
        token: user.token,
        body: {
          classStartTime,
          lateCutoffMinutes: Number(lateCutoffMinutes),
          combinedIslamiatPakStudiesMatric: combinedMatric,
          combinedIslamiatPakStudiesIntermediate: combinedIntermediate
        }
      });
      setSuccess('Settings saved. This only applies to future attendance and newly added students.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetSecretPassword(e) {
    e.preventDefault();
    setSecretError(''); setSecretSuccess(''); setSecretLoading(true);
    try {
      await apiRequest('/settings/secret-password', {
        method: 'PUT',
        token: user.token,
        body: { currentSecretPassword: hasSecretPassword ? currentSecretPassword : undefined, newSecretPassword }
      });
      setSecretSuccess(hasSecretPassword ? 'Secret password changed.' : 'Secret password set.');
      setHasSecretPassword(true);
      setCurrentSecretPassword('');
      setNewSecretPassword('');
    } catch (err) {
      setSecretError(err.message);
    } finally {
      setSecretLoading(false);
    }
  }

  async function handleChangeLoginPassword(e) {
    e.preventDefault();
    setPasswordError(''); setPasswordSuccess('');

    if (newLoginPassword !== confirmLoginPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiRequest('/settings/change-password', {
        method: 'PUT',
        token: user.token,
        body: { secretPassword: secretPasswordForChange, newPassword: newLoginPassword }
      });
      setPasswordSuccess('Admin login password changed successfully.');
      setSecretPasswordForChange('');
      setNewLoginPassword('');
      setConfirmLoginPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div>
      <div className="flex-between">
        <div>
          <h2>Settings</h2>
          <p className="text-muted" style={{ marginTop: 4 }}>Control class timing, curriculum pattern, and account security.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="card" style={{ maxWidth: 520, marginBottom: 24 }}>
        <h3 className="card-title">Attendance Timing</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Class Start Time</label>
            <input className="form-input" type="time" value={classStartTime} onChange={(e) => setClassStartTime(e.target.value)} required />
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>Change this anytime as the season changes.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Late Cutoff (minutes)</label>
            <input className="form-input" type="number" min="0" value={lateCutoffMinutes} onChange={(e) => setLateCutoffMinutes(e.target.value)} required />
          </div>

          <div className="form-group" style={{ paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
            <label className="form-label" style={{ marginBottom: 10 }}>Islamiat / Pakistan Studies Pattern</label>

            <label className="checkbox-row" style={{ marginBottom: 10 }}>
              <input type="checkbox" checked={combinedMatric} onChange={(e) => setCombinedMatric(e.target.checked)} />
              Combine for Matric (9th gets Islamiat only, 10th gets Pakistan Studies only)
            </label>

            <label className="checkbox-row">
              <input type="checkbox" checked={combinedIntermediate} onChange={(e) => setCombinedIntermediate(e.target.checked)} />
              Combine for Intermediate (11th gets Islamiat only, 12th gets Pakistan Studies only)
            </label>

            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 8 }}>
              These are independent - Matric and Intermediate can each follow a different pattern. This affects subjects assigned to newly added students only.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 480, marginBottom: 24 }}>
        <h3 className="card-title">{hasSecretPassword ? 'Change Secret Password' : 'Set Secret Password'}</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
          A separate password required to change your admin login password. Keep this different from your login password, and don't share it even if you share your login temporarily.
        </p>

        {secretError && <div className="error-banner">{secretError}</div>}
        {secretSuccess && <div className="success-banner">{secretSuccess}</div>}

        <form onSubmit={handleSetSecretPassword}>
          {hasSecretPassword && (
            <div className="form-group">
              <label className="form-label">Current Secret Password</label>
              <PasswordInput value={currentSecretPassword} onChange={(e) => setCurrentSecretPassword(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{hasSecretPassword ? 'New Secret Password' : 'Secret Password'}</label>
            <PasswordInput value={newSecretPassword} onChange={(e) => setNewSecretPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={secretLoading}>
            {secretLoading ? 'Saving...' : hasSecretPassword ? 'Change Secret Password' : 'Set Secret Password'}
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <h3 className="card-title">Change Admin Login Password</h3>

        {!hasSecretPassword ? (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Set a secret password above first before you can change your login password.
          </p>
        ) : (
          <>
            {passwordError && <div className="error-banner">{passwordError}</div>}
            {passwordSuccess && <div className="success-banner">{passwordSuccess}</div>}

            <form onSubmit={handleChangeLoginPassword}>
              <div className="form-group">
                <label className="form-label">Secret Password</label>
                <PasswordInput value={secretPasswordForChange} onChange={(e) => setSecretPasswordForChange(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Login Password</label>
                <PasswordInput value={newLoginPassword} onChange={(e) => setNewLoginPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Login Password</label>
                <PasswordInput value={confirmLoginPassword} onChange={(e) => setConfirmLoginPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                {passwordLoading ? 'Changing...' : 'Change Login Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
