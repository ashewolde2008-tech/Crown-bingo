import { getAuth } from 'firebase/auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function apiPost(endpoint, data) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed');
  return json;
}

async function apiPatch(endpoint, data) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed');
  return json;
}

async function apiGet(endpoint) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed');
  return json;
}

async function apiDelete(endpoint) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed');
  return json;
}

export { apiPost, apiPatch, apiGet, apiDelete };
