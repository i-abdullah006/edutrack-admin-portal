# EduTrack - Admin Frontend

This is the admin-facing React app. It includes the admin dashboard (students,
attendance, marks, settings) as well as a student login/dashboard for backup
access - the primary way students log in is the separate `student-portal` project.

## Required Setup Steps

### 1. Set the backend URL

Open `src/api/config.js` and set your backend's URL:

```js
export const API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

(Currently set to `http://localhost:5000/api` for local testing.)

### 2. Download the face-api.js model files (required for Face Recognition attendance)

These are binary model weight files too large to include directly. Download them from the face-api.js weights repository and place them in `public/face-models/`:

```bash
cd public/face-models
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
```

If Face Recognition attendance isn't working, check the browser console for 404 errors on these files first - that means this step was skipped.

### 3. Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Important Notes

- **Fingerprint (WebAuthn) requires HTTPS in production.** It works on `http://localhost` for local testing only. Once deployed, your site must be served over HTTPS (Netlify/Vercel provide this automatically).
- **Face Recognition requires camera permission** in the browser - the admin's device needs a working camera.
- Both `attendance-frontend` and `student-portal` must point to the **same backend URL**.

## Deployment (Netlify or Vercel, both free)

### Netlify
1. Push this project to a GitHub repository
2. Netlify → "Add new site" → import the repo
3. Build command: `npm run build`, Publish directory: `dist`
4. Deploy

### Vercel
1. Push this project to a GitHub repository
2. Vercel → "Add New Project" → import the repo
3. Framework preset: Vite
4. Deploy

## Testing Checklist

1. Log in as admin
2. Go to Settings → set a Secret Password, and configure the curriculum pattern
3. Add a student (try with and without a photo)
4. Try Manual, Face, and Fingerprint attendance
5. Enter marks for a student, one subject at a time
6. Use the "View" button on a student to see their read-only preview
7. Remove a student and confirm the two-step confirmation and roll number swap work correctly
