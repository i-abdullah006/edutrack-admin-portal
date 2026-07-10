// A central helper used to make every request to the backend.
// The auth token is attached to the header automatically when logged in.

import { API_BASE_URL } from './config';

async function apiRequest(endpoint, { method = 'GET', body = null, token = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  } catch (err) {
    // Network error - backend isn't running, or the URL is wrong
    throw new Error('Could not connect to the backend. Is the backend URL correct and the server running?');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
}

export default apiRequest;
