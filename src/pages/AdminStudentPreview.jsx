import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';
import { resolvePhotoUrl } from '../api/config';

const DEFAULT_AVATAR = '/default-avatar.svg';
const STATUS_BADGE = { present: 'badge-present', late: 'badge-late', absent: 'badge-absent' };

export default function AdminStudentPreview() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [marksData, setMarksData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAll() {
      try {
        const s = await apiRequest(`/students/${studentId}`, { token: user.token });
        setStudent(s);

        const att = await apiRequest(`/attendance/student/${studentId}`, { token: user.token });
        setAttendance(att);

        const marks = await apiRequest(`/marks/student/${studentId}`, { token: user.token });
        setMarksData(marks);
      } catch (err) {
        setError(err.message);
      }
    }
    loadAll();
  }, [studentId, user.token]);

  if (error) return <div className="error-banner">{error}</div>;
  if (!student) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <Link to="/admin/students" className="text-muted" style={{ fontSize: '0.85rem' }}>← Back to Students</Link>

      <div className="flex-between" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src={student.hasCustomPhoto ? resolvePhotoUrl(student.photoUrl) : DEFAULT_AVATAR}
            alt={student.name}
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' }}
          />
          <div>
            <h2 style={{ marginBottom: 2 }}>{student.name}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Roll {student.rollNo} · Class {student.classNumber} · S/O {student.fatherName} · {student.contactNumber}
            </p>
          </div>
        </div>
      </div>

      <p className="text-muted" style={{ fontSize: '0.82rem', margin: '16px 0' }}>
        This is a read-only preview of exactly what {student.name} sees on their own dashboard.
      </p>

      {attendance && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{attendance.summary.percentage}%</div>
            <div className="stat-label">Attendance</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{attendance.summary.total}</div>
            <div className="stat-label">Total Days Recorded</div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="card-title">Attendance History</h3>
        {!attendance || attendance.records.length === 0 ? (
          <p className="text-muted">No attendance records yet.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Time</th><th>Status</th><th>Method</th></tr></thead>
            <tbody>
              {attendance.records.map((r) => (
                <tr key={r._id}>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td><span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
                  <td className="text-muted" style={{ textTransform: 'capitalize' }}>{r.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 className="card-title">Marks</h3>
        {!marksData || Object.keys(marksData.groupedMarks).length === 0 ? (
          <p className="text-muted">No marks recorded yet.</p>
        ) : (
          Object.entries(marksData.groupedMarks).map(([exam, entries]) => (
            <div key={exam} style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 8, textAlign: 'center' }}>{exam}</h4>
              <table className="data-table">
                <thead><tr><th>Subject</th><th>Marks</th></tr></thead>
                <tbody>
                  {entries.map((m) => (
                    <tr key={m._id}><td>{m.subject}</td><td>{m.marksObtained} / {m.totalMarks}</td></tr>
                  ))}
                </tbody>
              </table>
              {marksData.examTypeSummaries[exam] && (
                <p style={{ fontWeight: 600, marginTop: 8, fontSize: '0.9rem' }}>
                  {exam} Total: {marksData.examTypeSummaries[exam].obtained} / {marksData.examTypeSummaries[exam].possible} ({marksData.examTypeSummaries[exam].percentage}%)
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
