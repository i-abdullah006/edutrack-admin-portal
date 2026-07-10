import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';

export default function StudentOverview() {
  const { user } = useAuth();
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [examTypeSummaries, setExamTypeSummaries] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const attendance = await apiRequest('/attendance/my-attendance', { token: user.token });
        setAttendanceSummary(attendance.summary);

        const marks = await apiRequest('/marks/my-marks', { token: user.token });
        setExamTypeSummaries(marks.examTypeSummaries);
      } catch (err) {
        setError(err.message);
      }
    }
    loadData();
  }, [user.token]);

  const examTypes = Object.keys(examTypeSummaries);

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p className="text-muted" style={{ marginTop: 4, marginBottom: 24 }}>
        Roll No: {user.rollNo} · Class {user.classNumber}
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{attendanceSummary ? `${attendanceSummary.percentage}%` : '—'}</div>
          <div className="stat-label">Attendance</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{attendanceSummary?.total ?? '—'}</div>
          <div className="stat-label">Total Days Recorded</div>
        </div>
      </div>

      {attendanceSummary && Number(attendanceSummary.percentage) < 75 && (
        <div className="error-banner">
          Your attendance is below 75%. Please try to attend regularly.
        </div>
      )}

      {examTypes.length > 0 && (
        <div className="card">
          <h3 className="card-title">Marks Summary</h3>
          {examTypes.map((exam) => (
            <p key={exam} style={{ fontSize: '0.9rem', marginBottom: 6 }}>
              <strong>{exam}:</strong> {examTypeSummaries[exam].obtained} / {examTypeSummaries[exam].possible} ({examTypeSummaries[exam].percentage}%)
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
