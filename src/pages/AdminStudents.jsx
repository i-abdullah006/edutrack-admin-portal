import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';
import { resolvePhotoUrl } from '../api/config';
import AddStudentForm from '../components/AddStudentForm';
import EditStudentForm from '../components/EditStudentForm';
import ConfirmModal from '../components/ConfirmModal';

const DEFAULT_AVATAR = '/default-avatar.svg';

export default function AdminStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Two-step removal confirmation state
  const [removalTarget, setRemovalTarget] = useState(null); // student object
  const [removalStep, setRemovalStep] = useState(0); // 0 = closed, 1 = first confirm, 2 = final confirm

  async function loadStudents() {
    try {
      const data = await apiRequest('/students', { token: user.token });
      setStudents(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function togglePasswordVisible(id) {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function startRemoval(student) {
    setRemovalTarget(student);
    setRemovalStep(1);
  }

  function cancelRemoval() {
    setRemovalTarget(null);
    setRemovalStep(0);
  }

  function proceedToFinalConfirm() {
    setRemovalStep(2);
  }

  async function confirmFinalRemoval() {
    try {
      await apiRequest(`/students/${removalTarget._id}`, { method: 'DELETE', token: user.token });
      cancelRemoval();
      loadStudents();
    } catch (err) {
      setError(err.message);
      cancelRemoval();
    }
  }

  const [resetTarget, setResetTarget] = useState(null);
  const [resetResult, setResetResult] = useState(null);

  function startResetPassword(student) {
    setResetTarget(student);
    setResetResult(null);
  }

  async function confirmResetPassword() {
    try {
      const data = await apiRequest(`/students/${resetTarget._id}/reset-password`, { method: 'POST', token: user.token });
      setResetResult(data.newPassword);
      loadStudents();
    } catch (err) {
      setError(err.message);
      setResetTarget(null);
    }
  }

  return (
    <div>
      <div className="flex-between">
        <div>
          <h2>Students</h2>
          <p className="text-muted" style={{ marginTop: 4 }}>Add new students or manage the current list.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? 'Close' : '+ Add Student'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showAddForm && <AddStudentForm onStudentAdded={loadStudents} />}

      {editingStudent && (
        <EditStudentForm
          student={editingStudent}
          onSaved={() => { setEditingStudent(null); loadStudents(); }}
          onCancel={() => setEditingStudent(null)}
        />
      )}

      <div className="card">
        <h3 className="card-title">All Students ({students.length})</h3>
        {students.length === 0 ? (
          <p className="text-muted">No students added yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Roll No</th>
                <th>Username</th>
                <th>Password</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>
                    <img
                      src={s.hasCustomPhoto ? resolvePhotoUrl(s.photoUrl) : DEFAULT_AVATAR}
                      alt={s.name}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                    />
                  </td>
                  <td>
                    {s.name}
                    {s.hasDuplicateName && (
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>S/O {s.fatherName}</div>
                    )}
                  </td>
                  <td>{s.rollNo}</td>
                  <td>{s.username}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <code>{visiblePasswords[s._id] ? s.plainPassword : '••••••••'}</code>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisible(s._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        {visiblePasswords[s._id] ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link to={`/admin/students/${s._id}`} className="btn btn-secondary" style={{ marginRight: 8, padding: '6px 12px', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-block' }}>
                      View
                    </Link>
                    <button className="btn btn-secondary" style={{ marginRight: 8, padding: '6px 12px', fontSize: '0.82rem' }} onClick={() => setEditingStudent(s)}>
                      Edit
                    </button>
                    <button className="btn btn-secondary" style={{ marginRight: 8, padding: '6px 12px', fontSize: '0.82rem' }} onClick={() => startResetPassword(s)}>
                      Reset Password
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.82rem' }} onClick={() => startRemoval(s)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        open={removalStep === 1}
        title="Remove this student?"
        message={removalTarget ? `This will permanently delete ${removalTarget.name}'s account, along with all their attendance and marks history. This cannot be undone.` : ''}
        confirmLabel="Continue"
        danger
        onConfirm={proceedToFinalConfirm}
        onCancel={cancelRemoval}
      />

      <ConfirmModal
        open={removalStep === 2}
        title="Are you absolutely sure?"
        message="This is your final confirmation. Once removed, this student's data cannot be recovered."
        confirmLabel="Yes, Permanently Remove"
        danger
        onConfirm={confirmFinalRemoval}
        onCancel={cancelRemoval}
      />
      <ConfirmModal
        open={!!resetTarget && !resetResult}
        title="Reset this student's password?"
        message={resetTarget ? `A new password will be generated for ${resetTarget.name}. Their username stays the same.` : ''}
        confirmLabel="Reset Password"
        onConfirm={confirmResetPassword}
        onCancel={() => setResetTarget(null)}
      />

      {resetTarget && resetResult && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setResetTarget(null)}
        >
          <div className="card" style={{ maxWidth: 400, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 10 }}>Password Reset</h3>
            <div className="credential-box">
              New password for <strong>{resetTarget.name}</strong>: <code>{resetResult}</code>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setResetTarget(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
