import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';

export default function AdminMarks() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [examType, setExamType] = useState('');
  const [subjectStatus, setSubjectStatus] = useState([]); // [{subject, hasMarks, marksObtained, totalMarks}]

  // Pop-up modal state for entering/editing one subject's marks
  const [activeSubject, setActiveSubject] = useState(null);
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('');

  const [groupedMarks, setGroupedMarks] = useState({});
  const [examTypeSummaries, setExamTypeSummaries] = useState({});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await apiRequest('/students', { token: user.token });
        setStudents(data);
      } catch (err) {
        setError(err.message);
      }
    }
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStudentChange(id) {
    setSelectedStudentId(id);
    setSelectedStudent(students.find((s) => s._id === id) || null);
    setExamType('');
    setSubjectStatus([]);
    setActiveSubject(null);
    loadFullMarks(id);
  }

  async function loadFullMarks(studentId) {
    if (!studentId) return;
    try {
      const data = await apiRequest(`/marks/student/${studentId}`, { token: user.token });
      setGroupedMarks(data.groupedMarks);
      setExamTypeSummaries(data.examTypeSummaries);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadSubjectStatus(studentId, exam) {
    if (!studentId || !exam) return;
    try {
      const data = await apiRequest(`/marks/student/${studentId}/subjects-for-exam?examType=${encodeURIComponent(exam)}`, { token: user.token });
      setSubjectStatus(data.subjects);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleExamTypeChange(value) {
    setExamType(value);
    setActiveSubject(null);
  }

  function handleExamTypeBlur() {
    if (examType) {
      loadSubjectStatus(selectedStudentId, examType);
    }
  }

  function openMarksModal(subjectEntry) {
    setActiveSubject(subjectEntry.subject);
    setMarksObtained(subjectEntry.hasMarks ? String(subjectEntry.marksObtained) : '');
    setTotalMarks(subjectEntry.hasMarks ? String(subjectEntry.totalMarks) : '');
    setSuccess('');
  }

  function closeMarksModal() {
    setActiveSubject(null);
  }

  async function handleSaveSubjectMarks(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await apiRequest('/marks', {
        method: 'POST',
        token: user.token,
        body: {
          studentId: selectedStudentId,
          subject: activeSubject,
          examType,
          marksObtained: Number(marksObtained),
          totalMarks: Number(totalMarks)
        }
      });
      setSuccess(`Marks saved for ${activeSubject}.`);
      setActiveSubject(null);
      loadSubjectStatus(selectedStudentId, examType);
      loadFullMarks(selectedStudentId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex-between">
        <div>
          <h2>Marks</h2>
          <p className="text-muted" style={{ marginTop: 4 }}>Enter marks one subject at a time - never all at once.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="card-title">Select Student</h3>
        <select className="form-select" value={selectedStudentId} onChange={(e) => handleStudentChange(e.target.value)}>
          <option value="">-- Select a student --</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>{s.name} (Roll {s.rollNo})</option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 className="card-title">Exam Type</h3>
            <input
              className="form-input"
              placeholder="e.g. Class Test, Mid Term, Final"
              value={examType}
              onChange={(e) => handleExamTypeChange(e.target.value)}
              onBlur={handleExamTypeBlur}
              style={{ maxWidth: 300 }}
            />
          </div>

          {examType && subjectStatus.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 className="card-title">{selectedStudent.name}'s Subjects — {examType}</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
                Enter marks for one subject, save, then move to the next whenever you're ready. Subjects with marks already saved are marked complete.
              </p>

              <div className="table-scroll">
<table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {subjectStatus.map((entry) => (
                    <tr key={entry.subject}>
                      <td>{entry.subject}</td>
                      <td>
                        {entry.hasMarks ? (
                          <span className="badge badge-present">{entry.marksObtained}/{entry.totalMarks}</span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Not entered</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                          onClick={() => openMarksModal(entry)}
                        >
                          {entry.hasMarks ? 'Edit' : 'Enter Marks'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            </div>
          )}

          {Object.keys(groupedMarks).length > 0 && (
            <div className="card">
              <h3 className="card-title">All Recorded Marks</h3>
              {Object.entries(groupedMarks).map(([exam, entries]) => (
                <div key={exam} style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 8, textAlign: 'center' }}>{exam}</h4>
                  <div className="table-scroll">
<table className="data-table">
                    <thead>
                      <tr><th>Subject</th><th>Marks</th></tr>
                    </thead>
                    <tbody>
                      {entries.map((m) => (
                        <tr key={m._id}>
                          <td>{m.subject}</td>
                          <td>{m.marksObtained} / {m.totalMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
</div>
                  {examTypeSummaries[exam] && (
                    <p style={{ fontWeight: 600, marginTop: 8, fontSize: '0.9rem' }}>
                      {exam} Total: {examTypeSummaries[exam].obtained} / {examTypeSummaries[exam].possible} ({examTypeSummaries[exam].percentage}%)
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeSubject && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={closeMarksModal}
        >
          <div className="card" style={{ maxWidth: 380, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>{activeSubject}</h3>
            <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 16 }}>{examType}</p>

            <form onSubmit={handleSaveSubjectMarks}>
              <div className="form-group">
                <label className="form-label">Marks Obtained</label>
                <input className="form-input" type="number" value={marksObtained} onChange={(e) => setMarksObtained(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input className="form-input" type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeMarksModal}>Back</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
