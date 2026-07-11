import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';

export default function StudentMarksView() {
  const { user } = useAuth();
  const [groupedMarks, setGroupedMarks] = useState({});
  const [examTypeSummaries, setExamTypeSummaries] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiRequest('/marks/my-marks', { token: user.token });
        setGroupedMarks(data.groupedMarks);
        setExamTypeSummaries(data.examTypeSummaries);
      } catch (err) {
        setError(err.message);
      }
    }
    loadData();
  }, [user.token]);

  const examTypes = Object.keys(groupedMarks);

  return (
    <div>
      <h2>My Marks</h2>
      <p className="text-muted" style={{ marginTop: 4, marginBottom: 20 }}>Your results, grouped by exam.</p>

      {error && <div className="error-banner">{error}</div>}

      {examTypes.length === 0 ? (
        <div className="card">
          <p className="text-muted">No marks recorded yet.</p>
        </div>
      ) : (
        examTypes.map((examType) => (
          <div className="card" key={examType} style={{ marginBottom: 20 }}>
            <h3 className="card-title" style={{ textAlign: 'center' }}>{examType}</h3>
            <div className="table-scroll">
<table className="data-table">
              <thead><tr><th>Subject</th><th>Marks</th></tr></thead>
              <tbody>
                {groupedMarks[examType].map((m) => (
                  <tr key={m._id}>
                    <td>{m.subject}</td>
                    <td>{m.marksObtained} / {m.totalMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
            {examTypeSummaries[examType] && (
              <p style={{ fontWeight: 600, marginTop: 12, textAlign: 'center' }}>
                Total: {examTypeSummaries[examType].obtained} / {examTypeSummaries[examType].possible} ({examTypeSummaries[examType].percentage}%)
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
