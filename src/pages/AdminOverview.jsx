import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';

export default function AdminOverview() {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOverview() {
      try {
        const students = await apiRequest('/students', { token: user.token });
        setStudentCount(students.length);

        const today = new Date().toISOString().split('T')[0];
        const attendance = await apiRequest(`/attendance/date/${today}`, { token: user.token });
        setTodayAttendance(attendance);
      } catch (err) {
        setError(err.message);
      }
    }
    loadOverview();
  }, [user.token]);

  const presentToday = todayAttendance?.filter(a => a.status === 'present' || a.status === 'late').length ?? 0;
  const lateToday = todayAttendance?.filter(a => a.status === 'late').length ?? 0;
  const absentToday = todayAttendance?.filter(a => a.status === 'absent').length ?? 0;

  return (
    <div>
      <div className="flex-between">
        <div>
          <h2>Overview</h2>
          <p className="text-muted" style={{ marginTop: 4 }}>Today's snapshot, at a glance.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{studentCount ?? '—'}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{presentToday}</div>
          <div className="stat-label">Present Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{lateToday}</div>
          <div className="stat-label">Late Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{absentToday}</div>
          <div className="stat-label">Absent Today</div>
        </div>
      </div>
    </div>
  );
}
