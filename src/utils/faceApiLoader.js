// Loads face-api.js models (once) and provides helpers to extract a face
// descriptor from a video element or image, used both for enrollment (when
// adding a student) and for daily face-recognition attendance.
//
// IMPORTANT SETUP STEP: the actual model weight files must be placed in
// /public/face-models/ before this will work. See README.md for the
// download instructions - they are not included in this project's source
// because they are large binary files better fetched directly.

import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadFaceModels() {
  if (modelsLoaded) return;
  const MODEL_URL = '/face-models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);
  modelsLoaded = true;
}

// Extracts a 128-number face descriptor from an image or video element.
// Returns null if no face was confidently detected.
export async function extractFaceDescriptor(mediaElement) {
  const detection = await faceapi
    .detectSingleFace(mediaElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return Array.from(detection.descriptor);
}

export function areModelsLoaded() {
  return modelsLoaded;
}
