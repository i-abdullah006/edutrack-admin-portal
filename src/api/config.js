// =========================================================
// SET YOUR BACKEND URL HERE once it's deployed on Render.com
// Until then, this points to your local backend for testing
// =========================================================

export const API_BASE_URL = 'http://localhost:5000/api';

// After deployment, change it like this:
// export const API_BASE_URL = 'https://your-app-name.onrender.com/api';

// Derived automatically - the backend's root URL (without /api), used to
// resolve relative paths like student photos (e.g. "/uploads/students/x.jpg")
// into full URLs the browser can load.
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolvePhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http')) return photoUrl;
  return `${BACKEND_ORIGIN}${photoUrl}`;
}
