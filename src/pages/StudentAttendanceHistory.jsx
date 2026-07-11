import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';

const STATUS_BADGE = {
  present: 'badge-present',
  late: 'badge-late',
  absent: 'badge-absent'
};

export default function StudentAttendanceHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiRequest('/attendance/my-attendance', { token: user.token });
        setRecords(data.records);
        setSummary(data.summary);
      } catch (err) {
        setError(err.message);
      }
    }
    loadData();
  }, [user.token]);

  return (
    <div>
      <h2>My Attendance</h2>
      <p className="text-muted" style={{ marginTop: 4, marginBottom: 20 }}>Your complete attendance history.</p>

      {error && <div className="error-banner">{error}</div>}

      {summary && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{summary.percentage}%</div>
            <div className="stat-label">Overall Attendance</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.total}</div>
            <div className="stat-label">Total Days</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.presentCount}</div>
            <div className="stat-label">Present Days</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">History</h3>
        {records.length === 0 ? (
          <p className="text-muted">No attendance records yet.</p>
        ) : (
          <div className="table-scroll">
<table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td><span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
                  <td className="text-muted" style={{ textTransform: 'capitalize' }}>{r.method.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>
    </div>
  );
}
