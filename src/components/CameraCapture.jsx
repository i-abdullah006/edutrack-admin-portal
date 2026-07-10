import { useRef, useEffect, useState } from 'react';

// A reusable camera view. Give it a ref via onVideoReady to run face-api.js
// against the live feed, or call captureFrame() to grab a still photo as a
// base64 JPEG data URL (used for the student's admission photo).
export default function CameraCapture({ onVideoReady, active = true }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          if (onVideoReady) onVideoReady(videoRef.current);
        }
      } catch (err) {
        setError('Could not access the camera. Please allow camera permission and try again.');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function captureFrame() {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  // Expose captureFrame to the parent via a global-ish trick: attach it to the video element itself
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.captureFrame = captureFrame;
    }
  });

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
      <video
        ref={videoRef}
        muted
        playsInline
        style={{
          width: '100%',
          borderRadius: 'var(--radius)',
          background: '#0F172A',
          transform: 'scaleX(-1)' // mirror, feels natural like a selfie camera
        }}
      />
      {!ready && (
        <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>
          Starting camera...
        </div>
      )}
    </div>
  );
}

// Helper used by parent components to grab the current frame from a video ref
export function captureFrameFromVideo(videoElement) {
  if (!videoElement) return null;
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9);
}
