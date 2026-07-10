import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';
import CameraCapture, { captureFrameFromVideo } from '../components/CameraCapture';
import { loadFaceModels, extractFaceDescriptor } from '../utils/faceApiLoader';
import { startAuthentication } from '@simplewebauthn/browser';

const STATUS_BADGE = {
  present: 'badge-present',
  late: 'badge-late',
  absent: 'badge-absent'
};

export default function AdminAttendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todaysRecords, setTodaysRecords] = useState({});
  const [method, setMethod] = useState('manual'); // manual | face | fingerprint
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Manual mode state
  const [pendingStatus, setPendingStatus] = useState({});
  const [saving, setSaving] = useState(false);

  // Face mode state
  const [faceCameraActive, setFaceCameraActive] = useState(false);
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceModelsReady, setFaceModelsReady] = useState(false);
  const [lastFaceResult, setLastFaceResult] = useState(null); // { matched, name, rollNo } or { matched: false }
  const videoRef = useRef(null);

  // Fingerprint mode state
  const [fingerprintStudentId, setFingerprintStudentId] = useState('');
  const [fingerprintStatus, setFingerprintStatus] = useState('idle'); // idle | verifying | success | failed

  // Manual fallback for a specific student (used after face/fingerprint failure)
  const [fallbackStudent, setFallbackStudent] = useState(null);

  async function loadData() {
    try {
      const studentsData = await apiRequest('/students', { token: user.token });
      setStudents(studentsData);

      const attendanceData = await apiRequest(`/attendance/date/${selectedDate}`, { token: user.token });
      const recordMap = {};
      attendanceData.forEach((r) => { recordMap[r.student._id] = r; });
      setTodaysRecords(recordMap);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    if (method === 'face' && !faceModelsReady) {
      loadFaceModels().then(() => setFaceModelsReady(true)).catch(() => setError('Could not load face recognition models.'));
    }
  }, [method, faceModelsReady]);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // ===== MANUAL =====
  function setManualStatus(studentId, status) {
    setPendingStatus((prev) => ({ ...prev, [studentId]: status }));
  }

  async function handleSaveManual() {
    setError(''); setSuccess('');
    const records = Object.entries(pendingStatus).map(([studentId, status]) => ({ studentId, status }));
    if (records.length === 0) {
      setError('No student status has been selected yet.');
      return;
    }
    setSaving(true);
    try {
      await apiRequest('/attendance/mark-bulk', { method: 'POST', token: user.token, body: { records, date: selectedDate } });
      setSuccess(`Attendance saved for ${records.length} student(s).`);
      setPendingStatus({});
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ===== FACE =====
  function handleFaceVideoReady(videoElement) {
    videoRef.current = videoElement;
  }

  async function handleScanFace() {
    if (!videoRef.current) return;
    setFaceScanning(true);
    setError('');
    setLastFaceResult(null);
    try {
      const descriptor = await extractFaceDescriptor(videoRef.current);
      if (!descriptor) {
        setLastFaceResult({ matched: false, reason: 'no_face' });
        return;
      }
      const data = await apiRequest('/attendance/mark-face', {
        method: 'POST',
        token: user.token,
        body: { descriptor, date: selectedDate }
      });
      if (data.matched) {
        setLastFaceResult({ matched: true, name: data.student.name, rollNo: data.student.rollNo });
        loadData();
      } else {
        setLastFaceResult({ matched: false, reason: 'no_match' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFaceScanning(false);
    }
  }

  // ===== FINGERPRINT =====
  async function handleFingerprintVerify() {
    if (!fingerprintStudentId) return;
    setFingerprintStatus('verifying');
    setError('');
    try {
      const options = await apiRequest(`/fingerprint/${fingerprintStudentId}/auth-options`, { token: user.token });
      const authResponse = await startAuthentication(options);
      const verifyResult = await apiRequest(`/fingerprint/${fingerprintStudentId}/auth-verify`, {
        method: 'POST',
        token: user.token,
        body: authResponse
      });

      if (verifyResult.verified) {
        await apiRequest('/attendance/mark-fingerprint', {
          method: 'POST',
          token: user.token,
          body: { studentId: fingerprintStudentId, date: selectedDate }
        });
        setFingerprintStatus('success');
        loadData();
      } else {
        setFingerprintStatus('failed');
      }
    } catch (err) {
      setFingerprintStatus('failed');
    }
  }

  function useManualFallback(student) {
    setFallbackStudent(student);
  }

  async function saveFallbackStatus(status) {
    try {
      await apiRequest('/attendance/mark', {
        method: 'POST',
        token: user.token,
        body: { studentId: fallbackStudent._id, status, date: selectedDate }
      });
      setFallbackStudent(null);
      setLastFaceResult(null);
      setFingerprintStatus('idle');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex-between">
        <div>
          <h2>Attendance</h2>
          <p className="text-muted" style={{ marginTop: 4 }}>Choose a method and mark attendance for {isToday ? 'today' : selectedDate}.</p>
        </div>
        <input className="form-input" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="card-title">Method</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {['manual', 'face', 'fingerprint'].map((m) => (
            <button
              key={m}
              className="btn"
              style={{
                padding: '8px 16px', fontSize: '0.85rem', textTransform: 'capitalize',
                background: method === m ? 'var(--color-accent)' : 'white',
                color: method === m ? 'white' : 'var(--color-text)',
                border: '1px solid var(--color-border)'
              }}
              onClick={() => { setMethod(m); setLastFaceResult(null); setFingerprintStatus('idle'); setFallbackStudent(null); }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {method === 'manual' && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>Mark Each Student</h3>
            <button className="btn btn-primary" onClick={handleSaveManual} disabled={saving}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
          {students.length === 0 ? (
            <p className="text-muted">Add students from the "Students" tab first.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Roll No</th><th>Current Status</th><th>Mark</th></tr></thead>
              <tbody>
                {students.map((s) => {
                  const existing = todaysRecords[s._id];
                  const pending = pendingStatus[s._id];
                  return (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>{s.rollNo}</td>
                      <td>
                        {existing ? (
                          <span className={`badge ${STATUS_BADGE[existing.status]}`}>{existing.status} · {existing.time}</span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Not marked</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn" style={{ padding: '6px 14px', fontSize: '0.82rem', background: pending === 'present' ? 'var(--color-accent)' : 'white', color: pending === 'present' ? 'white' : 'var(--color-text)', border: '1px solid var(--color-border)' }} onClick={() => setManualStatus(s._id, 'present')}>Present</button>
                          <button className="btn" style={{ padding: '6px 14px', fontSize: '0.82rem', background: pending === 'absent' ? 'var(--color-danger)' : 'white', color: pending === 'absent' ? 'white' : 'var(--color-text)', border: '1px solid var(--color-border)' }} onClick={() => setManualStatus(s._id, 'absent')}>Absent</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {method === 'face' && (
        <div className="card">
          <h3 className="card-title">Face Recognition</h3>
          {!faceModelsReady ? (
            <p className="text-muted">Loading face recognition models...</p>
          ) : (
            <>
              {!faceCameraActive && (
                <button className="btn btn-primary" onClick={() => setFaceCameraActive(true)}>Start Camera</button>
              )}
              {faceCameraActive && (
                <div>
                  <CameraCapture onVideoReady={handleFaceVideoReady} active={faceCameraActive} />
                  <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleScanFace} disabled={faceScanning}>
                    {faceScanning ? 'Scanning...' : 'Scan Face'}
                  </button>
                </div>
              )}

              {lastFaceResult?.matched && (
                <div className="success-banner" style={{ marginTop: 16 }}>
                  Marked present: {lastFaceResult.name} (Roll {lastFaceResult.rollNo})
                </div>
              )}

              {lastFaceResult && !lastFaceResult.matched && (
                <div className="error-banner" style={{ marginTop: 16 }}>
                  {lastFaceResult.reason === 'no_face' ? 'No face detected. Try again.' : 'No confident match found.'}
                  {' '}Please select the student and mark manually below.
                  <div style={{ marginTop: 10 }}>
                    <select className="form-select" onChange={(e) => useManualFallback(students.find((s) => s._id === e.target.value))} defaultValue="">
                      <option value="" disabled>Select student</option>
                      {students.map((s) => <option key={s._id} value={s._id}>{s.name} (Roll {s.rollNo})</option>)}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {method === 'fingerprint' && (
        <div className="card">
          <h3 className="card-title">Fingerprint</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
            Select the student, then have them confirm on this device's fingerprint sensor.
          </p>
          <select className="form-select" value={fingerprintStudentId} onChange={(e) => { setFingerprintStudentId(e.target.value); setFingerprintStatus('idle'); }}>
            <option value="">-- Select student --</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name} (Roll {s.rollNo})</option>)}
          </select>

          {fingerprintStudentId && (
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleFingerprintVerify} disabled={fingerprintStatus === 'verifying'}>
              {fingerprintStatus === 'verifying' ? 'Waiting for fingerprint...' : 'Verify Fingerprint'}
            </button>
          )}

          {fingerprintStatus === 'success' && (
            <div className="success-banner" style={{ marginTop: 16 }}>Attendance marked successfully.</div>
          )}

          {fingerprintStatus === 'failed' && (
            <div className="error-banner" style={{ marginTop: 16 }}>
              Fingerprint could not be verified. Please mark manually below.
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-secondary" onClick={() => useManualFallback(students.find((s) => s._id === fingerprintStudentId))}>
                  Mark Manually for This Student
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {fallbackStudent && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setFallbackStudent(null)}
        >
          <div className="card" style={{ maxWidth: 380, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 10 }}>Mark {fallbackStudent.name}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => saveFallbackStatus('present')}>Present</button>
              <button className="btn btn-danger" style={{ background: 'var(--color-danger)', color: 'white', border: 'none' }} onClick={() => saveFallbackStatus('absent')}>Absent</button>
              <button className="btn btn-secondary" onClick={() => setFallbackStudent(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
