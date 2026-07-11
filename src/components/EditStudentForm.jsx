import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../api/apiHelper';
import CameraCapture, { captureFrameFromVideo } from './CameraCapture';
import { resolvePhotoUrl } from '../api/config';
import { startRegistration } from '@simplewebauthn/browser';

export default function EditStudentForm({ student, onSaved, onCancel }) {
  const { user } = useAuth();
  const [name, setName] = useState(student.name);
  const [fatherName, setFatherName] = useState(student.fatherName);
  const [contactNumber, setContactNumber] = useState(student.contactNumber);

  const [cameraActive, setCameraActive] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const videoRef = useRef(null);

  const [fingerprintStatus, setFingerprintStatus] = useState('idle'); // idle | enrolling | done | failed
  const [fingerprintError, setFingerprintError] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  async function enrollFingerprint() {
    setFingerprintStatus('enrolling');
    setFingerprintError('');
    try {
      const options = await apiRequest(`/fingerprint/${student._id}/register-options`, { token: user.token });
      const registrationResponse = await startRegistration(options);
      await apiRequest(`/fingerprint/${student._id}/register-verify`, {
        method: 'POST',
        token: user.token,
        body: registrationResponse
      });
      setFingerprintStatus('done');
    } catch (err) {
      setFingerprintStatus('failed');
      setFingerprintError(err.message || 'Enrollment failed or was cancelled.');
    }
  }

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = { name, fatherName, contactNumber };
      if (photoDataUrl) body.photoDataUrl = photoDataUrl;

      const data = await apiRequest(`/students/${student._id}`, {
        method: 'PUT',
        token: user.token,
        body
      });

      setSuccess({ username: data.student.username, password: data.student.password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentPhotoSrc = student.hasCustomPhoto && student.photoUrl
    ? resolvePhotoUrl(student.photoUrl)
    : null;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 className="card-title">Edit Student</h3>

      {error && <div className="error-banner">{error}</div>}

      {success ? (
        <div className="credential-box">
          Details updated. New login credentials for this student:
          <div style={{ marginTop: 8 }}>
            Username: <code>{success.username}</code> &nbsp;&nbsp;
            Password: <code>{success.password}</code>
          </div>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 8 }}>
            The previous username and password no longer work.
          </p>
          <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={onSaved}>
            Done
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

          <div className="form-group">
            <label className="form-label">Photo</label>
            {!cameraActive && !photoDataUrl && (
              <div>
                {currentPhotoSrc && (
                  <img src={currentPhotoSrc} alt={student.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)', marginBottom: 8, display: 'block' }} />
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setCameraActive(true)}>
                  {currentPhotoSrc ? 'Retake Photo' : 'Add Photo'}
                </button>
              </div>
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
                <img src={photoDataUrl} alt="New capture" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)' }} />
                <div style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setPhotoDataUrl(null); setCameraActive(true); }}>Retake</button>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Fingerprint</label>
            <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 8 }}>
              {student.hasFingerprintEnrolled
                ? 'A fingerprint is already enrolled for this student. Enrolling again will replace it.'
                : 'No fingerprint enrolled yet. This requires a fingerprint sensor on this device.'}
            </p>
            {fingerprintStatus !== 'enrolling' && (
              <button type="button" className="btn btn-secondary" onClick={enrollFingerprint}>
                {student.hasFingerprintEnrolled ? 'Re-enroll Fingerprint' : 'Enroll Fingerprint'}
              </button>
            )}
            {fingerprintStatus === 'enrolling' && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Touch the fingerprint sensor now...</p>}
            {fingerprintStatus === 'done' && <p style={{ fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: 6 }}>Fingerprint enrolled successfully.</p>}
            {fingerprintStatus === 'failed' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-danger)', marginTop: 6 }}>
                {fingerprintError || 'Enrollment failed or was cancelled.'} Make sure this device has a fingerprint sensor and try again.
              </p>
            )}
          </div>

          <div className="error-banner" style={{ background: '#FFF7ED', color: '#C2410C', borderColor: '#FED7AA' }}>
            Saving will generate a new username and password for this student. The old ones will stop working.
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
