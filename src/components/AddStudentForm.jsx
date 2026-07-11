import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';
import { useCurriculum, getStreamsForClass } from '../utils/useCurriculum';
import CameraCapture, { captureFrameFromVideo } from './CameraCapture';
import { loadFaceModels, extractFaceDescriptor } from '../utils/faceApiLoader';
import { startRegistration } from '@simplewebauthn/browser';

export default function AddStudentForm({ onStudentAdded }) {
  const { user } = useAuth();
  const { curriculum } = useCurriculum(user.token);

  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [stream, setStream] = useState('');
  const [subGroup, setSubGroup] = useState('');
  const [elective, setElective] = useState('');

  const [cameraActive, setCameraActive] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const videoRef = useRef(null);

  const [fingerprintStatus, setFingerprintStatus] = useState('idle'); // idle | enrolling | done | failed | skipped
  const [newStudentId, setNewStudentId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { username, password, name }
  const [loading, setLoading] = useState(false);

  const streams = getStreamsForClass(curriculum, Number(classNumber));
  const selectedStreamConfig = streams[stream];

  // Reset downstream selections whenever an upstream one changes
  useEffect(() => { setStream(''); setSubGroup(''); setElective(''); }, [classNumber]);
  useEffect(() => { setSubGroup(''); setElective(''); }, [stream]);

  function handleVideoReady(videoElement) {
    videoRef.current = videoElement;
  }

  function handleCapturePhoto() {
    const dataUrl = captureFrameFromVideo(videoRef.current);
    if (dataUrl) {
      setPhotoDataUrl(dataUrl);
      setCameraActive(false);
    }
  }

  function handleRetakePhoto() {
    setPhotoDataUrl(null);
    setCameraActive(true);
  }

  // Fingerprint enrollment happens AFTER the student is created (needs a real
  // student ID from the backend to register the WebAuthn credential against).
  async function enrollFingerprint(studentId) {
    setFingerprintStatus('enrolling');
    try {
      const options = await apiRequest(`/fingerprint/${studentId}/register-options`, { token: user.token });
      const registrationResponse = await startRegistration(options);
      await apiRequest(`/fingerprint/${studentId}/register-verify`, {
        method: 'POST',
        token: user.token,
        body: registrationResponse
      });
      setFingerprintStatus('done');
    } catch (err) {
      setFingerprintStatus('failed');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const body = {
        name, fatherName, contactNumber,
        classNumber: Number(classNumber),
        stream,
        subGroup: subGroup || null,
        elective: elective || null
      };
      if (photoDataUrl) body.photoDataUrl = photoDataUrl;

      const data = await apiRequest('/students', { method: 'POST', token: user.token, body });

      setSuccess({ username: data.student.username, password: data.student.password, name: data.student.name });
      setNewStudentId(data.student.id);

      // Reset form fields (but keep the success message visible)
      setName(''); setFatherName(''); setContactNumber('');
      setClassNumber(''); setStream(''); setSubGroup(''); setElective('');
      setPhotoDataUrl(null);
      setFingerprintStatus('idle');

      if (onStudentAdded) onStudentAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 className="card-title">Add a New Student</h3>

      {error && <div className="error-banner">{error}</div>}

      {success ? (
        <div className="credential-box">
          Login credentials created for <strong>{success.name}</strong>:
          <div style={{ marginTop: 8 }}>
            Username: <code>{success.username}</code> &nbsp;&nbsp;
            Password: <code>{success.password}</code>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.85rem', marginBottom: 8 }}>
              Optional: enroll this student's fingerprint now for daily attendance (requires a fingerprint sensor on this device).
            </p>
            {fingerprintStatus === 'idle' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => enrollFingerprint(newStudentId)}
                >
                  Enroll Fingerprint Now
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setFingerprintStatus('skipped')}>
                  Skip for Now
                </button>
              </div>
            )}
            {fingerprintStatus === 'enrolling' && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Touch the fingerprint sensor now...</p>}
            {fingerprintStatus === 'done' && <p style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}>Fingerprint enrolled successfully.</p>}
            {fingerprintStatus === 'failed' && <p style={{ fontSize: '0.85rem', color: 'var(--color-danger)' }}>Enrollment failed or was cancelled. You can try again later from the student's Edit page.</p>}
            {fingerprintStatus === 'skipped' && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Skipped. You can enroll this later from the student's Edit page.</p>}
          </div>

          <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setSuccess(null); setNewStudentId(null); }}>
            Add Another Student
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Father's Name</label>
              <input className="form-input" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input className="form-input" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Class</label>
              <select className="form-select" value={classNumber} onChange={(e) => setClassNumber(e.target.value)} required>
                <option value="">Select class</option>
                <option value="9">9th</option>
                <option value="10">10th</option>
                <option value="11">11th</option>
                <option value="12">12th</option>
              </select>
            </div>

            {classNumber && (
              <div className="form-group">
                <label className="form-label">{Number(classNumber) <= 10 ? 'Stream' : 'Faculty'}</label>
                <select className="form-select" value={stream} onChange={(e) => setStream(e.target.value)} required>
                  <option value="">Select</option>
                  {Object.entries(streams).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            )}

            {stream && selectedStreamConfig?.subGroups && (
              <div className="form-group">
                <label className="form-label">Group</label>
                <select className="form-select" value={subGroup} onChange={(e) => setSubGroup(e.target.value)} required>
                  <option value="">Select</option>
                  {Object.entries(selectedStreamConfig.subGroups).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            )}

            {stream && selectedStreamConfig?.choice && (
              <div className="form-group">
                <label className="form-label">{selectedStreamConfig.choice.label}</label>
                <select className="form-select" value={elective} onChange={(e) => setElective(e.target.value)} required>
                  <option value="">Select</option>
                  {selectedStreamConfig.choice.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Photo (optional)</label>
            {!cameraActive && !photoDataUrl && (
              <button type="button" className="btn btn-secondary" onClick={() => setCameraActive(true)}>
                Open Camera
              </button>
            )}
            {cameraActive && (
              <div>
                <CameraCapture onVideoReady={handleVideoReady} active={cameraActive} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="button" className="btn btn-primary" onClick={handleCapturePhoto}>Capture Photo</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setCameraActive(false)}>Cancel</button>
                </div>
              </div>
            )}
            {photoDataUrl && (
              <div>
                <img src={photoDataUrl} alt="Captured" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)' }} />
                <div style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={handleRetakePhoto}>Retake Photo</button>
                </div>
              </div>
            )}
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 6 }}>
              You can skip this and add a photo later. A default avatar will be used until then.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      )}
    </div>
  );
}
